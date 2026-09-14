"""
FinSight Isolation Forest Transaction Anomaly Model.

Wraps scikit-learn's IsolationForest with anomaly scoring, severity assignment,
explanations, and persistence mechanisms.
"""

import json
import os
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from ml.feature_engineering import extract_features


class TransactionAnomalyModel:
    def __init__(self, n_estimators=100, contamination=0.05, random_state=42):
        self.n_estimators = n_estimators
        self.contamination = contamination
        self.random_state = random_state

        self.model = IsolationForest(
            n_estimators=self.n_estimators,
            contamination=self.contamination,
            random_state=self.random_state,
            n_jobs=-1,
        )

        self.feature_columns = None
        self.merchant_freq_map = None
        self.is_fitted = False

    def fit(self, input_data):
        """
        Fits the Isolation Forest on transaction feature matrix.
        """
        X, freq_map = extract_features(input_data)
        self.feature_columns = list(X.columns)
        self.merchant_freq_map = freq_map

        self.model.fit(X)
        self.is_fitted = True
        return self

    def predict_dataframe(self, input_data):
        """
        Runs inference on processed or raw transaction input_data.

        Returns list of dicts with:
          - is_anomaly (bool)
          - anomaly_score (float)
          - severity (str: "High", "Medium", "Low", "Normal")
          - explanation (str)
        """
        if not self.is_fitted:
            raise RuntimeError("Model is not fitted. Train or load a model first.")

        df = input_data if isinstance(input_data, pd.DataFrame) else pd.DataFrame(input_data)
        X, _ = extract_features(
            df,
            merchant_freq_map=self.merchant_freq_map,
            feature_columns=self.feature_columns,
        )

        # Isolation Forest outputs: 1 for inliers (normal), -1 for outliers (anomalies)
        raw_preds = self.model.predict(X)

        # decision_function outputs average depth score: negative = anomaly, positive = normal
        scores = self.model.decision_function(X)

        results = []
        for i in range(len(df)):
          raw_score = float(scores[i])
          is_anomaly = bool(raw_preds[i] == -1)

          # Assign severity and explanation
          if is_anomaly:
              if raw_score < -0.15:
                  severity = "High"
              elif raw_score < -0.05:
                  severity = "Medium"
              else:
                  severity = "Low"
          else:
              severity = "Normal"

          row = df.iloc[i]
          amt = float(row.get("amount", 0.0))
          merchant = str(row.get("merchant", "Unknown"))
          p_method = str(row.get("payment_method", "UPI"))

          if is_anomaly:
              explanation = (
                  f"Transaction of ₹{amt:,.2f} at '{merchant}' via {p_method} "
                  f"deviates significantly from learned behavioral patterns."
              )
          else:
              explanation = "Transaction pattern aligns with normal account behavior."

          results.append({
              "transaction_id": str(row.get("id", f"tx_{i}")),
              "is_anomaly": is_anomaly,
              "anomaly_score": round(raw_score, 4),
              "severity": severity,
              "explanation": explanation,
          })

        return results

    def save(self, model_path, metadata_path=None):
        """
        Persists the trained model and feature pipeline artifacts.
        """
        os.makedirs(os.path.dirname(model_path), exist_ok=True)
        bundle = {
            "model": self.model,
            "feature_columns": self.feature_columns,
            "merchant_freq_map": self.merchant_freq_map,
            "n_estimators": self.n_estimators,
            "contamination": self.contamination,
            "random_state": self.random_state,
        }
        joblib.dump(bundle, model_path)

        if metadata_path:
            os.makedirs(os.path.dirname(metadata_path), exist_ok=True)
            metadata = {
                "model_type": "IsolationForest",
                "n_estimators": self.n_estimators,
                "contamination": self.contamination,
                "random_state": self.random_state,
                "feature_columns": self.feature_columns,
                "total_features": len(self.feature_columns) if self.feature_columns else 0,
            }
            with open(metadata_path, "w", encoding="utf-8") as f:
                json.dump(metadata, f, indent=2)

    @classmethod
    def load(cls, model_path):
        """
        Loads a serialized model bundle from disk.
        """
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model file not found at: {model_path}")

        bundle = joblib.load(model_path)

        instance = cls(
            n_estimators=bundle.get("n_estimators", 100),
            contamination=bundle.get("contamination", 0.05),
            random_state=bundle.get("random_state", 42),
        )
        instance.model = bundle["model"]
        instance.feature_columns = bundle["feature_columns"]
        instance.merchant_freq_map = bundle["merchant_freq_map"]
        instance.is_fitted = True
        return instance
