
"""
Quick test script for hybrid recommendation system validation.
Validates functionality for both existing users and cold start scenarios.
"""

import pandas as pd
import sqlite3
from pathlib import Path
import sys
import time


try:
    from hybrid_recommender import HybridRecommendationSystem
    print("✓ Hybrid recommender module imported successfully")
except ImportError:
    
    import sys
    sys.path.append('.')
    exec(open('2_hybrid_recommender.py').read())
    print("✓ Hybrid recommender loaded from file")

def test_system_initialization():
    """Test system initialization and model loading."""
    print("\n=== SYSTEM INITIALIZATION TEST ===")
    
    system = HybridRecommendationSystem()
    
    
    if system.load_models():
        print("✓ Models loaded successfully")
    else:
        print("✗ Failed to load models")
        return None
    
    
    if system.load_product_metadata():
        print("✓ Product metadata loaded successfully")
        print(f"  Products available: {len(system.product_metadata):,}")
    else:
        print("✗ Failed to load product metadata")
    
    
    if system.user_mappings and system.item_mappings:
        print(f"✓ User mappings: {len(system.user_mappings['to_idx']):,} users")
        print(f"✓ Item mappings: {len(system.item_mappings['to_idx']):,} items")
    else:
        print("✗ Mappings not loaded properly")
        return None
    
    return system

def get_sample_users():
    """Get sample users from training data."""
    try:
        train_df = pd.read_csv("train_filtered_04.csv")
        
        
        user_counts = train_df['user_id'].value_counts()
        
        high_activity_user = user_counts[user_counts >= 20].index[0] if len(user_counts[user_counts >= 20]) > 0 else None
        medium_activity_user = user_counts[(user_counts >= 10) & (user_counts < 20)].index[0] if len(user_counts[(user_counts >= 10) & (user_counts < 20)]) > 0 else None
        low_activity_user = user_counts[user_counts < 10].index[0] if len(user_counts[user_counts < 10]) > 0 else None
        
        return {
            'high_activity': high_activity_user,
            'medium_activity': medium_activity_user, 
            'low_activity': low_activity_user,
            'cold_start': 'TEST_COLD_USER_123'
        }
    except Exception as e:
        print(f"✗ Error getting sample users: {e}")
        return {}

def test_user_recommendations(system, test_users):
    """Test recommendations for different user types."""
    print("\n=== USER RECOMMENDATION TESTS ===")
    
    for user_type, user_id in test_users.items():
        if not user_id:
            continue
            
        print(f"\n--- Testing {user_type.upper()} User: {user_id} ---")
        
        try:
            
            history_items, history_ratings = system.get_user_history(user_id)
            print(f"User history: {len(history_items)} interactions")
            
            
            start_time = time.time()
            result = system.get_recommendations(user_id, top_k=5, include_metadata=True)
            inference_time = time.time() - start_time
            
            print(f"Strategy used: {result['strategy']}")
            print(f"Inference time: {inference_time:.4f}s")
            print(f"Recommendations returned: {len(result['recommendations'])}")
            
            
            for i, rec in enumerate(result['recommendations'], 1):
                product_id = rec['product_id']
                confidence = rec['confidence']
                metadata = rec.get('metadata', {})
                
                title = metadata.get('title', 'Unknown')[:50]
                category = metadata.get('category', 'Unknown')
                rating = metadata.get('rating', 0.0)
                
                print(f"  {i}. {product_id}")
                print(f"     Title: {title}...")
                print(f"     Category: {category}")
                print(f"     Rating: {rating:.1f}")
                print(f"     Confidence: {confidence:.3f}")
            
            
            if len(result['recommendations']) == 0:
                print("  ⚠️  No recommendations returned")
            elif len(result['recommendations']) < 5:
                print(f"  ⚠️  Only {len(result['recommendations'])} recommendations (expected 5)")
            else:
                print("  ✓ Recommendations validated")
                
        except Exception as e:
            print(f"  ✗ Error testing user {user_id}: {e}")

