import pandas as pd
import json
import gzip
from pathlib import Path
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def run_pipeline():
    """Main data ingestion pipeline"""
    
    # Paths
    raw_path = Path("../raw")
    output_path = Path(".")
    
    logger.info("Starting data ingestion pipeline")
    
    # 1. Load CSV datasets
    logger.info("Loading CSV datasets...")
    datasets = {}
    
    for file_name in ['Electronics.train.csv', 'Electronics.valid.csv', 'Electronics.test.csv']:
        file_path = raw_path / file_name
        logger.info(f"Loading {file_name}")
        
        df = pd.read_csv(file_path)
        df['timestamp'] = pd.to_datetime(df['timestamp'], unit='ms')
        df['history'] = df['history'].fillna('')
        
        name = file_name.replace('Electronics.', '').replace('.csv', '')
        datasets[name] = df
        logger.info(f"Loaded {len(df):,} rows")
    
    # 2. Extract unique ASINs
    logger.info("Extracting unique product ASINs...")
    all_asins = set()
    
    for df in datasets.values():
        all_asins.update(df['parent_asin'].dropna())
        for history in df['history'].dropna():
            if history.strip():
                all_asins.update(history.split())
    
    logger.info(f"Found {len(all_asins):,} unique ASINs")
    
    # 3. Process metadata file
    logger.info("Processing metadata file...")
    metadata_records = []
    
    with open(raw_path / 'meta_Electronics.jsonl', 'r') as f:
        total = 0
        found = 0
        
        for line in f:
            total += 1
            try:
                record = json.loads(line.strip())
                asin = record.get('parent_asin')
                
                if asin in all_asins:
                    filtered_record = {
                        'parent_asin': asin,
                        'title': record.get('title', ''),
                        'main_category': record.get('main_category', ''),
                        'average_rating': record.get('average_rating'),
                        'rating_number': record.get('rating_number'),
                        'price': record.get('price'),
                        'store': record.get('store', ''),
                        'categories': record.get('categories', [])
                    }
                    metadata_records.append(filtered_record)
                    found += 1
                    
            except json.JSONDecodeError:
                continue
            
            if total % 100000 == 0:
                logger.info(f"Processed {total:,} records, found {found} matches")
    
    logger.info(f"Processed {total:,} total records, found {found} relevant products")
    
    # 4. Create metadata DataFrame
    metadata_df = pd.DataFrame(metadata_records)
    metadata_df['average_rating'] = pd.to_numeric(metadata_df['average_rating'], errors='coerce')
    metadata_df['rating_number'] = pd.to_numeric(metadata_df['rating_number'], errors='coerce')
    metadata_df['price'] = pd.to_numeric(metadata_df['price'], errors='coerce')
    
    # 5. Save datasets as CSV files for model training
    logger.info("Saving datasets as CSV files...")
    
    # Save cleaned datasets
    for name, df in datasets.items():
        csv_file = output_path / f'{name}_cleaned.csv'
        df.to_csv(csv_file, index=False)
        logger.info(f"Saved {name} dataset to {csv_file}")
    
    # Save metadata as CSV
    if not metadata_df.empty:
        metadata_csv = output_path / 'metadata_filtered.csv'
        # Convert categories list to string for CSV
        metadata_df_copy = metadata_df.copy()
        metadata_df_copy['categories'] = metadata_df_copy['categories'].apply(
            lambda x: '|'.join(x) if isinstance(x, list) else str(x)
        )
        metadata_df_copy.to_csv(metadata_csv, index=False)
        logger.info(f"Saved metadata to {metadata_csv}")
        
        # Also save compressed JSONL for backup
        output_file = output_path / 'meta_Electronics_filtered.jsonl.gz'
        with gzip.open(output_file, 'wt') as f:
            for _, row in metadata_df.iterrows():
                json.dump(row.to_dict(), f, default=str)
                f.write('\n')
        logger.info(f"Saved backup metadata to {output_file}")
    
    # 6. Generate summary
    # 6. Generate summary
    with open(output_path / 'pipeline_summary.txt', 'w') as f:
        f.write("Data Ingestion Pipeline Summary\n")
        f.write("="*40 + "\n\n")
        
        f.write("OUTPUT FILES:\n")
        f.write("- train_cleaned.csv\n")
        f.write("- valid_cleaned.csv\n")
        f.write("- test_cleaned.csv\n")
        f.write("- metadata_filtered.csv\n")
        f.write("- meta_Electronics_filtered.jsonl.gz (backup)\n\n")
        
        for name, df in datasets.items():
            f.write(f"{name.upper()}:\n")
            f.write(f"  Rows: {len(df):,}\n")
            f.write(f"  Users: {df['user_id'].nunique():,}\n")
            f.write(f"  Products: {df['parent_asin'].nunique():,}\n")
            f.write(f"  Ratings: {df['rating'].min()}-{df['rating'].max()}\n")
            f.write(f"  Date range: {df['timestamp'].min()} to {df['timestamp'].max()}\n\n")
        
        f.write(f"METADATA:\n")
        f.write(f"  Products: {len(metadata_df):,}\n")
        f.write(f"  With prices: {metadata_df['price'].notna().sum():,}\n")
        f.write(f"  With ratings: {metadata_df['average_rating'].notna().sum():,}\n")
        f.write(f"  Categories coverage: {metadata_df['categories'].notna().sum():,}\n")
    
    logger.info("Pipeline completed successfully!")
    logger.info("CSV files ready for model training!")
    return datasets, metadata_df

if __name__ == "__main__":
    datasets, metadata = run_pipeline()
    print(f"\nCompleted! Generated CSV files:")
    print("- train_cleaned.csv")
    print("- valid_cleaned.csv") 
    print("- test_cleaned.csv")
    print("- metadata_filtered.csv")
    print(f"\nTotal interactions: {sum(len(df) for df in datasets.values()):,}")
    print(f"Filtered metadata: {len(metadata):,} products")