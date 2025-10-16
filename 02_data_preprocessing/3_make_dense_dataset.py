"""
Create dense interaction and metadata files by iteratively filtering
users and products based on activity thresholds.

What this script does:
- Loads interaction CSVs (train_final.csv, valid_final.csv, test_final.csv) in this
  directory or falls back to train_cleaned/valid_cleaned/test_cleaned from
  ../01_metadata_processing if needed.
- Iteratively removes users with < MIN_USER_INTERACTIONS and products with
  < MIN_PRODUCT_UNIQUE_USERS until stable (no changes between iterations).
- Keeps only essential columns for interactions: user_id, product_id, rating (if
  present), timestamp.
- Keeps only essential columns for metadata: product_id, title, main_category,
  price, average_rating, image (if available).
- Saves outputs: train_dense.csv, valid_dense.csv, test_dense.csv, metadata_dense.csv

Rationale (from EDA):
- Median user activity was 3-5 interactions; median product popularity < 10.
- Long-tail users and products add sparsity and noise. Filtering to frequent
  users and popular products produces a much denser matrix that preserves the
  signal useful for collaborative filtering and demo UX.

Usage:
    python 3_make_dense_dataset.py

Adjust thresholds below as needed.
"""

from pathlib import Path
from collections import Counter, defaultdict
import pandas as pd
import numpy as np
import sys
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# --------------------------- Configuration --------------------------- #
# Thresholds chosen based on EDA findings (see README/notes)
MIN_USER_INTERACTIONS = 10       # keep users with >= 10 interactions
MIN_PRODUCT_UNIQUE_USERS = 15    # keep products with >= 15 unique users

# Filenames to look for (prefer final outputs if available)
LOCAL_DIR = Path(__file__).parent
PREFERRED_FILES = {
    'train': ['train_final.csv', 'train_cleaned.csv', '../01_metadata_processing/train_cleaned.csv'],
    'valid': ['valid_final.csv', 'valid_cleaned.csv', '../01_metadata_processing/valid_cleaned.csv'],
    'test':  ['test_final.csv', 'test_cleaned.csv', '../01_metadata_processing/test_cleaned.csv']
}

# Metadata candidates
METADATA_CANDIDATES = ['metadata_final.csv', 'metadata_filtered.csv', '../01_metadata_processing/metadata_filtered.csv']

# Output filenames
OUT_FILES = {
    'train': LOCAL_DIR / 'train_dense.csv',
    'valid': LOCAL_DIR / 'valid_dense.csv',
    'test':  LOCAL_DIR / 'test_dense.csv',
    'metadata': LOCAL_DIR / 'metadata_dense.csv'
}

CHUNKSIZE = 200_000

# --------------------------- Helper functions --------------------------- #

def find_existing_file(candidates):
    for p in candidates:
        path = LOCAL_DIR / p if not Path(p).is_absolute() else Path(p)
        if path.exists():
            return path
    return None


def detect_column_names(sample_df):
    """Detect common column names for user/product/rating/timestamp.

    Returns a dict with keys: user_col, product_col, rating_col, timestamp_col
    """
    cols = set(sample_df.columns)
    # user id
    user_candidates = ['user_id', 'userid', 'userId', 'user']
    product_candidates = ['product_id', 'parent_asin', 'asin', 'product']
    rating_candidates = ['rating', 'ratings', 'stars']
    timestamp_candidates = ['timestamp', 'time', 'date']

    def pick(cands):
        for c in cands:
            if c in cols:
                return c
        return None

    user_col = pick(user_candidates)
    product_col = pick(product_candidates)
    rating_col = pick(rating_candidates)
    timestamp_col = pick(timestamp_candidates)

    if not user_col or not product_col:
        raise ValueError(f"Could not detect required columns in file. Found: {sample_df.columns}")

    return {
        'user_col': user_col,
        'product_col': product_col,
        'rating_col': rating_col,
        'timestamp_col': timestamp_col
    }


