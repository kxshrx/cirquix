# Data Preprocessing and Exploration

This directory contains Jupyter notebooks for comprehensive data analysis and preprocessing, plus dense dataset optimization.

## Scripts and Notebooks

- `1_data_exploration.ipynb` - Comprehensive EDA with visualizations
- `2_data_cleaning.ipynb` - Data cleaning and final dataset preparation
- `3_make_dense_dataset.py` - **Dense dataset optimization script** (NEW)

## Generated Files

### ✅ Dense Optimized Datasets (Current)
- `train_dense.csv` - Dense training interactions (948K interactions, 67K active users)
- `valid_dense.csv` - Dense validation interactions (30K interactions)  
- `test_dense.csv` - Dense test interactions (29K interactions)
- `metadata_dense.csv` - Dense product metadata (16.6K popular products)

### Analysis Outputs
- Interactive visualizations and insights within notebooks
- Data quality validation reports
- Statistical summaries and distribution analysis

## Dense Dataset Optimization Results

### Original vs Dense Comparison
| Metric | Original | Dense | Improvement |
|--------|----------|-------|-------------|
| **Interactions** | 8.1M | 1.0M | 87% reduction |
| **Users** | 1.6M | 67K | Focus on active users (≥10 interactions) |
| **Products** | 149K | 16.6K | Focus on popular products (≥15 users) |
| **File Size** | ~1.3GB | ~70MB | 95% reduction |
| **Avg User Activity** | 5.0 | 15.0 | 3x higher engagement |
| **Matrix Density** | 99.997% sparse | 99.910% sparse | Significantly improved |

### Data Quality (Dense)
- All ratings in valid 1-5 range
- No missing user/product IDs
- No duplicate interactions
- 100% product metadata coverage
- Standardized schema: `user_id`, `product_id`, `rating`, `timestamp`

### User Behavior (Dense)
- All users have ≥10 interactions (active users only)
- All products have ≥15 unique users (popular products only)
- Rating distribution preserved (mean ~4.0)
- Focused on meaningful user-product patterns

## Data Processing Pipeline

1. **Load original cleaned datasets** from 01_metadata_processing
2. **Analyze structure and quality** - check data types, missing values, distributions
3. **Clean and validate** - ensure correct types, remove invalid data
4. **Filter for metadata coverage** - keep only interactions with product metadata
5. **Dense optimization** - iteratively filter low-activity users and unpopular products
6. **Generate optimized datasets** ready for efficient modeling

## Usage

1. **Install additional requirements**:
```bash
source ../venv/bin/activate
pip install matplotlib seaborn jupyter
```

2. **Run dense dataset creation** (if needed):
```bash
python3 3_make_dense_dataset.py
```

3. **Run data exploration**:
```bash
jupyter notebook 1_data_exploration.ipynb
```

4. **Run data cleaning**:
```bash
jupyter notebook 2_data_cleaning.ipynb
```

## Production Readiness

✅ Dense datasets optimized for modeling performance  
✅ 95% file size reduction with preserved signal  
✅ Consistent data types and schema across all files  
✅ No missing critical values  
✅ 100% product-interaction alignment  
✅ Proper train/validation/test splits maintained  
✅ All downstream systems updated to use dense datasets