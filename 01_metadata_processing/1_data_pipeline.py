import pandas as pd
import json
import gzip
from pathlib import Path
import logging
from typing import Set, Dict, Any

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class DataIngestionPipeline:
    """Handles loading and processing of e-commerce datasets"""
    
    def __init__(self, raw_data_path: str):
        self.raw_path = Path(raw_data_path)
        self.output_path = Path(__file__).parent
        
    def load_csv_datasets(self) -> Dict[str, pd.DataFrame]:
        """Load train, validation, and test CSV files"""
        logger.info("Loading CSV datasets...")
        
        datasets = {}
        csv_files = ['Electronics.train.csv', 'Electronics.valid.csv', 'Electronics.test.csv']
        
        for file_name in csv_files:
            file_path = self.raw_path / file_name
            logger.info(f"Loading {file_name}")
            
            df = pd.read_csv(file_path)
            
            # Convert timestamp to datetime
            df['timestamp'] = pd.to_datetime(df['timestamp'], unit='ms')
            
            # Handle missing history values
            df['history'] = df['history'].fillna('')
            
            # Store dataset
            dataset_name = file_name.replace('Electronics.', '').replace('.csv', '')
            datasets[dataset_name] = df
            
            logger.info(f"Loaded {len(df)} rows from {file_name}")
            
        return datasets
    
    def extract_unique_asins(self, datasets: Dict[str, pd.DataFrame]) -> Set[str]:
        """Extract all unique parent_asin values from datasets"""
        logger.info("Extracting unique ASINs...")
        
        all_asins = set()
        
        for name, df in datasets.items():
            # Get ASINs from parent_asin column
            asins = set(df['parent_asin'].dropna().unique())
            all_asins.update(asins)
            
            # Get ASINs from history column
            for history in df['history'].dropna():
                if history:
                    history_asins = history.split()
                    all_asins.update(history_asins)
            
            logger.info(f"Found {len(asins)} unique ASINs in {name} dataset")
        
        logger.info(f"Total unique ASINs across all datasets: {len(all_asins)}")
        return all_asins
    
    def process_metadata_file(self, required_asins: Set[str]) -> pd.DataFrame:
        """Process metadata file and filter for required ASINs"""
        logger.info("Processing metadata file...")
        
        metadata_file = self.raw_path / 'meta_Electronics.jsonl'
        filtered_records = []
        
        total_records = 0
        filtered_count = 0
        
        with open(metadata_file, 'r', encoding='utf-8') as f:
            for line in f:
                total_records += 1
                
                try:
                    record = json.loads(line.strip())
                    
                    if record.get('parent_asin') in required_asins:
                        # Extract relevant fields
                        filtered_record = {
                            'parent_asin': record.get('parent_asin'),
                            'title': record.get('title', ''),
                            'main_category': record.get('main_category', ''),
                            'categories': record.get('categories', []),
                            'average_rating': record.get('average_rating'),
                            'rating_number': record.get('rating_number'),
                            'price': record.get('price'),
                            'description': record.get('description', []),
                            'features': record.get('features', []),
                            'store': record.get('store', ''),
                            'details': record.get('details', {})
                        }
                        
                        filtered_records.append(filtered_record)
                        filtered_count += 1
                        
                except json.JSONDecodeError as e:
                    logger.warning(f"Error parsing JSON record: {e}")
                    continue
                
                if total_records % 10000 == 0:
                    logger.info(f"Processed {total_records} records, filtered {filtered_count}")
        
        logger.info(f"Processed {total_records} total records")
        logger.info(f"Filtered to {filtered_count} relevant records")
        
        # Convert to DataFrame
        metadata_df = pd.DataFrame(filtered_records)
        
        # Clean data types
        metadata_df['average_rating'] = pd.to_numeric(metadata_df['average_rating'], errors='coerce')
        metadata_df['rating_number'] = pd.to_numeric(metadata_df['rating_number'], errors='coerce')
        metadata_df['price'] = pd.to_numeric(metadata_df['price'], errors='coerce')
        
        return metadata_df
    
    def save_filtered_metadata(self, metadata_df: pd.DataFrame):
        """Save filtered metadata to compressed JSONL file"""
        output_file = self.output_path / 'meta_Electronics_filtered.jsonl.gz'
        
        logger.info(f"Saving filtered metadata to {output_file}")
        
        with gzip.open(output_file, 'wt', encoding='utf-8') as f:
            for _, row in metadata_df.iterrows():
                json.dump(row.to_dict(), f)
                f.write('\n')
        
        logger.info(f"Saved {len(metadata_df)} records to {output_file}")
    
    def validate_datasets(self, datasets: Dict[str, pd.DataFrame], metadata_df: pd.DataFrame):
        """Validate data quality and completeness"""
        logger.info("Validating datasets...")
        
        # Check CSV datasets
        for name, df in datasets.items():
            logger.info(f"\n{name} dataset validation:")
            logger.info(f"  Rows: {len(df)}")
            logger.info(f"  Columns: {list(df.columns)}")
            logger.info(f"  Missing values: {df.isnull().sum().to_dict()}")
            logger.info(f"  Unique users: {df['user_id'].nunique()}")
            logger.info(f"  Unique products: {df['parent_asin'].nunique()}")
            logger.info(f"  Rating range: {df['rating'].min()} - {df['rating'].max()}")
        
        # Check metadata
        logger.info(f"\nMetadata validation:")
        logger.info(f"  Rows: {len(metadata_df)}")
        logger.info(f"  Columns: {list(metadata_df.columns)}")
        logger.info(f"  Missing values: {metadata_df.isnull().sum().to_dict()}")
        logger.info(f"  Products with prices: {metadata_df['price'].notna().sum()}")
        logger.info(f"  Products with ratings: {metadata_df['average_rating'].notna().sum()}")
    
    def run_pipeline(self):
        """Execute complete data ingestion pipeline"""
        logger.info("Starting data ingestion pipeline...")
        
        # Load CSV datasets
        datasets = self.load_csv_datasets()
        
        # Extract unique ASINs
        required_asins = self.extract_unique_asins(datasets)
        
        # Process and filter metadata
        metadata_df = self.process_metadata_file(required_asins)
        
        # Save filtered metadata
        self.save_filtered_metadata(metadata_df)
        
        # Validate all datasets
        self.validate_datasets(datasets, metadata_df)
        
        logger.info("Data ingestion pipeline completed successfully!")
        
        return datasets, metadata_df

if __name__ == "__main__":
    # Initialize pipeline
    raw_data_path = "../raw"
    pipeline = DataIngestionPipeline(raw_data_path)
    
    # Run pipeline
    datasets, metadata_df = pipeline.run_pipeline()
    
    print("\nPipeline completed. Available datasets:")
    for name, df in datasets.items():
        print(f"  {name}: {len(df)} rows")
    print(f"  metadata: {len(metadata_df)} rows")