def summarize_counts(interaction_counts, product_user_map):
    interactions = sum(interaction_counts.values())
    n_users = len(interaction_counts)
    n_products = len(product_user_map)
    avg_interactions_per_user = np.mean(list(interaction_counts.values())) if n_users else 0
    avg_unique_users_per_product = np.mean([len(s) for s in product_user_map.values()]) if n_products else 0
    sparsity = 1.0 - (interactions / (max(1, n_users * n_products)))
    return {
        'interactions': interactions,
        'n_users': n_users,
        'n_products': n_products,
        'avg_interactions_per_user': avg_interactions_per_user,
        'avg_unique_users_per_product': avg_unique_users_per_product,
        'sparsity': sparsity
    }


def compute_global_maps(files_list, user_col, product_col, user_keep=None, product_keep=None):
    """Compute user interaction counts and product->set(users) mapping across files.

    Reads CSVs in chunks for memory efficiency. Optionally filters rows by
    existing keep sets (user_keep/product_keep) to support iterative filtering.
    """
    user_counts = Counter()
    product_users = defaultdict(set)

    total_rows = 0

    for fpath in files_list:
        logger.info(f"Scanning {fpath}")
        for chunk in pd.read_csv(fpath, usecols=[user_col, product_col], chunksize=CHUNKSIZE):
            chunk = chunk.dropna(subset=[user_col, product_col])
            # Optionally pre-filter by current keep sets
            if user_keep is not None:
                chunk = chunk[chunk[user_col].isin(user_keep)]
            if product_keep is not None:
                chunk = chunk[chunk[product_col].isin(product_keep)]

            total_rows += len(chunk)

            # Update user counts
            user_counts.update(chunk[user_col].astype(str).tolist())

            # Update product->unique users
            for prod, grp in chunk.groupby(product_col):
                users = set(grp[user_col].astype(str).tolist())
                product_users[str(prod)].update(users)

    logger.info(f"Scanned {total_rows:,} rows across {len(files_list)} files")
    return user_counts, product_users


def load_interaction_file_and_filter(in_file, out_file, cols_map, users_keep, products_keep):
    """Read input CSV in chunks, filter rows, keep essential columns, and write to out_file."""
    user_col = cols_map['user_col']
    product_col = cols_map['product_col']
    rating_col = cols_map.get('rating_col')
    timestamp_col = cols_map.get('timestamp_col')

    usecols = [c for c in [user_col, product_col, rating_col, timestamp_col] if c]
    first = True
    rows_written = 0

    for chunk in pd.read_csv(in_file, usecols=usecols, chunksize=CHUNKSIZE):
        chunk = chunk.dropna(subset=[user_col, product_col])
        chunk = chunk[chunk[user_col].astype(str).isin(users_keep) & chunk[product_col].astype(str).isin(products_keep)]

        if chunk.empty:
            continue

        # Standardize column names in output
        out_df = chunk.copy()
        out_df = out_df.rename(columns={user_col: 'user_id', product_col: 'product_id'})

        # Keep only essential columns in fixed order
        keep_cols = ['user_id', 'product_id']
        if rating_col and rating_col in out_df.columns:
            out_df = out_df.rename(columns={rating_col: 'rating'})
            keep_cols.append('rating')
        if timestamp_col and timestamp_col in out_df.columns:
            out_df = out_df.rename(columns={timestamp_col: 'timestamp'})
            keep_cols.append('timestamp')

        out_df = out_df[keep_cols]

        if first:
            out_df.to_csv(out_file, index=False, mode='w')
            first = False
        else:
            out_df.to_csv(out_file, index=False, header=False, mode='a')

        rows_written += len(out_df)

    logger.info(f"Wrote {rows_written:,} rows to {out_file}")
    return rows_written


def filter_metadata(metadata_path, out_path, product_keep):
    if metadata_path is None:
        logger.warning("No metadata file found to filter. Skipping metadata_dense creation.")
        return 0

    logger.info(f"Filtering metadata {metadata_path} -> {out_path}")
    # Read in full (metadata is typically smaller) and filter
    md = pd.read_csv(metadata_path)

    # detect product id column
    pid_cols = [c for c in ['product_id', 'parent_asin', 'parent_asin', 'asin'] if c in md.columns]
    pid_col = pid_cols[0] if pid_cols else None
    if pid_col is None:
        raise ValueError(f"Could not find product id column in metadata: {md.columns}")

    md = md[md[pid_col].astype(str).isin(product_keep)].copy()

    # Keep desired metadata columns if present
    keep = [pid_col]
    for c in ['title', 'main_category', 'category', 'categories', 'price', 'average_rating', 'rating_number', 'image', 'image_url']:
        if c in md.columns:
            keep.append(c)

    md = md[keep]
    # Standardize product id column name
    md = md.rename(columns={pid_col: 'product_id'})
    md.to_csv(out_path, index=False)
    logger.info(f"Saved {len(md):,} products to {out_path}")
    return len(md)


