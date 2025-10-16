from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os

from .routers import products, users, recommendations, llm
from .services.recommendations import RecommendationService

# Global recommendation service instance
rec_service = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    global rec_service
    # Use relative path that works both locally and on Render
    from pathlib import Path
    backend_dir = Path(__file__).parent.parent
    model_dir = str(backend_dir.parent / "04_recommendation_model")
    rec_service = RecommendationService(model_dir)
    print(f"Application startup complete. Model dir: {model_dir}")
    
    yield
    
    # Shutdown
    print("Application shutdown")


app = FastAPI(
    title="E-commerce Recommendation API",
    description="REST API for product recommendations and metadata",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS - Allow both local development and Render deployment
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "https://cirquix-frontend.onrender.com",
        "*"  # Fallback for other origins during development
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Include routers
app.include_router(products.router)
app.include_router(users.router)
app.include_router(recommendations.router)
app.include_router(llm.router)


@app.get("/")
async def root():
    return {
        "message": "E-commerce Recommendation API",
        "version": "1.0.0",
        "features": ["Product Info", "User History", "Recommendations", "LLM Explanations"],
        "endpoints": [
            "/products/{product_id}",
            "/products/{product_id}/related",
            "/users/{user_id}",
            "/recommendations/{user_id}",
            "/llm/explain",
            "/llm/status"
        ]
    }


@app.get("/health")
async def health_check():
    global rec_service
    return {
        "status": "healthy",
        "recommendation_service": "available" if rec_service and rec_service.is_available() else "unavailable"
    }