import os
import json
import pickle
import numpy as np
import pandas as pd
import logging
from database import get_mongo_db

logger = logging.getLogger(__name__)

class HybridPredictor:
    def __init__(self, models_dir='models'):
        self.models_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), models_dir)
        self.xgb_models = None
        self.mlp_models = None
        self.encoders = None
        self.scaler = None
        self.is_loaded = False
        
    def load_models(self):
        """Load các thành phần của model từ file pkl"""
        try:
            if not os.path.exists(self.models_dir):
                logger.error(f"Models directory not found: {self.models_dir}")
                return False
                
            with open(os.path.join(self.models_dir, 'xgb_models.pkl'), 'rb') as f:
                self.xgb_models = pickle.load(f)
                
            with open(os.path.join(self.models_dir, 'mlp_models.pkl'), 'rb') as f:
                self.mlp_models = pickle.load(f)
                
            with open(os.path.join(self.models_dir, 'label_encoders.pkl'), 'rb') as f:
                self.encoders = pickle.load(f)
                
            with open(os.path.join(self.models_dir, 'scaler.pkl'), 'rb') as f:
                self.scaler = pickle.load(f)
                
            self.is_loaded = True
            logger.info("Hybrid prediction models loaded successfully.")
            return True
        except Exception as e:
            logger.error(f"Failed to load hybrid models: {e}")
            return False

    def predict(self, user_profile):
        """
        Dự đoán cấu hình phù hợp dựa trên profile người dùng.
        user_profile: dict {
            'occupation': str,
            'monthly_income': float,
            'age': int,
            'preferred_brand': str,
            'preferred_ram': str,
            'usage_type': str
        }
        """
        if not self.is_loaded:
            if not self.load_models():
                return None

        # 1. Chuẩn bị dữ liệu input
        # Điền giá trị mặc định nếu thiếu
        data = {
            'occupation': user_profile.get('occupation', 'sinh_vien'),
            'monthly_income': float(user_profile.get('monthly_income', 10)),
            'age': int(user_profile.get('age', 20)),
            'preferred_brand': user_profile.get('preferred_brand', 'Dell'),
            'preferred_ram': user_profile.get('preferred_ram', '8GB'),
            'usage_type': user_profile.get('usage_type', 'van_phong_hoc_tap'),
            # Các giá trị này bot thường không hỏi được, nên random hoặc lấy trung bình
            'purchase_count': 1,
            'purchase_month': 6,
            'purchase_quarter': 2
        }
        
        # Mapping input text sang giá trị chuẩn của model (nếu cần)
        # Ví dụ: "văn phòng" -> "nhan_vien_van_phong"
        # Ở đây giả sử LLM đã extract đúng key.
        
        feature_cols = [
            'occupation', 'monthly_income', 'age', 'preferred_brand', 
            'preferred_ram', 'usage_type', 'purchase_count', 
            'purchase_month', 'purchase_quarter'
        ]
        
        # Encode categorical features
        try:
            df_input = pd.DataFrame([data])
            for col in ['occupation', 'preferred_brand', 'preferred_ram', 'usage_type']:
                le = self.encoders[f'feature_{col}']
                
                # Handle unseen labels (fallback to most common/first label)
                val = data[col]
                if val not in le.classes_:
                    logger.warning(f"Unseen label '{val}' for '{col}', using default.")
                    val = le.classes_[0] 
                
                df_input[col] = le.transform([val])
                
            X_input = df_input[feature_cols].values
            X_scaled = self.scaler.transform(X_input)
            
            # Predict
            predictions = {}
            target_cols = [
                'recommended_brand', 'recommended_category',
                'recommended_ram', 'recommended_rom',
                'recommended_price_range'
            ]
            
            # Weighted ensemble prediction logic (copy from training script)
            weights = { 
                'recommended_brand': (0.7, 0.3), 
                'recommended_category': (0.7, 0.3),
                'recommended_ram': (0.6, 0.4),
                'recommended_rom': (0.6, 0.4),
                'recommended_price_range': (0.7, 0.3)
            }
            
            for target in target_cols:
                xgb_prob = self.xgb_models[target].predict_proba(X_scaled)
                mlp_prob = self.mlp_models[target].predict_proba(X_scaled)
                
                # Padding adjustment
                n_classes_xgb = xgb_prob.shape[1]
                n_classes_mlp = mlp_prob.shape[1]
                n_classes = max(n_classes_xgb, n_classes_mlp)
                
                if n_classes_xgb < n_classes:
                    pad = np.zeros((1, n_classes - n_classes_xgb))
                    xgb_prob = np.hstack([xgb_prob, pad])
                if n_classes_mlp < n_classes:
                    pad = np.zeros((1, n_classes - n_classes_mlp))
                    mlp_prob = np.hstack([mlp_prob, pad])
                
                w1, w2 = weights[target]
                avg_prob = w1 * xgb_prob + w2 * mlp_prob
                pred_idx = np.argmax(avg_prob, axis=1)[0]
                
                le_target = self.encoders[f'target_{target}']
                pred_label = le_target.inverse_transform([pred_idx])[0]
                predictions[target] = pred_label
                
            return predictions
            
        except Exception as e:
            logger.error(f"Error during prediction: {e}")
            return None

    def find_products(self, criteria):
        """
        Tìm sản phẩm trong MongoDB khớp với criteria dự đoán.
        criteria = {
            'recommended_brand': 'Dell',
            'recommended_category': 'Office_Student',
            'recommended_price_range': '15tr_25tr', ...
        }
        """
        db = get_mongo_db()
        query = {
            "status": "ACTIVE",
            "isDeleted": {"$ne": True}
        }
        
        # 1. Filter Brand (Tên brand phải match, cần fuzzy search hoặc map ID)
        # Ở đây đơn giản hóa bằng regex
        brand_name = criteria['recommended_brand']
        brand_doc = db["brands"].find_one({"name": {"$regex": f"^{brand_name}", "$options": "i"}})
        if brand_doc:
            query["brand"] = brand_doc["_id"]
            
        # 2. Filter theo Price Range
        price_range = criteria['recommended_price_range']
        min_p, max_p = 0, 1000000000
        
        if price_range == 'duoi_15tr': max_p = 15000000
        elif price_range == '15tr_25tr': min_p, max_p = 15000000, 25000000
        elif price_range == '25tr_40tr': min_p, max_p = 25000000, 40000000
        elif price_range == '40tr_60tr': min_p, max_p = 40000000, 60000000
        elif price_range == 'tren_60tr': min_p = 60000000
        
        query["minPrice"] = {"$gte": min_p, "$lte": max_p}
        
        # 3. Filter theo RAM/ROM (Cần tìm trong variants)
        # Vì cấu trúc DB lưu combination trong variant, ở đây ta query product trước
        # rồi lọc variant sau hoặc dùng aggregate. Để nhanh, ta tìm product trước.
        
        products = list(db["products"].find(query).limit(10))
        
        results = []
        for p in products:
            # Check RAM/ROM in variants if needed, or just return relevant products
            results.append({
                "name": p.get("name"),
                "price": p.get("minPrice"),
                "brand": brand_name
            })
            
        return results

# Singleton instance
predictor = HybridPredictor()

def get_hybrid_recommendation(text_input):
    """
    Hàm entrypoint chính:
    1. Parse text_input từ user (dùng rule-based đơn giản hoặc LLM) để lấy profile.
    *Lưu ý: Để tích hợp hoàn chỉnh, việc parse này nên để Chatbot (Llama) làm
    và truyền JSON vào đây. Nhưng hàm này hỗ trợ test nhanh.*
    """
    # Mock parser for testing purposes (nếu gọi trực tiếp)
    profile = {
        'occupation': 'sinh_vien',
        'monthly_income': 5,
        'age': 20,
        'preferred_brand': 'Asus', # Default fallback
    }
    return predictor.predict(profile)
