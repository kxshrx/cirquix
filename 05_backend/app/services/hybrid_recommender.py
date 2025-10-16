"""
Hybrid Recommendation System for Backend Integration
Production-ready recommendation engine with proper ALS integration.
"""

import pandas as pd
import numpy as np
import pickle
import json
import sqlite3
from pathlib import Path
from typing import List, Dict, Any, Optional
from scipy.sparse import csr_matrix
import warnings
warnings.filterwarnings('ignore')


class HybridRecommendationSystem:
    """Production-ready hybrid recommendation system with ALS integration."""
    
    def __init__(self, model_dir="."):
        self.model_dir = Path(model_dir)
        self.als_model = None
        self.user_mappings = None
        self.item_mappings = None
        self.fallback_data = None
        self.product_metadata = None
        self.user_item_matrix = None
        self.min_history_threshold = 5
        # Set db_path relative to model directory
        self.db_path = self.model_dir.parent / "03_database_setup" / "recommendation.db"
        
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
            
            # Create user-item matrix for ALS recommendations
            self._create_user_item_matrix()
            
            print("Recommendation models loaded successfully")
            return True
            
        except Exception as e:
            print(f"Error loading models: {e}")
            return False
    
    def _create_user_item_matrix(self):
        """Create user-item matrix from database for ALS recommendations."""
        try:
            conn = sqlite3.connect(self.db_path)
            query = "SELECT user_id, product_id, rating FROM interactions"
            interactions_df = pd.read_sql_query(query, conn)
            conn.close()
            
            # Filter interactions to only include users/items in model
            users_in_model = set(self.user_mappings['to_idx'].keys())
            items_in_model = set(self.item_mappings['to_idx'].keys())
            
            valid_interactions = interactions_df[
                (interactions_df['user_id'].isin(users_in_model)) & 
                (interactions_df['product_id'].isin(items_in_model))
            ].copy()
            
            # Convert to matrix indices
            valid_interactions['user_idx'] = valid_interactions['user_id'].map(self.user_mappings['to_idx'])
            valid_interactions['item_idx'] = valid_interactions['product_id'].map(self.item_mappings['to_idx'])
            
            # Create sparse matrix
            n_users = len(self.user_mappings['to_idx'])
            n_items = len(self.item_mappings['to_idx'])
            
            self.user_item_matrix = csr_matrix(
                (valid_interactions['rating'].values, 
                 (valid_interactions['user_idx'].values, valid_interactions['item_idx'].values)),
                shape=(n_users, n_items)
            )
            
            print(f"User-item matrix created: {self.user_item_matrix.shape}")
            
        except Exception as e:
            print(f"Error creating user-item matrix: {e}")
            self.user_item_matrix = None
    
    def load_product_metadata(self):
        """Load product metadata from database."""
        try:
            conn = sqlite3.connect(self.db_path)
            query = "SELECT product_id, title, main_category, average_rating, price, image_url FROM products"
            self.product_metadata = pd.read_sql_query(query, conn).set_index('product_id')
            conn.close()
            print(f"Product metadata loaded: {len(self.product_metadata)} products")
            return True
        except Exception as e:
            print(f"Warning: Could not load product metadata: {e}")
            return False

    def get_user_history(self, user_id):
        """Get user purchase history from database."""
        try:
            conn = sqlite3.connect(self.db_path)
            query = "SELECT product_id, rating FROM interactions WHERE user_id = ? ORDER BY timestamp DESC"
            history = pd.read_sql_query(query, conn, params=[user_id])
            conn.close()
            return history['product_id'].tolist(), history['rating'].tolist()
        except:
            return [], []

    def get_als_recommendations(self, user_id, top_k=10):
        """Get recommendations from ALS model using user-item matrix."""
        if user_id not in self.user_mappings['to_idx']:
            return []
        
        try:
            if self.user_item_matrix is None:
                print("User-item matrix not available for ALS recommendations")
                return []
                
            user_idx = self.user_mappings['to_idx'][user_id]
            
            # Get recommendations using the user-item matrix
            item_ids, scores = self.als_model.recommend(
                user_idx, 
                self.user_item_matrix[user_idx], 
                N=top_k,
                filter_already_liked_items=False
            )
            
            recommendations = []
            for item_idx, score in zip(item_ids, scores):
                if item_idx in self.item_mappings['from_idx']:
                    product_id = self.item_mappings['from_idx'][item_idx]
                    recommendations.append((product_id, float(score)))
            
            return recommendations
        except Exception as e:
            print(f"ALS recommendation failed: {e}")
            return []

    def get_popularity_recommendations(self, top_k=10, exclude_items=None):
        """Get popularity-based recommendations."""
        popular_items = self.fallback_data.get('top_popular_items', [])
        
        if exclude_items:
            popular_items = [item for item in popular_items if item not in exclude_items]
        
        recommendations = []
        for i, item in enumerate(popular_items[:top_k]):
            confidence = 1.0 - (i * 0.1)
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
            for i, item in enumerate(category_products.head(top_k).index):
                confidence = 0.8 - (i * 0.1)
                recommendations.append((item, max(confidence, 0.2)))
            
            return recommendations
        except:
            return []

    def get_recommendations(self, user_id, top_k=10, include_metadata=True):
        """
        Main hybrid recommendation function.
        
        Strategy:
        1. Try ALS if user has sufficient history and exists in model
        2. Fall back to popularity + category recommendations
        3. Return results with metadata if requested
        """
        
        # Get user history
        history_items, history_ratings = self.get_user_history(user_id)
        
        recommendations = []
        strategy_used = "unknown"
        
        # Strategy 1: ALS for users with sufficient history and in model
        if len(history_items) >= self.min_history_threshold and user_id in self.user_mappings['to_idx']:
            als_recs = self.get_als_recommendations(user_id, top_k)
            if als_recs:
                recommendations = als_recs
                strategy_used = "als_collaborative"
        
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
                        'price': str(prod_data.get('price', 'N/A')),
                        'image_url': str(prod_data.get('image_url', '')) if pd.notna(prod_data.get('image_url')) else None
                    }
                
                enriched_recs.append({
                    'product_id': product_id,
                    'title': metadata.get('title', 'Unknown Product'),
                    'category': metadata.get('category', 'Unknown'),
                    'price': metadata.get('price', 'N/A'),
                    'rating': metadata.get('rating', 0.0),
                    'image_url': metadata.get('image_url'),
                    'confidence': confidence,
                    'explanation': self._generate_explanation(strategy_used, metadata.get('category', 'product'))
                })
            
            return {
                'user_id': user_id,
                'strategy': strategy_used,
                'recommendations': enriched_recs,
                'user_history_size': len(history_items)
            }
        else:
            return {
                'user_id': user_id,
                'strategy': strategy_used,
                'recommendations': [{'product_id': p, 'confidence': c} for p, c in recommendations],
                'user_history_size': len(history_items)
            }
    
    def _generate_explanation(self, strategy, category):
        """Generate explanation for recommendation."""
        explanations = {
            "als_collaborative": f"Recommended based on users with similar preferences in {category}",
            "hybrid_fallback": f"Popular {category} product recommended for you",
            "popularity": f"Trending {category} product with high ratings",
            "category_based": f"Recommended based on your interest in {category} products"
        }
        
        return explanations.get(strategy, "Recommended product based on your preferences")
    
    def is_available(self):
        """Check if the recommendation system is ready."""
        return (self.als_model is not None and 
                self.user_mappings is not None and 
                self.item_mappings is not None)


def initialize_recommendation_system(model_dir="."):
    """Initialize and return configured recommendation system."""
    system = HybridRecommendationSystem(model_dir)
    if system.load_models():
        system.load_product_metadata()
        return system
    return None