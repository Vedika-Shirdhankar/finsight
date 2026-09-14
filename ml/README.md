# FinSight Machine Learning Anomaly Detection Microservice

An unsupervised Machine Learning microservice for real-time and batch transaction anomaly detection in **FinSight**. Built with **Python 3.10**, **Pandas**, **NumPy**, **Scikit-learn (Isolation Forest)**, **Joblib**, **Jupyter Notebook**, and **FastAPI**.

---

## 📌 Architecture Overview

```text
  FinSight App / Database (Supabase)
                  │
                  ▼
   [ FastAPI REST API (`/predict`) ]
                  │
                  ▼
  [ Preprocessing & Feature Engineering ]
  ├── Numerical & Log Scaling (`log_amount`)
  ├── Temporal Feature Extraction (`hour_of_day`, `day_of_week`, `is_weekend`)
  ├── Text Metric Computation (`description_length`)
  ├── Frequency Encoding (`merchant_frequency`)
  └── One-Hot Encodings (`type_*`, `payment_method_*`)
                  │
                  ▼
   [ Isolation Forest ML Model ]
                  │
                  ▼
  [ Anomaly Classification & Severity Engine ]
  ├── Decision Boundary Thresholding (Score > 0.0)
  ├── Severity Mapping (`High`, `Medium`, `Low`, `Normal`)
  └── Rule-Based Explanation Synthesizer
```

---

## 📁 Project Directory Structure

```text
ml/
├── app.py                      # FastAPI microservice with /health and /predict endpoints
├── feature_engineering.py      # Unified feature extraction pipeline
├── model.py                    # TransactionAnomalyModel (Isolation Forest wrapper)
├── predict.py                  # CLI inference script & python library entrypoint
├── train.py                    # Standalone model training & serialization script
├── requirements.txt            # Python dependencies specification
├── data/
│   └── sample_transactions.csv # 65-row representative schema-aligned transaction log
├── models/
│   ├── isolation_forest.joblib # Serialized model binary
│   └── model_metadata.json    # Feature schema & hyperparameter metadata
├── notebooks/
│   └── FinSight_ML_Anomaly_Detection.ipynb # 11-phase exploratory notebook
└── tests/
    └── test_ml.py              # Pytest suite covering all 9 operational specifications
```

---

## ⚙️ Installation & Setup

1. **Prerequisites:** Python 3.9+ (Python 3.10 recommended).
2. **Install dependencies:**
   ```bash
   pip install -r ml/requirements.txt
   ```

---

## 🚀 Execution & Command Reference

### 1. Train the ML Model
Fits Isolation Forest on transaction data and exports `isolation_forest.joblib` and `model_metadata.json`:
```bash
python ml/train.py
```

### 2. Run Single or Batch Inference via CLI
Evaluate a specific sample file or pass custom transaction JSON:
```bash
python ml/predict.py --input ml/data/sample_transactions.csv
```

### 3. Run Pytest Test Suite
Executes all 9 unit and integration test specifications:
```bash
python -m pytest ml/tests/test_ml.py -v
```

### 4. Launch FastAPI REST Service
Launches local web server on port 8000:
```bash
uvicorn ml.app:app --host 0.0.0.0 --port 8000 --reload
```
- **Health Check:** `GET http://localhost:8000/health`
- **Predict Endpoint:** `POST http://localhost:8000/predict`

---

## 🎙️ Interview Defense Master Guide (15 Core Questions & Answers)

### Q1: Why Isolation Forest over DBSCAN, One-Class SVM, or Autoencoders?
* **Isolation Forest:** Explicitly isolates anomalies by randomly selecting a feature and splitting value. Anomalies require significantly fewer splits (shorter tree depth) to isolate. It has $O(n \log n)$ training time complexity, linear inference time $O(n)$, low memory overhead, and does not require distance computations across high-dimensional space.
* **DBSCAN:** Requires $O(n^2)$ distance calculations, highly sensitive to $\epsilon$ and `min_samples` hyperparameters, and struggles with varying density clusters.
* **One-Class SVM:** Computational complexity scales quadratically with dataset size $O(n^2)$, making it inefficient for large transaction logs.
* **Autoencoders:** Requires deep learning frameworks (PyTorch/TensorFlow), extensive labeled validation datasets, GPU hardware, and complex hyperparameter tuning for low latency gains.

### Q2: How do you choose the `contamination` hyperparameter in an unsupervised setting?
* Contamination represents the expected proportion of anomalies in the dataset.
* In consumer financial transactions, fraud/anomaly rates typically range between 1% and 5%. We set `contamination=0.05` as a conservative baseline.
* In production, this hyperparameter can be dynamically tuned by calculating the percentile threshold of the raw decision function values or using historical user dispute callback rates.

### Q3: What features are most critical and why?
1. `log_amount`: Log-transformed transaction amount (`np.log1p`), preventing extreme high-value transactions from compressing standard scale features.
2. `hour_of_day`: Captures circadian spending habits (e.g. 2:00 AM transactions vs 2:00 PM).
3. `is_weekend` & `day_of_week`: Captures temporal spending frequency differences.
4. `merchant_frequency`: Identifies rare, low-frequency merchants vs frequent daily vendors.
5. `payment_method_*` one-hot encodings: Detects unusual payment channel switches (e.g. sudden cash or netbanking usage for high amounts).

