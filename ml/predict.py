"""
FinSight Inference Module & CLI.

Runs anomaly detection predictions on input transaction datasets or JSON batches
using the saved Isolation Forest joblib artifact.
"""

import argparse
import json
import os
import sys
import pandas as pd

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from ml.model import TransactionAnomalyModel


def predict_anomalies(input_data, model_path="ml/models/isolation_forest.joblib"):
    """
    Loads saved model and predicts transaction anomalies.

    Parameters:
    -----------
    input_data : list[dict] | pd.DataFrame | dict
        Transaction data matching FinSight schema.
    model_path : str
        Path to saved joblib model artifact.

    Returns:
    --------
    list[dict] : List of anomaly prediction results.
    """
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model file not found at {model_path}. Train the model first via train.py.")

    model = TransactionAnomalyModel.load(model_path)
    return model.predict_dataframe(input_data)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Predict Transaction Anomalies using FinSight ML Model")
    parser.add_argument("--data", "--input", default="ml/data/sample_transactions.csv", help="Path to input CSV file")
    parser.add_argument("--model", default="ml/models/isolation_forest.joblib", help="Path to trained model artifact")
    args = parser.parse_args()

    if os.path.exists(args.data):
        df = pd.read_csv(args.data)
        results = predict_anomalies(df, args.model)
        anomalies = [r for r in results if r["is_anomaly"]]

        print(f"\nProcessed {len(results)} transactions. Found {len(anomalies)} anomalies:\n")
        print(json.dumps(anomalies, indent=2))
    else:
        print(f"Error: Input file '{args.data}' does not exist.")
