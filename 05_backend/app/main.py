from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os

from .routers import products, users, recommendations
from .services.recommendations import RecommendationService

# Global recommendation service instance
rec_service = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    global rec_service
    model_dir = "/Users/kxshrx/asylum/cirquix/04_recommendation_model"
    rec_service = RecommendationService(model_dir)
    print("Application startup complete")
    
    yield
    
    # Shutdown
    print("Application shutdown")


app = FastAPI(
    title="E-commerce Recommendation API",
    description="REST API for product recommendations and metadata",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(products.router)
app.include_router(users.router)
app.include_router(recommendations.router)


@app.get("/")
async def root():
    return {
        "message": "E-commerce Recommendation API",
        "version": "1.0.0",
        "endpoints": [
            "/products/{product_id}",
            "/products/{product_id}/related",
            "/users/{user_id}",
            "/recommendations/{user_id}"
        ]
    }


@app.get("/health")
async def health_check():
    global rec_service
    return {
        "status": "healthy",
        "recommendation_service": "available" if rec_service and rec_service.is_available() else "unavailable"
    }