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

def test_queries():
    """Test database queries with sample data."""
    
    helper = QueryHelper()
    
    print("Testing database queries")
    print("=" * 25)
    
    try:
        # Get sample user and product
        with sqlite3.connect("recommendation.db") as conn:
            cursor = conn.cursor()
            
            # Get random user
            cursor.execute("SELECT user_id FROM users LIMIT 1")
            sample_user = cursor.fetchone()[0]
            
            # Get random product
            cursor.execute("SELECT parent_asin FROM products LIMIT 1")
            sample_product = cursor.fetchone()[0]
        
        # Test user history
        history = helper.get_user_history(sample_user)
        print(f"\nUser {sample_user} history:")
        print(f"Products purchased: {len(history)}")
        
        # Test product details
        details = helper.get_product_details(sample_product)
        print(f"\nProduct {sample_product}:")
        print(f"Title: {details.get('title', 'N/A')}")
        print(f"Category: {details.get('main_category', 'N/A')}")
        print(f"Rating: {details.get('average_rating', 'N/A')}")
        
        # Test user interactions
        interactions = helper.get_user_interactions(sample_user)
        print(f"\nUser {sample_user} interactions:")
        print(f"Total interactions: {len(interactions)}")
        
        # Test similar users
        similar = helper.get_similar_users(sample_product, limit=5)
        print(f"\nUsers who bought {sample_product}:")
        print(f"Similar users found: {len(similar)}")
        
        print("\nAll queries executed successfully")
        return True
        
    except Exception as e:
        print(f"Query test failed: {e}")
        return False

if __name__ == "__main__":
    success = test_queries()
    sys.exit(0 if success else 1)