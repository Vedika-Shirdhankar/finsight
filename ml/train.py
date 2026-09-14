"""
FinSight Model Training Script.

Loads transaction dataset, extracts features, trains Isolation Forest,
and persists joblib artifact and metadata.
"""

import argparse
import os
import sys
import pandas as pd

# Add root directory to sys.path to allow execution from any directory
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from ml.model import TransactionAnomalyModel


def train_model(data_path="ml/data/sample_transactions.csv", model_dir="ml/models"):
    """
    Executes the training pipeline.
    """
    print(f"[FinSight ML] Loading transaction dataset from: {data_path}")
    if not os.path.exists(data_path):
        raise FileNotFoundError(f"Dataset not found at {data_path}")

    df = pd.read_csv(data_path)
    print(f"[FinSight ML] Dataset loaded: {len(df)} transactions, {len(df.columns)} columns")

    if len(df) < 5:
        raise ValueError("Insufficient transaction history for training. At least 5 transactions required.")

    model = TransactionAnomalyModel(n_estimators=100, contamination=0.05, random_state=42)
    print("[FinSight ML] Fitting Isolation Forest model...")
    model.fit(df)

    # Generate self-predictions for validation metrics
    predictions = model.predict_dataframe(df)
    anomalies = [p for p in predictions if p["is_anomaly"]]

    model_path = os.path.join(model_dir, "isolation_forest.joblib")
    metadata_path = os.path.join(model_dir, "model_metadata.json")

    print(f"[FinSight ML] Saving trained model to {model_path}...")
    model.save(model_path, metadata_path)

    print("\n" + "=" * 50)
    print("FINSIGHT ML MODEL TRAINING COMPLETE")
    print("=" * 50)
    print(f"Total Transactions Processed: {len(df)}")
    print(f"Anomalies Flagged in Training Set: {len(anomalies)} ({len(anomalies)/len(df)*100:.1f}%)")
    print(f"Model Path: {model_path}")
    print(f"Metadata Path: {metadata_path}")
    print("=" * 50 + "\n")

    return model


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train FinSight Isolation Forest Anomaly Model")
    parser.add_argument("--data", default="ml/data/sample_transactions.csv", help="Path to input transactions CSV")
    parser.add_argument("--model-dir", default="ml/models", help="Directory to save model artifacts")
    args = parser.parse_args()

    train_model(args.data, args.model_dir)
