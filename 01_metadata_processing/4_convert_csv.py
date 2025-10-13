import pandas as pd
import json
import logging
from pathlib import Path

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def convert_to_csv():
    """Convert datasets to CSV format for model training"""
    
    raw_path = Path("../raw")
    output_path = Path(".")
    
    logger.info("Converting datasets to CSV format...")
    
    # Process each CSV file with basic cleaning
    csv_files = {
        'Electronics.train.csv': 'train_cleaned.csv',
        'Electronics.valid.csv': 'valid_cleaned.csv', 
        'Electronics.test.csv': 'test_cleaned.csv'
    }
    
    all_asins = set()
    
    for input_file, output_file in csv_files.items():
        logger.info(f"Processing {input_file}...")
        
        # Read and clean data
        df = pd.read_csv(raw_path / input_file)
        df['timestamp'] = pd.to_datetime(df['timestamp'], unit='ms')
        df['history'] = df['history'].fillna('')
        
        # Extract ASINs for metadata filtering
        all_asins.update(df['parent_asin'].dropna())
        for history in df['history'].dropna():
            if history.strip():
                all_asins.update(history.split())
        
        # Save cleaned dataset
        df.to_csv(output_path / output_file, index=False)
        logger.info(f"Saved {len(df):,} rows to {output_file}")
    
    # Process metadata in chunks to find relevant products
    logger.info("Processing metadata...")
    metadata_records = []
    
    with open(raw_path / 'meta_Electronics.jsonl', 'r') as f:
        for i, line in enumerate(f):
            try:
                record = json.loads(line.strip())
                asin = record.get('parent_asin')
                
                if asin in all_asins:
                    # Keep essential fields only
                    clean_record = {
                        'parent_asin': asin,
                        'title': record.get('title', ''),
                        'main_category': record.get('main_category', ''),
                        'average_rating': record.get('average_rating'),
                        'rating_number': record.get('rating_number'),
                        'price': record.get('price'),
                        'store': record.get('store', ''),
                        'categories': '|'.join(record.get('categories', []))
                    }
                    metadata_records.append(clean_record)
                    
            except json.JSONDecodeError:
                continue
            
            if i % 50000 == 0 and i > 0:
                logger.info(f"Processed {i:,} metadata records, found {len(metadata_records)} matches")
                
            # Limit processing for efficiency
            if i > 500000 and len(metadata_records) > 1000:
                logger.info("Found sufficient metadata, stopping early")
                break
    
    # Save metadata as CSV
    if metadata_records:
        metadata_df = pd.DataFrame(metadata_records)
        metadata_df['average_rating'] = pd.to_numeric(metadata_df['average_rating'], errors='coerce')
        metadata_df['rating_number'] = pd.to_numeric(metadata_df['rating_number'], errors='coerce')
        metadata_df['price'] = pd.to_numeric(metadata_df['price'], errors='coerce')
        
        metadata_df.to_csv(output_path / 'metadata_filtered.csv', index=False)
        logger.info(f"Saved {len(metadata_df):,} products to metadata_filtered.csv")
    
    logger.info("✓ CSV conversion completed successfully!")

if __name__ == "__main__":
    convert_to_csv()
    print("\nCSV files ready for model training:")
    print("- train_cleaned.csv")
    print("- valid_cleaned.csv")
    print("- test_cleaned.csv") 
    print("- metadata_filtered.csv")