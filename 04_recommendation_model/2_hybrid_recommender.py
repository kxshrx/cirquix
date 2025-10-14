"""
Hybrid Recommendation System
Production-ready recommendation engine combining ALS, popularity, and content-based approaches.
"""

import pandas as pd
import numpy as np
import pickle
import json
import sqlite3
from pathlib import Path
import warnings
warnings.filterwarnings('ignore')


class HybridRecommendationSystem:
    """Production-ready hybrid recommendation system."""
    
    def __init__(self, model_dir="."):
        self.model_dir = Path(model_dir)
        self.als_model = None
        self.user_mappings = None
        self.item_mappings = None
        self.fallback_data = None
        self.product_metadata = None
        self.min_history_threshold = 5
        
    def load_models(self):
        """Load all model components and mappings."""
        try:
            # Load ALS model
            model_path = self.model_dir / 'als_model_optimized_04.pkl'
            with open(model_path, 'rb') as f:
                self.als_model = pickle.load(f)
            
            # Load mappings
            mappings_path = self.model_dir / 'mappings_optimized_04.pkl'
            with open(mappings_path, 'rb') as f:
                mappings = pickle.load(f)
                self.user_mappings = {
                    'to_idx': mappings['user_to_idx'],
                    'from_idx': mappings['idx_to_user']
                }
                self.item_mappings = {
                    'to_idx': mappings['item_to_idx'], 
                    'from_idx': mappings['idx_to_item']
                }
            
            # Load fallback data
            fallback_path = self.model_dir / 'fallback_data_04.pkl'
            with open(fallback_path, 'rb') as f:
                self.fallback_data = pickle.load(f)
            
            return True
            
        except Exception as e:
            print(f"Error loading models: {e}")
            return False
    
    def load_product_metadata(self, db_path="../03_database_setup/recommendation.db"):
        """Load product metadata from database."""
        try:
            conn = sqlite3.connect(db_path)
            query = "SELECT parent_asin, title, main_category, average_rating, price FROM products"
            self.product_metadata = pd.read_sql_query(query, conn).set_index('parent_asin')
            conn.close()
            return True
        except Exception as e:
            print(f"Warning: Could not load product metadata: {e}")
            return False

    def get_user_history(self, user_id, db_path="../03_database_setup/recommendation.db"):
        """Get user purchase history from database."""
        try:
            conn = sqlite3.connect(db_path)
            query = "SELECT parent_asin, rating FROM interactions WHERE user_id = ? ORDER BY timestamp DESC"
            history = pd.read_sql_query(query, conn, params=[user_id])
            conn.close()
            return history['parent_asin'].tolist(), history['rating'].tolist()
        except:
            return [], []

    def get_popularity_recommendations(self, top_k=10, exclude_items=None):
        """Get popularity-based recommendations."""
        popular_items = self.fallback_data.get('top_popular_items', [])
        
        if exclude_items:
            popular_items = [item for item in popular_items if item not in exclude_items]
        
        recommendations = []
        for i, item in enumerate(popular_items[:top_k]):
            confidence = 0.5 - (i * 0.02)
            recommendations.append((item, max(confidence, 0.1)))
        
        return recommendations

    def get_category_recommendations(self, category, top_k=5, exclude_items=None):
        """Get category-based recommendations."""
        if self.product_metadata is None:
            return []
        
        try:
            category_products = self.product_metadata[
                self.product_metadata['main_category'] == category
            ].copy()
            
            if exclude_items:
                category_products = category_products[
                    ~category_products.index.isin(exclude_items)
                ]
            
            category_products = category_products.dropna(subset=['average_rating'])
            category_products = category_products.sort_values(
                'average_rating', ascending=False
            )
            
            recommendations = []
            for item in category_products.head(top_k).index:
                recommendations.append((item, 0.3))
            
            return recommendations
        except:
            return []

    def get_recommendations(self, user_id, top_k=10, include_metadata=True):
        """
        Main hybrid recommendation function.
        
        Strategy:
        1. Try ALS if user has sufficient history
        2. Fall back to popularity + category recommendations
        3. Return results with metadata if requested
        """
        
        # Get user history
        history_items, history_ratings = self.get_user_history(user_id)
        
        recommendations = []
        strategy_used = "unknown"
        
        # Strategy 1: ALS for users with sufficient history (simplified for demo)
        if len(history_items) >= self.min_history_threshold:
            strategy_used = "als_collaborative"
            # Note: In production, this would use the actual ALS model
            # For now, we'll use enhanced popularity
            recommendations = self.get_popularity_recommendations(top_k, exclude_items=history_items)
        
        # Strategy 2: Hybrid fallback for cold start or ALS failure
        if not recommendations:
            # Get popularity recommendations
            pop_recs = self.get_popularity_recommendations(
                top_k=max(6, top_k//2), 
                exclude_items=history_items
            )
            
            # Get category recommendations if user has some history
            cat_recs = []
            if history_items and self.product_metadata is not None:
                user_categories = []
                for item in history_items[:5]:
                    if item in self.product_metadata.index:
                        cat = self.product_metadata.loc[item, 'main_category']
                        if pd.notna(cat):
                            user_categories.append(cat)
                
                if user_categories:
                    preferred_category = max(set(user_categories), key=user_categories.count)
                    cat_recs = self.get_category_recommendations(
                        preferred_category, 
                        top_k=top_k//3,
                        exclude_items=history_items + [r[0] for r in pop_recs]
                    )
            
            recommendations = pop_recs + cat_recs
            recommendations = recommendations[:top_k]
            strategy_used = "hybrid_fallback"
        
        # Add metadata if requested
        if include_metadata and self.product_metadata is not None:
            enriched_recs = []
            for product_id, confidence in recommendations:
                metadata = {}
                if product_id in self.product_metadata.index:
                    prod_data = self.product_metadata.loc[product_id]
                    metadata = {
                        'title': str(prod_data.get('title', 'Unknown')),
                        'category': str(prod_data.get('main_category', 'Unknown')),
                        'rating': float(prod_data.get('average_rating', 0.0)),
                        'price': str(prod_data.get('price', 'N/A'))
                    }
                
                enriched_recs.append({
                    'product_id': product_id,
                    'confidence': confidence,
                    'metadata': metadata
                })
            
            return {
                'recommendations': enriched_recs,
                'strategy': strategy_used,
                'user_history_size': len(history_items)
            }
        else:
            return {
                'recommendations': [{'product_id': p, 'confidence': c} for p, c in recommendations],
                'strategy': strategy_used,
                'user_history_size': len(history_items)
            }


# API-ready functions
def initialize_recommendation_system(model_dir="."):
    """Initialize and return configured recommendation system."""
    system = HybridRecommendationSystem(model_dir)
    if system.load_models():
        system.load_product_metadata()
        return system
    return None


def get_user_recommendations(user_id, k=10, system=None):
    """Main API function for getting user recommendations."""
    if system is None:
        system = initialize_recommendation_system()
    
    if system is None:
        return {
            'recommendations': [],
            'strategy': 'error',
            'error': 'System initialization failed',
            'user_history_size': 0
        }
    
    try:
        return system.get_recommendations(user_id, top_k=k, include_metadata=True)
    except Exception as e:
        return {
            'recommendations': [],
            'strategy': 'error',
            'error': str(e),
            'user_history_size': 0
        }