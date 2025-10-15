import sqlite3
import pandas as pd
from typing import List, Dict, Optional, Any
import os


class DatabaseService:
    def __init__(self, db_path: str):
        self.db_path = db_path
        self._check_connection()
    
    def _check_connection(self):
        if not os.path.exists(self.db_path):
            raise FileNotFoundError(f"Database not found: {self.db_path}")
    
    def get_connection(self):
        return sqlite3.connect(self.db_path)
    
    def get_product(self, product_id: str) -> Optional[Dict[str, Any]]:
        query = """
        SELECT parent_asin, title, main_category, price, average_rating 
        FROM products 
        WHERE parent_asin = ?
        """
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(query, (product_id,))
            result = cursor.fetchone()
            
            if result:
                return {
                    "product_id": result[0],
                    "title": result[1],
                    "category": result[2],
                    "price": result[3],
                    "rating": result[4],
                    "image_url": None
                }
            return None
    
    def get_user_info(self, user_id: str) -> Optional[Dict[str, Any]]:
        query = """
        SELECT user_id, COUNT(*) as interaction_count
        FROM interactions 
        WHERE user_id = ?
        GROUP BY user_id
        """
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(query, (user_id,))
            result = cursor.fetchone()
            
            if result:
                return {
                    "user_id": result[0],
                    "interaction_count": result[1]
                }
            return None
    
    def get_user_history(self, user_id: str, limit: int = 20) -> List[Dict[str, Any]]:
        query = """
        SELECT i.parent_asin, p.title, i.rating, i.timestamp
        FROM interactions i
        JOIN products p ON i.parent_asin = p.parent_asin
        WHERE i.user_id = ?
        ORDER BY i.timestamp DESC
        LIMIT ?
        """
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(query, (user_id, limit))
            results = cursor.fetchall()
            
            return [
                {
                    "product_id": row[0],
                    "title": row[1],
                    "rating": row[2],
                    "timestamp": row[3]
                }
                for row in results
            ]
    
    def get_related_products(self, product_id: str, limit: int = 5) -> List[Dict[str, Any]]:
        query = """
        WITH product_users AS (
            SELECT user_id FROM interactions WHERE parent_asin = ?
        ),
        related_products AS (
            SELECT i.parent_asin, COUNT(*) as co_occurrence
            FROM interactions i
            JOIN product_users pu ON i.user_id = pu.user_id
            WHERE i.parent_asin != ?
            GROUP BY i.parent_asin
            ORDER BY co_occurrence DESC
            LIMIT ?
        )
        SELECT rp.parent_asin, p.title, p.main_category, p.price, p.average_rating
        FROM related_products rp
        JOIN products p ON rp.parent_asin = p.parent_asin
        """
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(query, (product_id, product_id, limit))
            results = cursor.fetchall()
            
            return [
                {
                    "product_id": row[0],
                    "title": row[1],
                    "category": row[2],
                    "price": row[3],
                    "rating": row[4],
                    "image_url": None
                }
                for row in results
            ]
    
    def product_exists(self, product_id: str) -> bool:
        query = "SELECT 1 FROM products WHERE parent_asin = ? LIMIT 1"
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(query, (product_id,))
            return cursor.fetchone() is not None
    
    def user_exists(self, user_id: str) -> bool:
        query = "SELECT 1 FROM interactions WHERE user_id = ? LIMIT 1"
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(query, (user_id,))
            return cursor.fetchone() is not None
    
    def get_products_catalog(self, limit: int = 50, offset: int = 0, 
                           search: Optional[str] = None, category: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get products catalog with pagination, search, and filtering"""
        
        base_query = """
        SELECT parent_asin, title, main_category, price, average_rating, rating_number
        FROM products
        WHERE 1=1
        """
        
        params = []
        
        # Add search filter
        if search:
            base_query += " AND (title LIKE ? OR main_category LIKE ?)"
            search_param = f"%{search}%"
            params.extend([search_param, search_param])
        
        # Add category filter
        if category:
            base_query += " AND main_category = ?"
            params.append(category)
        
        # Add ordering and pagination
        base_query += " ORDER BY rating_number DESC, average_rating DESC LIMIT ? OFFSET ?"
        params.extend([limit, offset])
        
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(base_query, params)
            results = cursor.fetchall()
            
            return [
                {
                    "product_id": row[0],
                    "title": row[1],
                    "category": row[2],
                    "price": row[3],
                    "rating": row[4],
                    "rating_count": row[5],
                    "image_url": None,
                    "description": f"Quality {row[2]} product with {row[5] or 0} customer reviews"
                }
                for row in results
            ]
    
    def get_products_count(self, search: Optional[str] = None, category: Optional[str] = None) -> int:
        """Get total count of products matching filters"""
        
        base_query = "SELECT COUNT(*) FROM products WHERE 1=1"
        params = []
        
        # Add search filter
        if search:
            base_query += " AND (title LIKE ? OR main_category LIKE ?)"
            search_param = f"%{search}%"
            params.extend([search_param, search_param])
        
        # Add category filter
        if category:
            base_query += " AND main_category = ?"
            params.append(category)
        
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(base_query, params)
            return cursor.fetchone()[0]
    
    def get_categories(self) -> List[str]:
        """Get all unique product categories"""
        
        query = """
        SELECT DISTINCT main_category 
        FROM products 
        WHERE main_category IS NOT NULL AND main_category != ''
        ORDER BY main_category
        """
        
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(query)
            results = cursor.fetchall()
            
            return [row[0] for row in results if row[0]]