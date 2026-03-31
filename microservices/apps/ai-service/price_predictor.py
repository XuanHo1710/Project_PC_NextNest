"""
══════════════════════════════════════════════════════════════════════════
  TECH PRICE PREDICTOR — Inference Module
══════════════════════════════════════════════════════════════════════════
  Loads Colab-trained sklearn Pipeline models (.pkl) for price prediction.
  Each pipeline contains: ColumnTransformer (OneHotEncoder) → Regressor
  Target was log1p(price), so we expm1() the output.

  Supports: laptop, smartphone
  Models trained on Kaggle data with 12+ algorithms, best saved as:
    - laptop_xgboost.pkl        (XGBoost, R²=0.846)
    - laptop_price_model.pkl    (Stacking Ensemble)
    - smartphone_xgboost.pkl    (XGBoost)
    - smartphone_price_model.pkl(Stacking Ensemble)
══════════════════════════════════════════════════════════════════════════
"""

import os
import json
import logging
import numpy as np
import pandas as pd
import joblib

logger = logging.getLogger(__name__)

# ── Feature schemas matching Colab training exactly ──────────────────
# Laptop X columns order: brand, type_name, cpu_brand, gpu_brand, os,  (cat)
#   inches, ram_gb, cpu_freq_ghz, ssd_gb, hdd_gb, touchscreen, ips, ppi  (num)
# Smartphone X columns order: brand,  (cat)
#   ram_gb, storage_gb, rating, has_camera, discount_pct  (num)

CATEGORY_SCHEMA: dict[str, dict] = {
    "laptop": {
        "categorical": ["brand", "type_name", "cpu_brand", "gpu_brand", "os"],
        "numerical": ["inches", "ram_gb", "cpu_freq_ghz", "ssd_gb", "hdd_gb",
                       "touchscreen", "ips", "ppi"],
        "price_currency": "EUR",
        "price_to_vnd": 27000,
    },
    "smartphone": {
        "categorical": ["brand"],
        "numerical": ["ram_gb", "storage_gb", "rating", "has_camera", "discount_pct"],
        "price_currency": "INR",
        "price_to_vnd": 320,
    },
}

# Model files (Colab output) — primary = stacking, fallback = xgboost
MODEL_FILES: dict[str, dict] = {
    "laptop": {
        "primary": "laptop_price_model.pkl",      # Stacking Ensemble
        "fallback": "laptop_xgboost.pkl",          # XGBoost standalone
    },
    "smartphone": {
        "primary": "smartphone_price_model.pkl",
        "fallback": "smartphone_xgboost.pkl",
    },
}

# Defaults for missing numeric fields
NUMERIC_DEFAULTS = {
    "inches": 15.6, "ram_gb": 8, "cpu_freq_ghz": 2.5, "ssd_gb": 256,
    "hdd_gb": 0, "touchscreen": 0, "ips": 0, "ppi": 141.2,
    "storage_gb": 64, "rating": 4.0, "has_camera": 1, "discount_pct": 5.0,
}

# Defaults for missing categorical fields
CATEGORICAL_DEFAULTS = {
    "brand": "HP", "type_name": "Notebook", "cpu_brand": "Intel",
    "gpu_brand": "Intel", "os": "Windows",
}

# Known model metrics from Colab training
MODEL_METRICS = {
    "laptop": {"r2": 0.846, "mae_eur": 205, "rmse_eur": 283, "mape": 15.0},
    "smartphone": {"r2": 0.848, "mae_inr": 4553, "rmse_inr": 8442, "mape": 26.4},
}