def print_summary(title, summary):
    logger.info(f"--- {title} ---")
    logger.info(f"Interactions: {summary['interactions']:,}")
    logger.info(f"Users: {summary['n_users']:,}")
    logger.info(f"Products: {summary['n_products']:,}")
    logger.info(f"Sparsity (1 - density): {summary['sparsity']:.6f}")
    logger.info(f"Avg interactions/user: {summary['avg_interactions_per_user']:.3f}")
    logger.info(f"Avg unique users/product: {summary['avg_unique_users_per_product']:.3f}")


def main():
    logger.info("Starting dense dataset creation")

    # Find files
    files = {}
    for k, candidates in PREFERRED_FILES.items():
        fp = find_existing_file(candidates)
        if not fp:
            logger.error(f"Could not find {k} file among candidates: {candidates}")
            sys.exit(1)
        files[k] = fp

    metadata_file = None
    for cand in METADATA_CANDIDATES:
        p = LOCAL_DIR / cand
        if p.exists():
            metadata_file = p
            break
    if metadata_file is None:
        # try one level up
        for cand in METADATA_CANDIDATES:
            p = Path(__file__).parent.parent / cand
            if p.exists():
                metadata_file = p
                break

    logger.info(f"Using interaction files: {files}")
    logger.info(f"Using metadata file: {metadata_file}")

    # Detect column names from a small sample of the train file
    sample = pd.read_csv(files['train'], nrows=1000)
    cols_map = detect_column_names(sample)
    logger.info(f"Detected columns: {cols_map}")

    interaction_paths = [files['train'], files['valid'], files['test']]

    # Compute initial global maps (no pre-filters)
    user_counts, product_users = compute_global_maps(interaction_paths, cols_map['user_col'], cols_map['product_col'])
    before_summary = summarize_counts(user_counts, product_users)
    print_summary('Before filtering', before_summary)

    # Iteratively prune
    users_keep = set([u for u, c in user_counts.items() if c >= MIN_USER_INTERACTIONS])
    products_keep = set([p for p, s in product_users.items() if len(s) >= MIN_PRODUCT_UNIQUE_USERS])

    logger.info(f"Initial users to keep: {len(users_keep):,}, products to keep: {len(products_keep):,}")

    it = 0
    while True:
        it += 1
        logger.info(f"Iteration {it}: computing counts with current keep sets")
        user_counts, product_users = compute_global_maps(interaction_paths, cols_map['user_col'], cols_map['product_col'], user_keep=users_keep, product_keep=products_keep)

        new_users_keep = set([u for u, c in user_counts.items() if c >= MIN_USER_INTERACTIONS])
        new_products_keep = set([p for p, s in product_users.items() if len(s) >= MIN_PRODUCT_UNIQUE_USERS])

        logger.info(f"Iteration {it}: users_keep {len(users_keep):,} -> {len(new_users_keep):,}; products_keep {len(products_keep):,} -> {len(new_products_keep):,}")

        if new_users_keep == users_keep and new_products_keep == products_keep:
            logger.info("Converged — no changes in keep sets")
            break

        users_keep, products_keep = new_users_keep, new_products_keep

        # Safety: if either set becomes empty, stop
        if not users_keep or not products_keep:
            logger.error("Filtering removed all users or products; loosen thresholds or check data.")
            break

    # Final summaries
    final_summary = summarize_counts(user_counts, product_users)
    print_summary('After filtering', final_summary)

    # Save filtered interaction files
    for key, in_path in files.items():
        out_path = OUT_FILES[key]
        logger.info(f"Filtering {in_path} -> {out_path}")
        load_interaction_file_and_filter(in_path, out_path, cols_map, users_keep, products_keep)

    # Filter metadata
    filter_metadata(metadata_file, OUT_FILES['metadata'], products_keep)

    logger.info("Dense dataset creation complete.")


if __name__ == '__main__':
    main()
