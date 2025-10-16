from fastapi import APIRouter, HTTPException, Depends
from ..models.schemas import RecommendationResponse
from ..services.db import DatabaseService
from ..services.recommendations import RecommendationService

router = APIRouter(prefix="/recommendations", tags=["recommendations"])


def get_db_service():
    from pathlib import Path
    # Use relative path that works both locally and on Render
    backend_dir = Path(__file__).parent.parent.parent
    db_path = str(backend_dir.parent / "03_database_setup" / "recommendation.db")
    return DatabaseService(db_path)


def get_recommendation_service():
    from pathlib import Path
    backend_dir = Path(__file__).parent.parent.parent
    model_dir = str(backend_dir.parent / "04_recommendation_model")
    return RecommendationService(model_dir)


@router.get("/{user_id}", response_model=RecommendationResponse)
async def get_user_recommendations(
    user_id: str,
    limit: int = 5,
    use_llm: bool = True,
    db: DatabaseService = Depends(get_db_service),
    rec_service: RecommendationService = Depends(get_recommendation_service)
):
    """Get personalized recommendations for a user with optional LLM explanations"""
    
    if not user_id or len(user_id.strip()) == 0:
        raise HTTPException(status_code=400, detail="User ID cannot be empty")
    
    if limit < 1 or limit > 20:
        raise HTTPException(
            status_code=400,
            detail="Limit must be between 1 and 20"
        )
    
    # Get user history for LLM context if user exists
    user_history = None
    if use_llm:
        try:
            if db.user_exists(user_id):
                user_history = db.get_user_history(user_id, limit=10)
            else:
                # Cold start user - no history available
                user_history = []
        except Exception as e:
            print(f"Error fetching user history: {e}")
            user_history = []
    
    try:
        recommendations = rec_service.get_recommendations(
            user_id, 
            limit, 
            use_llm=use_llm, 
            user_history=user_history
        )
        return RecommendationResponse(**recommendations)
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating recommendations: {str(e)}"
        )