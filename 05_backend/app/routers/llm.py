from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional
from ..services.llm_integration import get_llm_explanation

router = APIRouter(prefix="/llm", tags=["LLM Explanations"])


class ExplanationRequest(BaseModel):
    user_id: str
    recommendations: List[Dict]
    user_history: Optional[List[Dict]] = None


class ExplanationResponse(BaseModel):
    user_id: str
    explanations: List[Dict]


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


@router.get("/status")
async def llm_service_status():
    """Check the status of the LLM explanation service."""
    from ..services.llm_integration import llm_service
    
    return {
        "service": "LLM Explanation Service",
        "status": "available" if llm_service.is_available() else "unavailable",
        "api_key_configured": llm_service.api_key is not None,
        "fallback_mode": not llm_service.is_available()
    }