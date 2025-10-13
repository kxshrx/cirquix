import pandas as pd
import json
import gzip
from pathlib import Path
from typing import Dict, List, Any, Optional

def load_filtered_metadata(file_path: str) -> pd.DataFrame:
    """Load filtered metadata from compressed JSONL file"""
    records = []
    
    with gzip.open(file_path, 'rt', encoding='utf-8') as f:
        for line in f:
            record = json.loads(line.strip())
            records.append(record)
    
    return pd.DataFrame(records)

def get_dataset_stats(df: pd.DataFrame) -> Dict[str, Any]:
    """Get basic statistics for a dataset"""
    return {
        'rows': len(df),
        'columns': list(df.columns),
        'memory_usage_mb': df.memory_usage(deep=True).sum() / 1024**2,
        'null_counts': df.isnull().sum().to_dict(),
        'dtypes': df.dtypes.to_dict()
    }

def clean_text_field(text: str) -> str:
    """Clean text fields by removing extra whitespace and handling encoding"""
    if pd.isna(text) or text == '':
        return ''
    return str(text).strip()

def process_categories_list(categories: List[str]) -> str:
    """Convert categories list to comma-separated string"""
    if not categories or pd.isna(categories):
        return ''
    if isinstance(categories, list):
        return ' > '.join(categories)
    return str(categories)

def extract_product_features(features: List[str]) -> Dict[str, str]:
    """Extract structured features from features list"""
    feature_dict = {}
    
    if not features or pd.isna(features):
        return feature_dict
    
    if isinstance(features, list):
        for feature in features:
            if ':' in str(feature):
                key, value = str(feature).split(':', 1)
                feature_dict[key.strip()] = value.strip()
            else:
                feature_dict[f'feature_{len(feature_dict)}'] = str(feature).strip()
    
    return feature_dict

def validate_data_consistency(datasets: Dict[str, pd.DataFrame], metadata_df: pd.DataFrame) -> Dict[str, Any]:
    """Validate consistency between datasets and metadata"""
    validation_results = {}
    
    # Get all ASINs from datasets
    dataset_asins = set()
    for name, df in datasets.items():
        dataset_asins.update(df['parent_asin'].unique())
    
    # Get ASINs from metadata
    metadata_asins = set(metadata_df['parent_asin'].unique())
    
    # Calculate overlap
    overlap = dataset_asins.intersection(metadata_asins)
    missing_in_metadata = dataset_asins - metadata_asins
    extra_in_metadata = metadata_asins - dataset_asins
    
    validation_results = {
        'total_dataset_asins': len(dataset_asins),
        'total_metadata_asins': len(metadata_asins),
        'overlap_count': len(overlap),
        'missing_in_metadata': len(missing_in_metadata),
        'extra_in_metadata': len(extra_in_metadata),
        'coverage_percentage': (len(overlap) / len(dataset_asins)) * 100 if dataset_asins else 0
    }
    
    return validation_results