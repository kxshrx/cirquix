# Data Preprocessing and Exploration

This directory contains Jupyter notebooks for comprehensive data analysis and preprocessing.

## Notebooks

- `1_data_exploration.ipynb` - Comprehensive EDA with visualizations
- `2_data_cleaning.ipynb` - Data cleaning and final dataset preparation

## Generated Files

### Generated Files (from notebooks)
- `train_final.csv` - Final training interactions
- `valid_final.csv` - Final validation interactions  
- `test_final.csv` - Final test interactions
- `metadata_final.csv` - Final product metadata

### Analysis Outputs
- Interactive visualizations and insights within notebooks
- Data quality validation reports
- Statistical summaries and distribution analysis

## Key Findings

### Dataset Overview
- **Total interactions**: 8.1M (after filtering for products with metadata)
- **Unique users**: 1.6M  
- **Unique products**: 149K
- **Rating scale**: 1-5 stars
- **Date range**: 1999-2023

### Data Quality  
- All ratings in valid 1-5 range
- No missing user/product IDs
- No duplicate interactions
- Product metadata coverage: 40.6%

### User Behavior
- Most users have few interactions (cold start problem)
- Power law distribution in user activity
- Rating distribution skews positive (mean ~4.0)

### Product Characteristics
- Electronics category focus
- 52% of products have price information
- All products have rating information
- Long tail distribution in product popularity

## Data Processing Steps

1. **Load original cleaned datasets** from 01_metadata_processing
2. **Analyze structure and quality** - check data types, missing values, distributions
3. **Clean and validate** - ensure correct types, remove invalid data
4. **Filter for metadata coverage** - keep only interactions with product metadata
5. **Generate final datasets** ready for modeling

## Usage

1. **Install additional requirements**:
```bash
source ../venv/bin/activate
pip install matplotlib seaborn jupyter
```

2. **Run data exploration**:
```bash
jupyter notebook 1_data_exploration.ipynb
```

3. **Run data cleaning**:
```bash
jupyter notebook 2_data_cleaning.ipynb
```

## Modeling Readiness

✓ Data validated and ready for modeling
✓ Consistent data types across all files
✓ No missing critical values
✓ Product-interaction alignment verified
✓ Proper train/validation/test splits maintained