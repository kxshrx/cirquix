#!/usr/bin/env python3

import sqlite3
import sys

class QueryHelper:
    """Helper functions for querying recommendation database."""
    
    def __init__(self, db_path="recommendation.db"):
        self.db_path = db_path
    
    def get_user_history(self, user_id):
        """Return user purchase history as list of product IDs."""
        
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute("SELECT purchase_history FROM users WHERE user_id = ?", (user_id,))
                result = cursor.fetchone()
                
                if result and result[0]:
                    return result[0].split()
                return []
                
        except Exception as e:
            print(f"Error getting user history: {e}")
            return []
    
    def get_product_details(self, parent_asin):
        """Return product information as dictionary."""
        
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.row_factory = sqlite3.Row
                cursor = conn.cursor()
                
                cursor.execute("SELECT * FROM products WHERE parent_asin = ?", (parent_asin,))
                result = cursor.fetchone()
                
                if result:
                    return dict(result)
                return {}
                
        except Exception as e:
            print(f"Error getting product details: {e}")
            return {}
    
    def get_user_interactions(self, user_id):
        """Return all interactions for a user."""
        
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute(
                    "SELECT parent_asin, rating, timestamp FROM interactions WHERE user_id = ?",
                    (user_id,)
                )
                results = cursor.fetchall()
                
                return [{'product_id': r[0], 'rating': r[1], 'timestamp': r[2]} for r in results]
                
        except Exception as e:
            print(f"Error getting user interactions: {e}")
            return []
    
    def get_similar_users(self, product_id, limit=10):
        """Return users who purchased a specific product."""
        
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute(
                    "SELECT user_id, rating FROM interactions WHERE parent_asin = ? ORDER BY rating DESC LIMIT ?",
                    (product_id, limit)
                )
                results = cursor.fetchall()
                
                return [{'user_id': r[0], 'rating': r[1]} for r in results]
                
        except Exception as e:
            print(f"Error getting similar users: {e}")
            return []

# Query helper instance for importing
query_helper = QueryHelper()