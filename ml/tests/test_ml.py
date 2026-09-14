"""
Pytest Suite for FinSight ML Anomaly Detection Pipeline.

Tests:
 1. Feature engineering accuracy
 2. Missing & null value handling
 3. Date parsing & temporal feature extraction
 4. One-hot categorical encoding
 5. Empty input handling
 6. Insufficient transaction data handling
 7. Model serialization & loading from joblib
 8. Prediction output schema & score formatting
 9. FastAPI REST API endpoints (/health and /predict)
"""

import os
import sys
import pandas as pd
import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from ml.app import app
from ml.feature_engineering import extract_features, prepare_dataframe
from ml.model import TransactionAnomalyModel
from ml.predict import predict_anomalies
from ml.train import train_model


# Sample test fixtures
@pytest.fixture
def sample_txn_list():
    return [
        {
            "id": "t1",
            "amount": 500.0,
            "type": "expense",
            "merchant": "Swiggy",
            "payment_method": "UPI",
            "description": "Lunch",
            "transaction_date": "2026-09-10T12:30:00Z",
        },
        {
            "id": "t2",
            "amount": 75000.0,
            "type": "income",
            "merchant": "Acme Corp",
            "payment_method": "netbanking",
            "description": "Salary",
            "transaction_date": "2026-09-01T09:00:00Z",
        },
        {
            "id": "t3",
            "amount": 185000.0,
            "type": "expense",
            "merchant": "Jewelry Shop",
            "payment_method": "card",
            "description": "Late night purchase",
            "transaction_date": "2026-09-11T03:15:00Z",
        },
    ]


@pytest.fixture
def trained_model_path(tmp_path):
    data_path = os.path.join(tmp_path, "test_txns.csv")
    model_dir = os.path.join(tmp_path, "models")

    # Create dummy dataset for training test
    txns = []
    for i in range(20):
        txns.append({
            "id": f"tx_{i}",
            "amount": 100.0 + i * 10,
            "type": "expense" if i % 2 == 0 else "income",
            "merchant": "Groceries" if i % 3 == 0 else "Cafe",
            "payment_method": "UPI" if i % 2 == 0 else "card",
            "description": "Regular item",
            "transaction_date": "2026-09-01T10:00:00Z",
        })
    pd.DataFrame(txns).to_csv(data_path, index=False)

    train_model(data_path=data_path, model_dir=model_dir)
    return os.path.join(model_dir, "isolation_forest.joblib")


# Test 1: Feature Engineering Matrix
def test_feature_engineering_matrix(sample_txn_list):
    X, freq_map = extract_features(sample_txn_list)
    assert isinstance(X, pd.DataFrame)
    assert len(X) == 3
    assert "amount" in X.columns
    assert "log_amount" in X.columns
    assert "day_of_week" in X.columns
    assert "is_weekend" in X.columns
    assert "description_length" in X.columns
    assert "type_expense" in X.columns
    assert "payment_method_upi" in X.columns


# Test 2: Missing & Null Values Handling
def test_missing_values_handling():
    incomplete_data = [
        {"amount": None, "type": None, "merchant": None, "transaction_date": None},
        {},
    ]
    df = prepare_dataframe(incomplete_data)
    assert "amount" in df.columns
    assert "type" in df.columns

    X, _ = extract_features(incomplete_data)
    assert not X.isnull().values.any(), "Feature matrix must not contain any NaNs"


# Test 3: Date Processing & Temporal Features
def test_date_processing():
    data = [
        {"transaction_date": "2026-09-12T15:30:00Z"},  # Saturday (Weekend)
        {"transaction_date": "2026-09-14T09:00:00Z"},  # Monday (Weekday)
    ]
    X, _ = extract_features(data)
    assert X.iloc[0]["is_weekend"] == 1
    assert X.iloc[0]["day_of_week"] == 5  # Saturday
    assert X.iloc[0]["hour_of_day"] == 15
    assert X.iloc[1]["is_weekend"] == 0
    assert X.iloc[1]["day_of_week"] == 0  # Monday


# Test 4: One-Hot Categorical Encoding
def test_one_hot_encoding():
    data = [
        {"type": "expense", "payment_method": "UPI"},
        {"type": "income", "payment_method": "card"},
        {"type": "transfer", "payment_method": "cash"},
    ]
    X, _ = extract_features(data)
    assert X.iloc[0]["type_expense"] == 1
    assert X.iloc[0]["type_income"] == 0
    assert X.iloc[1]["payment_method_card"] == 1
    assert X.iloc[2]["type_transfer"] == 1


# Test 5: Empty Input Handling
def test_empty_input_handling():
    with pytest.raises(Exception):
        prepare_dataframe("invalid string input")


# Test 6: Insufficient Data Handling in Training
def test_insufficient_data_training(tmp_path):
    data_path = os.path.join(tmp_path, "tiny.csv")
    pd.DataFrame([{"amount": 100}]).to_csv(data_path, index=False)
    with pytest.raises(ValueError, match="Insufficient transaction history"):
        train_model(data_path=data_path, model_dir=str(tmp_path))


# Test 7: Model Serialization & Joblib Loading
def test_model_loading_and_saving(trained_model_path):
    assert os.path.exists(trained_model_path)
    loaded = TransactionAnomalyModel.load(trained_model_path)
    assert loaded.is_fitted is True
    assert loaded.feature_columns is not None


# Test 8: Prediction Output Schema & Score Formatting
def test_prediction_output_structure(trained_model_path, sample_txn_list):
    results = predict_anomalies(sample_txn_list, model_path=trained_model_path)
    assert isinstance(results, list)
    assert len(results) == 3
    for res in results:
        assert "transaction_id" in res
        assert "is_anomaly" in res
        assert "anomaly_score" in res
        assert "severity" in res
        assert "explanation" in res
        assert isinstance(res["is_anomaly"], bool)
        assert isinstance(res["anomaly_score"], float)
        assert res["severity"] in ["High", "Medium", "Low", "Normal"]


# Test 9: FastAPI REST Endpoints
def test_fastapi_endpoints(trained_model_path):
    client = TestClient(app)

    # Health check
    response = client.get("/health")
    assert response.status_code == 200
    json_resp = response.json()
    assert json_resp["status"] == "ok"
    assert "model_loaded" in json_resp

    # Prediction endpoint
    payload = {
        "transactions": [
            {
                "id": "test_fastapi_1",
                "amount": 185000.0,
                "type": "expense",
                "merchant": "Luxury Watch Shop",
                "payment_method": "card",
                "description": "Midnight purchase",
                "transaction_date": "2026-09-14T03:00:00Z",
            }
        ]
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 200
    res_data = response.json()
    assert "results" in res_data
    assert len(res_data["results"]) == 1
    assert res_data["results"][0]["transaction_id"] == "test_fastapi_1"
