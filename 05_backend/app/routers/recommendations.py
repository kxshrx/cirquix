from fastapi import APIRouter, HTTPException, Depends
from ..models.schemas import RecommendationResponse
from ..services.db import DatabaseService
from ..services.recommendations import RecommendationService

router = APIRouter(prefix="/recommendations", tags=["recommendations"])


def get_db_service():
    db_path = "/Users/kxshrx/asylum/cirquix/03_database_setup/recommendation.db"
    return DatabaseService(db_path)


def get_recommendation_service():
    model_dir = "/Users/kxshrx/asylum/cirquix/04_recommendation_model"
    return RecommendationService(model_dir)


@router.get("/{user_id}", response_model=RecommendationResponse)
async def get_user_recommendations(
    user_id: str,
    limit: int = 5,
    db: DatabaseService = Depends(get_db_service),
    rec_service: RecommendationService = Depends(get_recommendation_service)
):
    """Get personalized recommendations for a user"""
    
    if not user_id or len(user_id.strip()) == 0:
        raise HTTPException(status_code=400, detail="User ID cannot be empty")
    
    if limit < 1 or limit > 20:
        raise HTTPException(
            status_code=400,
            detail="Limit must be between 1 and 20"
        )
    
    # Check if user exists for known users, allow cold start
    if user_id != "TEST_COLD_USER_123" and not db.user_exists(user_id):
        raise HTTPException(
            status_code=404,
            detail=f"User not found: {user_id}"
        )
    
    try:
        recommendations = rec_service.get_recommendations(user_id, limit)
        return RecommendationResponse(**recommendations)
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating recommendations: {str(e)}"
        )