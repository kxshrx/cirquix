    # Database Setup Module

This module creates a SQLite database for the recommendation system with optimized schema and helper functions.

## Files

1. `1_database_setup.py` - Create database schema and load full data  
2. `2_query_helper.py` - Database query helper functions

## Usage

```bash
# Step 1: Setup database with full data
python 1_database_setup.py

# Step 2: Use query helper functions
# Import QueryHelper class for database operations
```

## Database Schema

**users**: User purchase aggregates
- user_id (TEXT PRIMARY KEY)
- purchase_history (TEXT) 
- total_purchases (INTEGER)

**products**: Product metadata
- parent_asin (TEXT PRIMARY KEY)
- title, main_category, average_rating, etc.

**interactions**: Individual purchases
- user_id, parent_asin, rating, timestamp

## Output

- `recommendation.db` (full dataset)
- Working query functions for API use