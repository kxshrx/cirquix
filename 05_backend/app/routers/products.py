from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional
from ..models.schemas import Product, ErrorResponse
from ..services.db import DatabaseService

router = APIRouter(prefix="/products", tags=["products"])


def get_db_service():
    db_path = "/Users/kxshrx/asylum/cirquix/03_database_setup/recommendation.db"
    return DatabaseService(db_path)


@router.get("/", response_model=dict)
async def get_products_catalog(
    limit: int = Query(50, ge=1, le=100, description="Number of products to return"),
    offset: int = Query(0, ge=0, description="Number of products to skip"),
    search: Optional[str] = Query(None, description="Search query for product title"),
    category: Optional[str] = Query(None, description="Filter by category"),
    db: DatabaseService = Depends(get_db_service)
):
    """Get products catalog with pagination, search, and filtering"""
    
    try:
        products = db.get_products_catalog(
            limit=limit, 
            offset=offset, 
            search=search, 
            category=category
        )
        
        total_count = db.get_products_count(search=search, category=category)
        
        return {
            "products": [Product(**product).dict() for product in products],
            "total": total_count,
            "limit": limit,
            "offset": offset,
            "has_more": offset + limit < total_count
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch products: {str(e)}")


@router.get("/categories", response_model=List[str])
async def get_categories(db: DatabaseService = Depends(get_db_service)):
    """Get all available product categories"""
    
    try:
        categories = db.get_categories()
        return categories
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch categories: {str(e)}")


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