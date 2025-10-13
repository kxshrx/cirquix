# Data Ingestion Pipeline

This directory contains the data ingestion pipeline for the e-commerce recommendation system.

## Files Overview

- `1_data_pipeline.py` - Main data ingestion pipeline class
- `2_utils.py` - Utility functions for data processing
- `3_run_pipeline.py` - Complete pipeline with JSONL output
- `4_convert_csv.py` - CSV conversion for model training
- `5_validate.py` - Data validation script

## Generated Files

### CSV Files (Ready for ML Models)
- `train_cleaned.csv` - Training dataset (1.8GB)
- `valid_cleaned.csv` - Validation dataset (234MB) 
- `test_cleaned.csv` - Test dataset (252MB)
- `metadata_filtered.csv` - Product metadata (36MB)

### Backup Files
- `meta_Electronics_filtered.jsonl.gz` - Compressed metadata backup

## Data Description

### User Interaction Data
Columns: `user_id`, `parent_asin`, `rating`, `timestamp`, `history`
- Contains user ratings and purchase history
- Timestamps converted to datetime format
- History field contains space-separated ASINs

### Product Metadata  
Columns: `parent_asin`, `title`, `main_category`, `average_rating`, `rating_number`, `price`, `store`, `categories`
- Filtered to only products appearing in interaction data
- Categories joined with pipe separator
- Numeric fields properly typed

## Usage

1. Run CSV conversion:
```bash
python 4_convert_csv.py
```

2. Validate outputs:
```bash
python 5_validate.py
```

## Pipeline Features

- Memory efficient processing
- Filtered metadata (only relevant products)
- Proper data type handling
- CSV format for easy model integration
- Data validation and summary generation

The pipeline successfully processes millions of user interactions and filters metadata to create clean, model-ready datasets.