### Q4: How are categorical variables like payment method handled?
* We use fixed-schema One-Hot Encoding (`type_expense`, `type_income`, `type_transfer`, `payment_method_upi`, `payment_method_card`, etc.).
* Fixed category lists prevent feature matrix dimension mismatch when evaluating single-item payloads during production inference.

### Q5: How is dataset shift or concept drift handled over time?
* Financial behavior changes during holidays, inflation, or sales events.
* We mitigate concept drift by implementing weekly or monthly automated model retrains using rolling transaction windows (e.g. trailing 90 days).
* We monitor shift by tracking distributions of raw decision scores over time.

### Q6: What is the difference between statistical Z-score and ML anomaly detection?
* **Z-score (1D Baseline):** Measures how many standard deviations an individual transaction amount is from the univariate mean. It fails to detect context-aware anomalies (e.g. a small ₹500 spending is normal at 2 PM, but anomalous at 3:15 AM via offshore payment).
* **Isolation Forest (Multivariate ML):** Evaluates multi-dimensional feature interactions (`amount` + `hour` + `merchant` + `payment_method`) simultaneously to catch multi-attribute anomalies.

### Q7: How to prevent high-spending users from getting false positives?
* High net-worth users who regularly make large transactions can be falsely flagged if trained only on global population data.
* **Solution:** Normalize amount features relative to the individual user's personal spending distribution (e.g., `user_relative_zscore = (amount - user_mean) / user_std`) or train user-segmented/cohort-based Isolation Forest models.

### Q8: What is the time complexity of training and inference?
* **Training:** $O(t \cdot \psi \log \psi)$, where $t$ is the number of trees (`n_estimators=100`) and $\psi$ is the sub-sampling size (default 256).
* **Inference:** $O(t \cdot \log \psi)$ per transaction—executing in under 5 milliseconds.

### Q9: What is the cold-start strategy for a new user with 0-5 transactions?
* When a user has insufficient transaction history, individual baseline features cannot be calculated.
* **Fallback Strategy:** Evaluate the user's transactions against the global population Isolation Forest model combined with strict rule-based heuristic checks (e.g. velocity limits, new device flags).

### Q10: How to explain Isolation Forest decisions to non-technical stakeholders?
* Analogize the decision tree splits to a game of 20 Questions:
  * Normal transactions look like millions of everyday transactions, so it takes 15-20 questions to narrow down a specific one.
  * Anomalous transactions have rare combinations (e.g. ₹90,000 + 3 AM + New Merchant), so it only takes 2 or 3 questions to isolate them immediately.

### Q11: How to scale this ML microservice to 1 million daily transactions?
1. **Stateless Service:** FastAPI service is completely stateless; run multiple worker replicas behind an NGINX / AWS ALB load balancer.
2. **Asynchronous Processing:** Stream transaction logs via Apache Kafka or RabbitMQ, consuming batches asynchronously with Celery/Redis workers.
3. **Model Caching:** Load the trained `.joblib` model binary into RAM during service startup to eliminate disk I/O.

### Q12: How do you handle missing values or corrupted dates?
* **Missing Amounts:** Coerced to numeric `0.0` with `abs()`.
* **Corrupted Dates:** Parsed with `pd.to_datetime(errors='coerce')` and missing timestamps filled with current server timestamp (`Timestamp.now()`).
* **Missing Categories:** Imputed with fallback schema defaults (`"expense"`, `"UPI"`, `"Unknown"`).

### Q13: How to evaluate model performance without ground truth labels?
1. **Synthetic Anomaly Injection:** Inject known synthetic anomalous patterns (e.g. 5x amount at 3 AM) into a benchmark set and calculate Precision/Recall.
2. **Manual Domain Expert Spot-Checking:** Perform audit reviews on top 5% highest scored anomalies.
3. **Pseudo-labeling from User Feedback:** Track user dismissals ("This was me") vs reported fraud ("Report unauthorized transaction").

### Q14: Why log-transform transaction amounts (`np.log1p`)?
* Financial transaction amounts follow a heavy-tailed, right-skewed power-law distribution.
* `log1p(x) = log(1 + x)` compresses extreme positive skewness, stabilizes variance, prevents numerical instability, and prevents a single ₹500,000 purchase from drowning out subtler temporal anomalies.

### Q15: What security and privacy considerations apply?
1. **PII Masking:** Direct identifiers (user names, card numbers, passwords, bank account numbers) are excluded from ML feature matrix (`X`).
2. **Data Minimization:** Only non-sensitive transaction metadata (`amount`, `timestamp`, `merchant`, `payment_type`) is passed to the ML engine.
3. **Model Binary Integrity:** `.joblib` files are signed or restricted in read permissions to prevent arbitrary code execution vulnerabilities.
