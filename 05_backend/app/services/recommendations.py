import os
import sys
import pickle
import pandas as pd
from typing import List, Dict, Any, Optional
from pathlib import Path

try:
    from .hybrid_recommender import HybridRecommendationSystem
    from .llm_integration import get_llm_explanation
except ImportError:
    print("Warning: Could not import HybridRecommendationSystem or LLM integration")
    HybridRecommendationSystem = None
    get_llm_explanation = None


class RecommendationService:
    def __init__(self, model_dir: str):
        self.model_dir = model_dir
        self.recommender = None
        self._load_models()
    
    def _load_models(self):
        try:
            # Copy the hybrid recommender file to services directory
            recommender_path = os.path.join(self.model_dir, "2_hybrid_recommender.py")
            if not os.path.exists(recommender_path):
                raise FileNotFoundError(f"Hybrid recommender not found: {recommender_path}")
            
            # Import and initialize the recommendation system
            if HybridRecommendationSystem:
                self.recommender = HybridRecommendationSystem(self.model_dir)
                print("Recommendation models loaded successfully")
            else:
                print("Warning: HybridRecommendationSystem not available")
        
        except Exception as e:
            print(f"Error loading recommendation models: {e}")
            self.recommender = None
    
    def get_recommendations(self, user_id: str, num_recommendations: int = 5, use_llm: bool = True, user_history: List[Dict] = None) -> Dict[str, Any]:
        if not self.recommender:
            return self._get_fallback_recommendations(user_id, num_recommendations, use_llm, user_history)
        
        try:
            # Get recommendations from hybrid system
            recommendations = self.recommender.get_recommendations(
                user_id=user_id,
                top_k=num_recommendations,
                include_metadata=True
            )
            
            # Format response
            formatted_recs = []
            for rec in recommendations:
                formatted_recs.append({
                    "product_id": rec["product_id"],
                    "title": rec.get("title", "Product Title"),
                    "category": rec.get("category", "Electronics"),
                    "price": rec.get("price", None),
                    "rating": rec.get("rating", None),
                    "confidence": rec["confidence"],
                    "explanation": self._generate_explanation(rec)
                })
            
            # Generate LLM explanations if enabled and available
            if use_llm and get_llm_explanation and formatted_recs:
                try:
                    llm_explanations = get_llm_explanation(user_id, formatted_recs, user_history)
                    # Update recommendations with LLM explanations
                    for rec, llm_exp in zip(formatted_recs, llm_explanations):
                        if rec["product_id"] == llm_exp["product_id"]:
                            rec["explanation"] = llm_exp["explanation"]
                except Exception as e:
                    print(f"LLM explanation failed, using fallback: {e}")
            
            return {
                "user_id": user_id,
                "strategy": recommendations[0].get("strategy", "hybrid") if recommendations else "fallback",
                "recommendations": formatted_recs
            }
        
        except Exception as e:
            print(f"Error getting recommendations: {e}")
            return self._get_fallback_recommendations(user_id, num_recommendations, use_llm, user_history)
    
    def _get_fallback_recommendations(self, user_id: str, num_recommendations: int, use_llm: bool = True, user_history: List[Dict] = None) -> Dict[str, Any]:
        # Simple fallback recommendations
        fallback_products = [
            {
                "product_id": "B01K8B8YA8",
                "title": "Echo Dot Smart Speaker",
                "category": "Amazon Devices",
                "price": "49.99",
                "rating": 4.5,
                "confidence": 0.5,
                "explanation": "Popular product recommendation"
            },
            {
                "product_id": "B075X8471B",
                "title": "Fire TV Stick",
                "category": "Amazon Devices", 
                "price": "39.99",
                "rating": 4.5,
                "confidence": 0.4,
                "explanation": "Trending electronics product"
            }
        ]
        
        selected_products = fallback_products[:num_recommendations]
        
        # Generate LLM explanations for fallback if enabled
        if use_llm and get_llm_explanation and selected_products:
            try:
                llm_explanations = get_llm_explanation(user_id, selected_products, user_history)
                # Update fallback with LLM explanations
                for rec, llm_exp in zip(selected_products, llm_explanations):
                    if rec["product_id"] == llm_exp["product_id"]:
                        rec["explanation"] = llm_exp["explanation"]
            except Exception as e:
                print(f"LLM explanation failed for fallback: {e}")
        
        return {
            "user_id": user_id,
            "strategy": "fallback",
            "recommendations": selected_products
        }
    
    def _generate_explanation(self, recommendation: Dict[str, Any]) -> str:
        strategy = recommendation.get("strategy", "unknown")
        category = recommendation.get("category", "product")
        
        explanations = {
            "als_collaborative": f"Recommended based on users with similar preferences in {category}",
            "hybrid_fallback": f"Popular {category} product recommended for you",
            "popularity": f"Trending {category} product with high ratings",
            "category_based": f"Recommended based on your interest in {category} products"
        }
        
        return explanations.get(strategy, "Recommended product based on your preferences")
    
    def is_available(self) -> bool:
        return self.recommender is not None