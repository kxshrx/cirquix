from pydantic import BaseModel
from typing import List, Optional


class Product(BaseModel):
    product_id: str
    title: str
    category: str
    price: Optional[str] = None
    rating: Optional[float] = None
    rating_count: Optional[int] = None
    image_url: Optional[str] = None
    description: Optional[str] = None


class User(BaseModel):
    user_id: str
    interaction_count: int


class UserHistory(BaseModel):
    product_id: str
    title: str
    rating: float
    timestamp: Optional[str] = None


class Recommendation(BaseModel):
    product_id: str
    title: str
    category: str
    price: Optional[str] = None
    rating: Optional[float] = None
    confidence: float
    explanation: str


class RecommendationResponse(BaseModel):
    user_id: str
    strategy: str
    recommendations: List[Recommendation]


class UserResponse(BaseModel):
    user_id: str
    interaction_count: int
    history: List[UserHistory]


class RelatedProductsResponse(BaseModel):
    product_id: str
    related_products: List[Product]


class ErrorResponse(BaseModel):
    detail: str
    error_code: int