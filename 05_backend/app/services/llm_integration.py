"""
LLM Integration Service for Recommendation Explanations
Provides structured explanations for product recommendations.
"""

from typing import List, Dict, Any, Optional
import json


def get_llm_explanation(user_id: str, recommendations: List[Dict], user_history: Optional[List[Dict]] = None) -> List[Dict]:
    """
    Generate structured LLM explanations for recommendations.
    
    Args:
        user_id: User identifier
        recommendations: List of recommended products with metadata
        user_history: Optional user purchase history for context
    
    Returns:
        List of explanations with product_id and explanation text
    """
    
    explanations = []
    
    for i, rec in enumerate(recommendations):
        product_id = rec.get("product_id", "")
        title = rec.get("title", "Unknown Product")
        category = rec.get("category", "Unknown")
        confidence = rec.get("confidence", 0)
        rating = rec.get("rating", 0)
        
        # Generate contextual explanation based on available data
        explanation = _generate_contextual_explanation(
            user_id=user_id,
            product_title=title,
            category=category,
            confidence=confidence,
            rating=rating,
            rank=i + 1,
            user_history=user_history
        )
        
        explanations.append({
            "product_id": product_id,
            "explanation": explanation
        })
    
    return explanations


def _generate_contextual_explanation(
    user_id: str,
    product_title: str,
    category: str,
    confidence: float,
    rating: float,
    rank: int,
    user_history: Optional[List[Dict]] = None
) -> str:
    """Generate a contextual explanation for a product recommendation."""
    
    # Analyze user history for context
    history_context = ""
    if user_history and len(user_history) > 0:
        categories_bought = [item.get("title", "").split()[0] for item in user_history[:3]]
        if categories_bought:
            history_context = f"Based on your recent purchases of {', '.join(categories_bought[:2])}, "
    
    # Confidence-based explanations
    if confidence > 0.8:
        confidence_text = "highly recommended"
    elif confidence > 0.6:
        confidence_text = "strongly recommended"
    elif confidence > 0.4:
        confidence_text = "recommended"
    else:
        confidence_text = "suggested"
    
    # Rating-based context
    rating_text = ""
    if rating >= 4.5:
        rating_text = " This top-rated product has excellent customer reviews."
    elif rating >= 4.0:
        rating_text = " This well-rated product is popular among customers."
    elif rating >= 3.5:
        rating_text = " This product has good customer feedback."
    
    # Category-specific explanations
    category_explanations = {
        "Electronics": "perfect for tech enthusiasts looking for quality electronics",
        "Books": "great addition to your reading collection",
        "Home & Kitchen": "ideal for enhancing your home experience",
        "Sports & Outdoors": "excellent choice for active lifestyle",
        "Clothing": "stylish option that matches current trends",
        "Tools & Home Improvement": "practical tool for your projects"
    }
    
    category_text = category_explanations.get(category, f"quality {category.lower()} product")
    
    # Rank-based positioning
    rank_text = ""
    if rank == 1:
        rank_text = "Our top recommendation: "
    elif rank == 2:
        rank_text = "Another excellent choice: "
    elif rank <= 3:
        rank_text = "Also recommended: "
    
    # Combine elements into coherent explanation
    explanation = f"{rank_text}{history_context}this {product_title} is {confidence_text} as a {category_text}.{rating_text}"
    
    # Ensure explanation is properly capitalized
    explanation = explanation[0].upper() + explanation[1:] if explanation else "Recommended for you."
    
    return explanation


def get_llm_service_status() -> Dict[str, Any]:
    """Get the status of the LLM service."""
    return {
        "service": "LLM Explanation Service",
        "status": "active",
        "type": "rule-based",
        "features": [
            "Contextual explanations",
            "User history integration",
            "Confidence-based messaging",
            "Category-specific insights"
        ],
        "version": "1.0.0"
    }


def explain_recommendation_strategy(strategy: str, user_history_size: int) -> str:
    """Explain the recommendation strategy used."""
    
    strategy_explanations = {
        "als_collaborative": f"Using collaborative filtering based on {user_history_size} items in your history and users with similar preferences.",
        "hybrid_fallback": f"Using popularity and category-based recommendations (user has {user_history_size} items in history).",
        "popularity": "Showing trending and popular products across all users.",
        "category_based": "Recommendations based on product categories you've shown interest in.",
        "fallback": "Showing general popular recommendations."
    }
    
    return strategy_explanations.get(strategy, "Personalized recommendations selected for you.")

import os
import requests
import json
from typing import List, Dict, Optional, Any
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
DEFAULT_MODEL = "llama-3.1-8b-instant"  # Using current Llama 3.1 model


