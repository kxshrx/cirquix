from fastapi import APIRouter, HTTPException, Depends
from ..models.schemas import UserResponse, UserHistory
from ..services.db import DatabaseService

router = APIRouter(prefix="/users", tags=["users"])


def get_db_service():
    db_path = "/Users/kxshrx/asylum/cirquix/03_database_setup/recommendation.db"
    return DatabaseService(db_path)


@router.get("/{user_id}", response_model=UserResponse)
async def get_user_info(user_id: str, db: DatabaseService = Depends(get_db_service)):
    """Get user information and interaction history"""
    
    if not user_id or len(user_id.strip()) == 0:
        raise HTTPException(status_code=400, detail="User ID cannot be empty")
    
    user_info = db.get_user_info(user_id)
    
    if not user_info:
        raise HTTPException(
            status_code=404,
            detail=f"User not found: {user_id}"
        )
    
    user_history = db.get_user_history(user_id, limit=20)
    
    return UserResponse(
        user_id=user_info["user_id"],
        interaction_count=user_info["interaction_count"],
        history=[UserHistory(**item) for item in user_history]
    )