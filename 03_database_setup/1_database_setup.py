#!/usr/bin/env python3

import sqlite3
import pandas as pd
import os
import sys

class DatabaseManager:
    """Manage SQLite database operations for recommendation system."""
    
    def __init__(self, db_path="recommendation.db"):
        self.db_path = db_path
        
    def create_tables(self):
        """Create database schema with proper indexes."""
        
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            # Create users table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    user_id TEXT PRIMARY KEY,
                    purchase_history TEXT,
                    total_purchases INTEGER
                )
            """)
            
            # Create products table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS products (
                    parent_asin TEXT PRIMARY KEY,
                    title TEXT,
                    main_category TEXT,
                    average_rating REAL,
                    rating_number INTEGER,
                    price TEXT,
                    store TEXT,
                    categories TEXT
                )
            """)
            
            # Create interactions table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS interactions (
                    user_id TEXT,
                    parent_asin TEXT,
                    rating REAL,
                    timestamp TEXT
                )
            """)
            
            # Create indexes for fast lookups
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_interactions_user ON interactions(user_id)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_interactions_product ON interactions(parent_asin)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_products_category ON products(main_category)")
            
            conn.commit()
            print("Database schema created successfully")
    
    def load_interactions(self, train_path):
        """Load full training interactions into database."""
        
        print(f"Loading interactions from {train_path}")
        
        # Load full training data
        df = pd.read_csv(train_path)
        
        with sqlite3.connect(self.db_path) as conn:
            # Load interactions table
            df.to_sql('interactions', conn, if_exists='replace', index=False)
            
            # Create users table from interactions
            user_stats = df.groupby('user_id').agg({
                'parent_asin': lambda x: ' '.join(x.astype(str)),
                'user_id': 'count'
            }).rename(columns={'parent_asin': 'purchase_history', 'user_id': 'total_purchases'})
            
            user_stats.to_sql('users', conn, if_exists='replace', index_label='user_id')
            
            conn.commit()
            print(f"Loaded {len(df):,} interactions and {len(user_stats):,} users")
    
    def load_products(self, metadata_path):
        """Load product metadata into database."""
        
        print(f"Loading products from {metadata_path}")
        
        # Load metadata
        df = pd.read_csv(metadata_path)
        
        # Handle missing values
        df = df.fillna('')
        
        # Select required columns
        product_cols = ['parent_asin', 'title', 'main_category', 'average_rating', 
                       'rating_number', 'price', 'store', 'categories']
        
        df_products = df[product_cols].copy()
        
        with sqlite3.connect(self.db_path) as conn:
            df_products.to_sql('products', conn, if_exists='replace', index=False)
            conn.commit()
            print(f"Loaded {len(df_products):,} products")
    
    def verify_database(self):
        """Verify database integrity and show statistics."""
        
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            # Get table counts
            tables = ['users', 'products', 'interactions']
            print("\nDatabase statistics:")
            print("=" * 20)
            
            for table in tables:
                cursor.execute(f"SELECT COUNT(*) FROM {table}")
                count = cursor.fetchone()[0]
                print(f"{table}: {count:,} rows")
            
            # Show database size
            db_size = os.path.getsize(self.db_path) / (1024 * 1024)
            print(f"\nDatabase size: {db_size:.1f} MB")
            
            return True

def setup_database():
    """Main function to setup complete database."""
    
    # Initialize database manager
    db = DatabaseManager()
    
    # Check required files
    train_path = "../02_data_preprocessing/train_final.csv"
    metadata_path = "../02_data_preprocessing/metadata_final.csv"
    
    if not os.path.exists(train_path):
        print(f"Error: {train_path} not found.")
        return False
    
    if not os.path.exists(metadata_path):
        print(f"Error: {metadata_path} not found.")
        return False
    
    try:
        # Setup database
        print("Setting up recommendation database")
        db.create_tables()
        db.load_interactions(train_path)
        db.load_products(metadata_path)
        db.verify_database()
        
        print(f"\nDatabase setup complete: {db.db_path}")
        return True
        
    except Exception as e:
        print(f"Error: {e}")
        return False

if __name__ == "__main__":
    success = setup_database()
    sys.exit(0 if success else 1)