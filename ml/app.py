"""
FastAPI REST Service for FinSight Isolation Forest Transaction Anomaly Detection.

Exposes GET /health and POST /predict endpoints for real-time model inference.
"""

import json
import os
import sys
from typing import List, Optional
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from ml.model import TransactionAnomalyModel

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "models", "isolation_forest.joblib")
METADATA_PATH = os.path.join(BASE_DIR, "models", "model_metadata.json")

app = FastAPI(
    title="FinSight ML Anomaly Detection Service",
    description="Machine Learning service for identifying anomalous transactions using Isolation Forest.",
    version="1.0.0",
)

# Configure CORS for local development ports (Vite default: 5173) and deployment
allowed_origins_env = os.getenv("ALLOWED_ORIGINS")
if allowed_origins_env:
    allowed_origins = [o.strip() for o in allowed_origins_env.split(",") if o.strip()]
else:
    allowed_origins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://localhost:8001",
        "*"
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global model instance
model_instance: Optional[TransactionAnomalyModel] = None


def load_global_model():
    global model_instance
    if os.path.exists(MODEL_PATH):
        try:
            model_instance = TransactionAnomalyModel.load(MODEL_PATH)
            print(f"[FastAPI] Loaded ML model successfully from {MODEL_PATH}")
        except Exception as e:
            print(f"[FastAPI] Error loading model: {e}")
            model_instance = None
    else:
        print(f"[FastAPI] Warning: Model file {MODEL_PATH} not found. Train model first.")
        model_instance = None


@app.on_event("startup")
def startup_event():
    load_global_model()


class TransactionInput(BaseModel):
    id: Optional[str] = Field(default=None, description="Transaction unique identifier")
    amount: float = Field(description="Transaction amount in base currency")
    type: Optional[str] = Field(default="expense", description="income, expense, or transfer")
    merchant: Optional[str] = Field(default="Unknown", description="Merchant or beneficiary name")
    payment_method: Optional[str] = Field(default="UPI", description="UPI, card, netbanking, or cash")
    description: Optional[str] = Field(default="", description="Transaction note or description")
    transaction_date: Optional[str] = Field(default=None, description="ISO timestamp of transaction")


class PredictRequest(BaseModel):
    transactions: List[TransactionInput] = Field(..., min_length=1, description="List of transactions to evaluate")


@app.get("/health")
def health_check():
    """
    Returns service status, model availability, and metadata.
    """
    metadata = {}
    if os.path.exists(METADATA_PATH):
        try:
            with open(METADATA_PATH, "r", encoding="utf-8") as f:
                metadata = json.load(f)
        except Exception:
            pass

    return {
        "status": "ok",
        "service": "FinSight ML Anomaly Detection",
        "model_loaded": model_instance is not None and model_instance.is_fitted,
        "metadata": metadata,
    }


@app.post("/predict")
def predict_endpoint(payload: PredictRequest):
    """
    Evaluates a batch of transactions and returns anomaly scores and classifications.
    """
    global model_instance
    if model_instance is None or not model_instance.is_fitted:
        # Attempt lazy reload if model was trained after startup
        load_global_model()

    if model_instance is None or not model_instance.is_fitted:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="ML Anomaly Model is not loaded or trained. Execute train.py first.",
        )

    if not payload.transactions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Transaction payload list cannot be empty.",
        )

    try:
        dict_payload = [t.model_dump() for t in payload.transactions]
        results = model_instance.predict_dataframe(dict_payload)
        return {"results": results}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Inference error: {str(e)}",
        )
