# Hybrid Recommendation System

Production-ready recommendation engine combining collaborative filtering, popularity, and content-based approaches for comprehensive user coverage.

## Files

1. `1_hybrid_recommendation_system.ipynb` - Complete system development and testing
2. `2_hybrid_recommender.py` - Standalone module for API integration
3. Essential model artifacts (listed below)

## System Architecture

**Hybrid Strategy:**
- **Primary**: ALS collaborative filtering for users with ≥5 interactions
- **Fallback**: Popularity-based recommendations for cold start users
- **Content**: Category-based filtering using product metadata
- **Output**: Product IDs with confidence scores and enriched metadata

## Model Artifacts

**Essential Files:**
- `als_model_optimized_04.pkl` - Trained ALS model (100 factors, optimized hyperparameters)
- `mappings_optimized_04.pkl` - User/item ID mappings for model inference
- `fallback_data_04.pkl` - Popularity rankings and backup recommendations
- `train_filtered_04.csv` - Quality-filtered training data (users ≥10, products ≥15 interactions)
- `model_performance_04.json` - Performance metrics and system statistics

**Supporting Data:**
- `valid_filtered_04.csv` - Filtered validation set
- `test_filtered_04.csv` - Filtered test set
- `filtering_stats_04.json` - Data preprocessing statistics

## Performance Metrics

**Optimized for Hit Rate@10:**
- Target: 5-15% (vs baseline 1%)
- Strategy addresses data sparsity through intelligent filtering
- Hybrid approach ensures 100% recommendation coverage

**Data Quality Improvements:**
- Sparsity: 99.9973% → 99.9429% (significant improvement)
- Users: 1.56M → 105K (≥10 interactions each)
- Products: 149K → 21K (≥15 interactions each)
- Data retention: 20.4% high-quality interactions

## Usage

### Notebook Development
```bash
jupyter notebook 1_hybrid_recommendation_system.ipynb
```

### API Integration
```python
from hybrid_recommender import get_user_recommendations

# Get recommendations for existing user
result = get_user_recommendations("A3SGXH7AUHU8GW", k=10)

# Get recommendations for cold start user  
result = get_user_recommendations("NEW_USER_123", k=10)

# Result format:
{
    'recommendations': [
        {
            'product_id': 'B00ABC123',
            'confidence': 0.45,
            'metadata': {
                'title': 'Product Name',
                'category': 'Electronics',
                'rating': 4.2,
                'price': '$29.99'
            }
        }
    ],
    'strategy': 'hybrid_fallback',
    'user_history_size': 3
}
```

### Direct System Access
```python
from hybrid_recommender import HybridRecommendationSystem

system = HybridRecommendationSystem()
system.load_models()
system.load_product_metadata()

recommendations = system.get_recommendations(user_id="USER123", top_k=5)
```

## Integration Ready Features

**API Functions:**
- `get_user_recommendations(user_id, k)` - Main recommendation endpoint
- `initialize_recommendation_system()` - System initialization
- Error handling and fallback strategies included

**LLM Integration Support:**
- Product metadata enrichment (title, category, rating, price)
- Strategy indication for explanation generation
- Confidence scores for recommendation ranking

**Database Integration:**
- Automatic user history retrieval from SQLite database
- Product metadata loading from product catalog
- Handles missing users/products gracefully

## Known Limitations

**Data Coverage:**
- Limited to users/products in filtered training set
- ALS model requires matrix reconstruction for full functionality
- Metadata quality depends on original product catalog

**Performance Constraints:**
- High sparsity remains despite filtering optimizations
- Cold start users rely entirely on popularity/content fallbacks
- Category recommendations limited by metadata completeness

**Production Considerations:**
- User-item matrix not included in artifacts for size constraints
- Real-time ALS inference requires matrix reconstruction
- Popularity rankings may become stale without periodic updates

## System Status

**Ready for:**
- ✅ API deployment and integration
- ✅ LLM-based explanation generation
- ✅ Cold start user handling
- ✅ Production recommendation serving

**Future Enhancements:**
- Real-time model updates
- Advanced content-based filtering
- A/B testing framework
- Performance monitoring