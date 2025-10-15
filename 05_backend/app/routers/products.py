from fastapi import APIRouter, HTTPException, Depends
from typing import List
from ..models.schemas import Product, ErrorResponse
from ..services.db import DatabaseService

router = APIRouter(prefix="/products", tags=["products"])


def get_db_service():
    db_path = "/Users/kxshrx/asylum/cirquix/03_database_setup/recommendation.db"
    return DatabaseService(db_path)


@router.get("/{product_id}", response_model=Product)
async def get_product(product_id: str, db: DatabaseService = Depends(get_db_service)):
    """Get detailed product information by product ID"""
    
    if not product_id or len(product_id.strip()) == 0:
        raise HTTPException(status_code=400, detail="Product ID cannot be empty")
    
    product = db.get_product(product_id)
    
    if not product:
        raise HTTPException(
            status_code=404, 
            detail=f"Product not found: {product_id}"
        )
    
    return Product(**product)


@router.get("/{product_id}/related", response_model=List[Product])
async def get_related_products(
    product_id: str, 
    limit: int = 5,
    db: DatabaseService = Depends(get_db_service)
):
    """Get products related to the given product ID"""
    
    if not db.product_exists(product_id):
        raise HTTPException(
            status_code=404,
            detail=f"Product not found: {product_id}"
        )
    
    if limit < 1 or limit > 20:
        raise HTTPException(
            status_code=400,
            detail="Limit must be between 1 and 20"
        )
    
    related_products = db.get_related_products(product_id, limit)
    
    return [Product(**product) for product in related_products]