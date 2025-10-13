# Data Files (Local Only - Not in Git)

This directory contains large data files that are stored locally but not tracked in version control.

## Generated CSV Files (Total: ~2.3GB)
- `train_cleaned.csv` - Training dataset (1.8GB)
- `valid_cleaned.csv` - Validation dataset (234MB) 
- `test_cleaned.csv` - Test dataset (252MB)
- `metadata_filtered.csv` - Product metadata (36MB)

## Backup Files
- `meta_Electronics_filtered.jsonl.gz` - Compressed metadata backup (33MB)

## To Regenerate Data Files

Run the data ingestion pipeline:
```bash
# Activate virtual environment
source ../venv/bin/activate

# Convert raw data to CSV format
python 4_convert_csv.py

# Validate the output
python 5_validate.py
```

## Note
These files are automatically ignored by git due to .gitignore settings.
Raw data files are located in `../raw/` directory (also git-ignored).