class LLMExplanationService:
    """Service for generating LLM-based recommendation explanations."""
    
    def __init__(self, api_key: str = None):
        self.api_key = api_key or GROQ_API_KEY
        if not self.api_key:
            print("Warning: GROQ_API_KEY not found. LLM explanations will use fallback.")
    
    def build_prompt(self, user_id: str, recommendations: List[Dict], user_history: List[Dict] = None) -> str:
        """Build a structured prompt for generating explanations."""
        
        # Extract user context from history
        if user_history and len(user_history) > 0:
            categories = [item.get('category', 'Electronics') for item in user_history[:5]]
            products = [item.get('title', '')[:50] + '...' if len(item.get('title', '')) > 50 
                       else item.get('title', '') for item in user_history[:3]]
            user_context = f"categories like {', '.join(set(categories))} and products like {', '.join(products)}"
        else:
            user_context = "electronic products and smart devices"
        
        # Format recommendations
        products_text = ""
        for i, rec in enumerate(recommendations, 1):
            products_text += f"{i}. {rec['title']} - {rec['category']} (Rating: {rec.get('rating', 'N/A')})\n"
        
        prompt = f"""You are an e-commerce recommendation assistant. Generate concise, personalized explanations for why each product is recommended.

User's purchase history shows interest in: {user_context}

Recommended products:
{products_text}

For each product, write exactly ONE sentence explaining why it's recommended based on the user's interests. Focus on:
- Category relevance to user's history
- Product quality (rating)
- Complementary features
- Popular choices

Format: Return exactly {len(recommendations)} explanations, one per line, in the same order as the products listed above.
Keep each explanation under 25 words and make them sound natural and helpful."""
        
        return prompt
    
    def call_groq_api(self, prompt: str) -> str:
        """Make API call to Groq for text generation."""
        
        if not self.api_key:
            return self._generate_fallback_explanations(prompt)
        
        try:
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            
            payload = {
                "model": DEFAULT_MODEL,
                "messages": [
                    {
                        "role": "system", 
                        "content": "You are a helpful e-commerce recommendation assistant. Generate concise, personalized product explanations."
                    },
                    {
                        "role": "user", 
                        "content": prompt
                    }
                ],
                "temperature": 0.7,
                "max_tokens": 300,
                "top_p": 0.9
            }
            
            response = requests.post(GROQ_API_URL, headers=headers, json=payload, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                return data["choices"][0]["message"]["content"].strip()
            else:
                print(f"Groq API error: {response.status_code} - {response.text}")
                return self._generate_fallback_explanations(prompt)
                
        except Exception as e:
            print(f"Error calling Groq API: {e}")
            return self._generate_fallback_explanations(prompt)
    
    def _generate_fallback_explanations(self, prompt: str) -> str:
        """Generate simple fallback explanations when API is unavailable."""
        # Extract number of products from prompt
        lines = prompt.split('\n')
        product_lines = [line for line in lines if line.strip() and line[0].isdigit()]
        
        fallback_explanations = []
        for line in product_lines:
            if 'Amazon Devices' in line:
                fallback_explanations.append("Recommended smart device that complements your tech preferences.")
            elif 'Computer' in line or 'Electronics' in line:
                fallback_explanations.append("High-quality electronics product matching your interests.")
            elif 'Audio' in line or 'Headphone' in line:
                fallback_explanations.append("Popular audio product with excellent user ratings.")
            else:
                fallback_explanations.append("Recommended based on your purchase history and preferences.")
        
        return '\n'.join(fallback_explanations)
    
    def get_llm_explanation(self, user_id: str, recommendations: List[Dict], user_history: List[Dict] = None) -> List[Dict]:
        """
        Generate natural language explanations for product recommendations.
        
        Args:
            user_id: User identifier
            recommendations: List of recommendation dicts with product_id, title, category, rating
            user_history: Optional list of user's previous purchases/interactions
            
        Returns:
            List of dicts containing product_id and generated explanation
        """
        
        if not recommendations:
            return []
        
        try:
            # Build prompt
            prompt = self.build_prompt(user_id, recommendations, user_history)
            
            # Get LLM response
            llm_response = self.call_groq_api(prompt)
            
            # Parse explanations
            explanation_lines = [line.strip() for line in llm_response.split('\n') if line.strip()]
            
            # Match explanations to products
            explanations = []
            for i, rec in enumerate(recommendations):
                if i < len(explanation_lines):
                    # Clean up explanation text
                    explanation = explanation_lines[i]
                    # Remove any numbering or bullet points
                    explanation = explanation.lstrip('123456789.- ')
                    explanations.append({
                        "product_id": rec["product_id"],
                        "explanation": explanation
                    })
                else:
                    # Fallback for missing explanations
                    explanations.append({
                        "product_id": rec["product_id"],
                        "explanation": "Recommended based on your preferences and product quality."
                    })
            
            return explanations
            
        except Exception as e:
            print(f"Error generating LLM explanations: {e}")
            # Return simple fallback explanations
            return [
                {
                    "product_id": rec["product_id"], 
                    "explanation": f"Recommended {rec.get('category', 'product')} based on your interests."
                }
                for rec in recommendations
            ]
    
    def is_available(self) -> bool:
        """Check if LLM service is available."""
        return self.api_key is not None


# Global instance
llm_service = LLMExplanationService()


def get_llm_explanation(user_id: str, recommendations: List[Dict], user_history: List[Dict] = None) -> List[Dict]:
    """Convenience function for getting LLM explanations."""
    return llm_service.get_llm_explanation(user_id, recommendations, user_history)