def test_product_metadata_lookup(system):
    """Test product metadata retrieval."""
    print("\n=== PRODUCT METADATA TEST ===")
    
    try:
        
        sample_products = list(system.item_mappings['to_idx'].keys())[:3]
        
        for product_id in sample_products:
            if product_id in system.product_metadata.index:
                prod_data = system.product_metadata.loc[product_id]
                print(f"\nProduct: {product_id}")
                print(f"  Title: {prod_data.get('title', 'N/A')}")
                print(f"  Category: {prod_data.get('main_category', 'N/A')}")
                print(f"  Rating: {prod_data.get('average_rating', 'N/A')}")
                print(f"  Price: {prod_data.get('price', 'N/A')}")
            else:
                print(f"  ⚠️  Product {product_id} not found in metadata")
        
        print("✓ Product metadata lookup validated")
        
    except Exception as e:
        print(f"✗ Error testing product metadata: {e}")

def test_fallback_strategies(system):
    """Test different fallback strategies."""
    print("\n=== FALLBACK STRATEGY TESTS ===")
    
    
    try:
        pop_recs = system.get_popularity_recommendations(top_k=5)
        print(f"✓ Popularity recommendations: {len(pop_recs)} items")
        
        for i, (product_id, confidence) in enumerate(pop_recs[:3], 1):
            print(f"  {i}. {product_id} (confidence: {confidence:.3f})")
    except Exception as e:
        print(f"✗ Error testing popularity recommendations: {e}")
    
    
    try:
        categories = system.product_metadata['main_category'].value_counts().head(3).index.tolist()
        
        for category in categories:
            cat_recs = system.get_category_recommendations(category, top_k=3)
            print(f"✓ Category '{category}' recommendations: {len(cat_recs)} items")
            
    except Exception as e:
        print(f"✗ Error testing category recommendations: {e}")

def test_database_connectivity():
    """Test database connectivity and data integrity."""
    print("\n=== DATABASE CONNECTIVITY TEST ===")
    
    try:
        
        conn = sqlite3.connect("../03_database_setup/recommendation.db")
        cursor = conn.cursor()
        
        
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = [row[0] for row in cursor.fetchall()]
        
        required_tables = ['users', 'products', 'interactions']
        for table in required_tables:
            if table in tables:
                cursor.execute(f"SELECT COUNT(*) FROM {table}")
                count = cursor.fetchone()[0]
                print(f"✓ Table '{table}': {count:,} rows")
            else:
                print(f"✗ Table '{table}' not found")
        
        conn.close()
        print("✓ Database connectivity validated")
        
    except Exception as e:
        print(f"✗ Database connectivity failed: {e}")

def run_performance_benchmark(system, test_users):
    """Run performance benchmark tests."""
    print("\n=== PERFORMANCE BENCHMARK ===")
    
    
    test_calls = 10
    total_time = 0
    successful_calls = 0
    
    user_id = test_users.get('medium_activity') or test_users.get('cold_start')
    
    if user_id:
        for i in range(test_calls):
            try:
                start_time = time.time()
                result = system.get_recommendations(user_id, top_k=10)
                end_time = time.time()
                
                if result and len(result.get('recommendations', [])) > 0:
                    successful_calls += 1
                    total_time += (end_time - start_time)
            except:
                pass
        
        if successful_calls > 0:
            avg_time = total_time / successful_calls
            print(f"✓ Average inference time: {avg_time:.4f}s ({successful_calls}/{test_calls} successful)")
            
            if avg_time < 0.1:
                print("✓ Performance within acceptable limits (<0.1s)")
            else:
                print("⚠️  Performance slower than expected (>0.1s)")
        else:
            print("✗ No successful recommendation calls")
    else:
        print("⚠️  No test user available for performance benchmark")

def main():
    """Main test execution."""
    print("HYBRID RECOMMENDATION SYSTEM VALIDATION")
    print("=" * 45)
    
    
    system = test_system_initialization()
    if not system:
        print("✗ System initialization failed - aborting tests")
        return
    
    
    test_users = get_sample_users()
    if not test_users:
        print("✗ Could not get test users - aborting tests")
        return
    
    
    test_user_recommendations(system, test_users)
    test_product_metadata_lookup(system)
    test_fallback_strategies(system)
    test_database_connectivity()
    run_performance_benchmark(system, test_users)
    
    print("\n" + "=" * 45)
    print("VALIDATION COMPLETE")
    print("=" * 45)
    print("\nIf all tests show ✓, your recommendation system is ready for integration.")
    print("Any ✗ or ⚠️  indicates areas that need attention before deployment.")

if __name__ == "__main__":
    main()