class TechPricePredictor:
    """
    Load Colab-trained sklearn Pipeline models and predict product prices.
    Each pipeline: ColumnTransformer(OneHotEncoder + passthrough) → Model
    Target: log1p(price_in_original_currency)
    """

    def __init__(self, models_dir: str = "models"):
        self.models_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), models_dir)
        self._pipelines: dict[str, object] = {}  # category → sklearn Pipeline
        self._results: dict | None = None         # model_results.json
        self.is_loaded = False

    # ── Loading ──────────────────────────────────────────────────────

    def load_models(self) -> bool:
        """Load all available Colab-trained pipeline models."""
        try:
            # Load model evaluation results
            results_path = os.path.join(self.models_dir, "model_results.json")
            if os.path.exists(results_path):
                with open(results_path, "r", encoding="utf-8") as f:
                    self._results = json.load(f)
                logger.info("Loaded model_results.json")

            # Load pipeline models
            for cat, files in MODEL_FILES.items():
                loaded = False
                for key in ["primary", "fallback"]:
                    path = os.path.join(self.models_dir, files[key])
                    if os.path.exists(path):
                        pipeline = joblib.load(path)
                        self._pipelines[cat] = pipeline
                        logger.info(f"Loaded {cat} model: {files[key]} ({type(pipeline.named_steps.get('model', pipeline)).__name__})")
                        loaded = True
                        break
                if not loaded:
                    logger.warning(f"No model file found for {cat}")

            self.is_loaded = len(self._pipelines) > 0
            logger.info(f"Price predictor ready — {len(self._pipelines)} categories: {list(self._pipelines.keys())}")
            return self.is_loaded
        except Exception as e:
            logger.error(f"Failed to load price models: {e}")
            return False

    def _ensure_loaded(self) -> bool:
        if not self.is_loaded:
            return self.load_models()
        return self.is_loaded

    # ── Public API ───────────────────────────────────────────────────

    @property
    def supported_categories(self) -> list[str]:
        return list(CATEGORY_SCHEMA.keys())

    def get_category_info(self, category: str) -> dict | None:
        """Return feature schema and model metrics for a category."""
        if category not in CATEGORY_SCHEMA:
            return None
        schema = CATEGORY_SCHEMA[category]
        metrics = MODEL_METRICS.get(category, {})

        # Extract feature importances from pipeline if available
        importances = self._extract_importances(category)

        return {
            "category": category,
            "features": {
                "categorical": schema["categorical"],
                "numerical": schema["numerical"],
            },
            "metrics": metrics,
            "feature_importances": importances,
        }

    def predict_price(self, category: str, specs: dict) -> dict | None:
        """
        Predict price for a product given its category and specs.
        Pipeline expects raw DataFrame → OneHotEncoder + Model → log1p(price).
        We expm1() and convert to VND.

        Returns:
            {
                "predicted_price": int (VND),
                "price_range": {"low": int, "high": int},
                "confidence": float,
                "currency": "VND",
                "category": str,
                "price_factors": [{"feature": str, "impact": float}, ...],
            }
        """
        if not self._ensure_loaded():
            return None

        if category not in self._pipelines:
            logger.warning(f"No model for category: {category}")
            return None

        pipeline = self._pipelines[category]
        schema = CATEGORY_SCHEMA[category]

        try:
            # Build input row
            row = self._build_input_row(category, specs)

            # Column order must match training: cat_cols + num_cols
            col_order = schema["categorical"] + schema["numerical"]
            df_input = pd.DataFrame([row])[col_order]

            # Predict (output is log1p scale)
            pred_log = pipeline.predict(df_input)[0]
            pred_original = float(np.expm1(pred_log))
            pred_original = max(pred_original, 0)

            # Convert to VND
            to_vnd = schema["price_to_vnd"]
            pred_vnd = pred_original * to_vnd

            # Metrics
            metrics = MODEL_METRICS.get(category, {})
            r2 = metrics.get("r2", 0.85)
            mape = metrics.get("mape", 15.0)
            confidence = min(r2, 0.99)

            # Price range
            spread = mape / 100
            low_vnd = int(round(pred_vnd * (1 - spread), -3))
            high_vnd = int(round(pred_vnd * (1 + spread), -3))
            pred_vnd_int = int(round(pred_vnd, -3))

            # Feature importances
            importances = self._extract_importances(category)
            price_factors = [
                {"feature": feat, "impact": round(imp, 3)}
                for feat, imp in list(importances.items())[:6]
            ]

            return {
                "predicted_price": pred_vnd_int,
                "price_range": {"low": max(low_vnd, 0), "high": high_vnd},
                "confidence": round(confidence, 3),
                "currency": "VND",
                "category": category,
                "price_factors": price_factors,
                "price_original": {
                    "value": round(pred_original, 2),
                    "currency": schema["price_currency"],
                },
            }

        except Exception as e:
            logger.error(f"Price prediction error for {category}: {e}", exc_info=True)
            return None

    # ── Internal ─────────────────────────────────────────────────────

    def _build_input_row(self, category: str, specs: dict) -> dict:
        """Build a single input row from user specs, filling defaults for missing values."""
        schema = CATEGORY_SCHEMA[category]
        row = {}

        # Categorical: use spec value or default
        for col in schema["categorical"]:
            val = specs.get(col)
            if val is not None:
                row[col] = str(val)
            else:
                row[col] = CATEGORICAL_DEFAULTS.get(col, "Unknown")

        # Numerical: use spec value or default
        for col in schema["numerical"]:
            val = specs.get(col, NUMERIC_DEFAULTS.get(col, 0))
            try:
                row[col] = float(val)
            except (ValueError, TypeError):
                row[col] = float(NUMERIC_DEFAULTS.get(col, 0))

        return row

    def _extract_importances(self, category: str) -> dict[str, float]:
        """Extract feature importances from the pipeline's model step."""
        if category not in self._pipelines:
            return {}

        pipeline = self._pipelines[category]
        schema = CATEGORY_SCHEMA[category]

        try:
            model = pipeline.named_steps.get("model")
            if model is None:
                return {}

            # Get the actual regressor (may be StackingRegressor or XGBRegressor)
            # For stacking, try the final_estimator or first sub-estimator
            importances = None
            if hasattr(model, "feature_importances_"):
                importances = model.feature_importances_
            elif hasattr(model, "estimators_"):
                # StackingRegressor — grab importances from fitted sub-estimators
                fitted = model.estimators_ if hasattr(model, "estimators_") else []
                for est in fitted:
                    if hasattr(est, "feature_importances_"):
                        importances = est.feature_importances_
                        break

            if importances is None:
                return {}

            # Map importances to feature names
            preprocessor = pipeline.named_steps.get("preprocess") or pipeline.named_steps.get("pre")
            if preprocessor is None:
                return {}

            # Get OHE feature names
            ohe = preprocessor.transformers_[0][1]  # ('cat', OneHotEncoder, ...)
            cat_names = list(ohe.get_feature_names_out(schema["categorical"]))
            num_names = schema["numerical"]
            all_names = cat_names + num_names

            if len(importances) != len(all_names):
                # Mismatch — return raw numerical importance only
                return {}

            result = dict(zip(all_names, importances.tolist()))
            # Sort by absolute importance descending
            result = dict(sorted(result.items(), key=lambda x: abs(x[1]), reverse=True))
            return result

        except Exception as e:
            logger.debug(f"Could not extract importances for {category}: {e}")
            return {}


# ── Singleton ────────────────────────────────────────────────────────
tech_price_predictor = TechPricePredictor()
