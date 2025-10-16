from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional
from ..services.llm_integration import get_llm_explanation, get_llm_service_status, explain_recommendation_strategy

router = APIRouter(prefix="/llm", tags=["LLM Explanations"])


class ExplanationRequest(BaseModel):
    user_id: str
    recommendations: List[Dict]
    user_history: Optional[List[Dict]] = None


class ExplanationResponse(BaseModel):
    user_id: str
    explanations: List[Dict]


class StrategyExplanationRequest(BaseModel):
    strategy: str
    user_history_size: int


@router.post("/explain", response_model=ExplanationResponse)
async def explain_recommendations(request: ExplanationRequest):
    """
    Generate LLM-based explanations for product recommendations.
    
    Request body should contain:
    - user_id: String identifier for the user
    - recommendations: List of recommendation objects with product_id, title, category, rating
    - user_history: Optional list of user's previous purchases/interactions
    
    Returns explanations with product_id and explanation text for each recommendation.
    """
    
    if not request.recommendations:
        raise HTTPException(status_code=400, detail="Recommendations list cannot be empty")
    
    try:
        explanations = get_llm_explanation(
            user_id=request.user_id,
            recommendations=request.recommendations,
            user_history=request.user_history
        )
        
        return ExplanationResponse(
            user_id=request.user_id,
            explanations=explanations
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating explanations: {str(e)}"
        )


@router.post("/explain-strategy")
async def explain_strategy(request: StrategyExplanationRequest):
    """Explain the recommendation strategy used."""
    try:
        explanation = explain_recommendation_strategy(
            strategy=request.strategy,
            user_history_size=request.user_history_size
        )
        
        return {
            "strategy": request.strategy,
            "explanation": explanation,
            "user_history_size": request.user_history_size
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error explaining strategy: {str(e)}"
        )


@router.get("/status")
async def llm_service_status():
    """Check the status of the LLM explanation service."""
    try:
        status = get_llm_service_status()
        return status
        
    except Exception as e:
        return {
            "service": "LLM Explanation Service",
            "status": "error",
            "error": str(e)
        }