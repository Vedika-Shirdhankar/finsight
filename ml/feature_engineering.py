"""
FinSight Feature Engineering Pipeline for Transaction Anomaly Detection.

This module provides reusable preprocessing and feature extraction logic that is
shared identically across:
 - Model training (train.py)
 - Inference (predict.py)
 - FastAPI REST API (app.py)
 - Jupyter Notebook (notebooks/FinSight_ML_Anomaly_Detection.ipynb)
"""

import numpy as np
import pandas as pd

# Standard categorical values expected in FinSight
KNOWN_TYPES = ["expense", "income", "transfer"]
KNOWN_PAYMENT_METHODS = ["UPI", "card", "netbanking", "cash"]


def prepare_dataframe(input_data):
    """
    Normalizes input data (DataFrame, list of dicts, or single dict) into a pandas DataFrame.
    Handles missing keys and fills defaults according to FinSight transaction schema.
    """
    if isinstance(input_data, dict):
        df = pd.DataFrame([input_data])
    elif isinstance(input_data, list):
        df = pd.DataFrame(input_data)
    elif isinstance(input_data, pd.DataFrame):
        df = input_data.copy()
    else:
        raise ValueError("Input data must be a dict, list of dicts, or pandas DataFrame.")

    # Ensure required schema columns exist with safe defaults
    schema_defaults = {
        "amount": 0.0,
        "type": "expense",
        "merchant": "Unknown",
        "payment_method": "UPI",
        "description": "",
        "transaction_date": pd.Timestamp.now().isoformat(),
    }

    for col, default_val in schema_defaults.items():
        if col not in df.columns:
            df[col] = default_val

    return df


def extract_features(input_data, merchant_freq_map=None, feature_columns=None):
    """
    Extracts numerical, temporal, categorical, and text-length features from transactions.

    Parameters:
    -----------
    input_data : dict | list[dict] | pd.DataFrame
        Raw transaction data matching FinSight schema.
    merchant_freq_map : dict, optional
        Pre-computed mapping of merchant name -> frequency count.
    feature_columns : list[str], optional
        Expected list of feature column names for feature alignment during inference.

    Returns:
    --------
    X : pd.DataFrame
        Processed feature matrix ready for Isolation Forest.
    updated_merchant_freq_map : dict
        Updated frequency map learned during preprocessing.
    """
    df = prepare_dataframe(input_data)

    # 1. Numerical & Log Features
    df["amount"] = pd.to_numeric(df["amount"], errors="coerce").fillna(0.0).abs()
    df["log_amount"] = np.log1p(df["amount"])

    # 2. Date Parsing & Temporal Features
    parsed_dates = pd.to_datetime(df["transaction_date"], errors="coerce")
    default_now = pd.Timestamp.now()
    parsed_dates = parsed_dates.fillna(default_now)

    df["day_of_week"] = parsed_dates.dt.dayofweek
    df["day_of_month"] = parsed_dates.dt.day
    df["hour_of_day"] = parsed_dates.dt.hour
    df["is_weekend"] = (df["day_of_week"] >= 5).astype(int)

    # 3. Text Length Feature
    df["description_length"] = (
        df["description"].fillna("").astype(str).str.len().astype(int)
    )

    # 4. Merchant Frequency Feature
    merchants = df["merchant"].fillna("Unknown").astype(str).str.strip().str.title()
    if merchant_freq_map is None:
        merchant_freq_map = merchants.value_counts().to_dict()

    df["merchant_frequency"] = merchants.map(
        lambda m: merchant_freq_map.get(m, 1)
    ).fillna(1)

    # 5. One-Hot Categorical Encoding (Fixed schema categories)
    # Type one-hot
    types_str = df["type"].fillna("").astype(str).str.lower()
    for t_type in KNOWN_TYPES:
        col_name = f"type_{t_type}"
        df[col_name] = (types_str == t_type).astype(int)

    # Payment Method one-hot
    pay_str = df["payment_method"].fillna("").astype(str).str.lower()
    for p_method in KNOWN_PAYMENT_METHODS:
        col_name = f"payment_method_{p_method.lower()}"
        df[col_name] = (pay_str == p_method.lower()).astype(int)

    # Base feature list
    numeric_features = [
        "amount",
        "log_amount",
        "day_of_week",
        "day_of_month",
        "hour_of_day",
        "is_weekend",
        "description_length",
        "merchant_frequency",
    ]
    categorical_features = [f"type_{t}" for t in KNOWN_TYPES] + [
        f"payment_method_{p.lower()}" for p in KNOWN_PAYMENT_METHODS
    ]

    all_features = numeric_features + categorical_features
    X = df[all_features].copy()

    # Handle any lingering NaNs
    X = X.fillna(0.0)

    # Feature Alignment for Inference
    if feature_columns is not None:
        for col in feature_columns:
            if col not in X.columns:
                X[col] = 0.0
        X = X[feature_columns]

    return X, merchant_freq_map
