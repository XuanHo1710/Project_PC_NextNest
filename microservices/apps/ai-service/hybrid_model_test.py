"""
=============================================================================
HYBRID PREDICTION MODEL - LAPTOP RECOMMENDATION (UPDATED LOGIC)
Dataset size: 3000 samples
Target Accuracy: ~80%
=============================================================================
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import accuracy_score, classification_report, f1_score
from xgboost import XGBClassifier
from sklearn.neural_network import MLPClassifier
import warnings
import os
import json
import pickle

warnings.filterwarnings('ignore')

# ============================================================================
# PHẦN 1: TẠO DỮ LIỆU MẪU (SYNTHETIC DATA) - 3000 DÒNG
# Logic dựa trên nghiên cứu thị trường Việt Nam 2024-2025
# ============================================================================

def generate_synthetic_data(n_samples=3000, seed=42):
    np.random.seed(seed)
    
    # ---- 1. Định nghĩa các tập giá trị ----
    occupations = [
        'sinh_vien', 'vp_ke_toan', 'giao_vien',     # Nhóm văn phòng/học tập cơ bản
        'lap_trinh_vien', 'ky_su',                  # Nhóm kỹ thuật/cần hiệu năng CPU
        'designer', 'freelancer_creator',           # Nhóm sáng tạo/cần màn đẹp + GPU
        'gamer_streamer',                           # Nhóm Gaming
        'quan_ly_doanh_nhan'                        # Nhóm Business/Sang trọng
    ]
    
    # Brand phổ biến tại VN (theo thị phần ước tính 2025: Dell > HP > Lenovo > Asus > Apple > Acer > MSI)
    brands = ['Dell', 'HP', 'Lenovo', 'Asus', 'Apple', 'Acer', 'MSI', 'Samsung']
    
    # Mục đích sử dụng
    usage_types = ['van_phong_hoc_tap', 'gaming', 'do_hoa_ky_thuat', 'doanh_nhan_di_dong']
    
    data = []
    
    for _ in range(n_samples):
        # ---------------------------------------------------------
        # A. SINH THÔNG TIN NGƯỜI DÙNG (FEATURES)
        # ---------------------------------------------------------
        
        occupation = np.random.choice(occupations, p=[
            0.25, 0.15, 0.05,  # SV, VP, GV (~45%)
            0.15, 0.05,        # Dev, KS (~20%)
            0.10, 0.05,        # Design, Creator (~15%)
            0.10,              # Gamer (~10%)
            0.10               # Manager (~10%)
        ])
        
        # Thu nhập & Tuổi theo nghề nghiệp (Logic thực tế hơn)
        if occupation == 'sinh_vien':
            income = np.random.uniform(2, 8)       # Phụ thuộc gia đình/làm thêm
            age = np.random.randint(18, 23)
            pref_usage = 'van_phong_hoc_tap'       # Đa số học tập
            if np.random.random() < 0.3: pref_usage = 'gaming' # 30% nam sinh viên thích gaming
        
        elif occupation in ['vp_ke_toan', 'giao_vien']:
            income = np.random.uniform(8, 20)
            age = np.random.randint(23, 45)
            pref_usage = 'van_phong_hoc_tap'
            
        elif occupation in ['lap_trinh_vien', 'ky_su']:
            income = np.random.uniform(15, 50)
            age = np.random.randint(22, 40)
            pref_usage = 'do_hoa_ky_thuat'
            
        elif occupation in ['designer', 'freelancer_creator']:
            income = np.random.uniform(12, 40)
            age = np.random.randint(22, 35)
            pref_usage = 'do_hoa_ky_thuat'
            
        elif occupation == 'gamer_streamer':
            income = np.random.uniform(10, 60) # Chênh lệch cao
            age = np.random.randint(18, 30)
            pref_usage = 'gaming'
            
        elif occupation == 'quan_ly_doanh_nhan':
            income = np.random.uniform(25, 100)
            age = np.random.randint(30, 55)
            pref_usage = 'doanh_nhan_di_dong'
        
        # Làm tròn thu nhập
        monthly_income = round(income, 1)
        
        # Preferred Brand (Hãng yêu thích - User Bias)
        # Sinh viên/VP thích Dell/HP/Asus giá rẻ
        # Gamer thích MSI/Asus/Acer
        # Dev/Design thích Apple/Dell/ThinkPad(Lenovo)
        # Manager thích Apple/Dell/HP cao cấp
        
        if pref_usage == 'gaming':
            pref_brand_probs = [0.1, 0.1, 0.15, 0.25, 0.0, 0.2, 0.2, 0.0] # Asus, MSI, Acer cao
            preferred_brand = np.random.choice(brands, p=pref_brand_probs)
        elif occupation in ['designer', 'quan_ly_doanh_nhan']:
             # Apple, Dell cao
            pref_brand_probs = [0.2, 0.15, 0.1, 0.1, 0.35, 0.05, 0.0, 0.05]
            preferred_brand = np.random.choice(brands, p=pref_brand_probs)
        elif occupation == 'lap_trinh_vien':
            # Dell, Lenovo (ThinkPad), Apple
            pref_brand_probs = [0.25, 0.1, 0.25, 0.1, 0.25, 0.05, 0.0, 0.0]
            preferred_brand = np.random.choice(brands, p=pref_brand_probs)
        else: # Văn phòng / Sinh viên -> Dell, HP, Asus
            pref_brand_probs = [0.3, 0.25, 0.15, 0.2, 0.05, 0.05, 0.0, 0.0]
            preferred_brand = np.random.choice(brands, p=pref_brand_probs)

        # Các features phụ
        preferred_ram = np.random.choice(['8GB', '16GB', '32GB'], p=[0.4, 0.5, 0.1])
        purchase_count = np.random.choice([1, 2, 3, 4], p=[0.5, 0.3, 0.15, 0.05])
        purchase_month = np.random.randint(1, 13)
        purchase_quarter = (purchase_month - 1) // 3 + 1
        
        # ---------------------------------------------------------
        # B. TẠO TARGET (LABEL) - LOGIC CHUYÊN GIA (Rule-based to creating ground truth)
        # Đây là phần quan trọng nhất để model học được logic đúng
        # ---------------------------------------------------------
        
        # 1. Xác định Budget (Tầm giá) dựa trên Thu nhập & Nhu cầu
        # Rule: Mọi người thường mua máy giá trị từ 1-2 tháng lương (trừ SV/Gamer giàu)
        
        budget_score = monthly_income # Score sơ bộ
        
        if pref_usage == 'gaming' or pref_usage == 'do_hoa_ky_thuat':
            budget_score *= 1.5 # Sẵn sàng chi đậm hơn cho cấu hình
        
        if budget_score < 10:
            rec_price = 'duoi_15tr'
        elif budget_score < 20: 
            rec_price = '15tr_25tr'
        elif budget_score < 35:
            rec_price = '25tr_40tr'
        elif budget_score < 60:
            rec_price = '40tr_60tr'
        else:
            rec_price = 'tren_60tr'
            
        # 2. Xác định Category (Loại máy)
        if pref_usage == 'gaming':
            rec_category = 'Gaming'
        elif pref_usage == 'do_hoa_ky_thuat':
            if budget_score > 30: 
                rec_category = 'Workstation_Creative' # Máy trạm/Creator
            else:
                rec_category = 'Gaming' # Gaming giá rẻ làm đồ họa
        elif pref_usage == 'doanh_nhan_di_dong':
            rec_category = 'Ultrabook_Business'
        else: # Văn phòng
            if budget_score > 25:
                rec_category = 'Ultrabook_Business' # Sang chảnh
            else:
                rec_category = 'Office_Student' # Phổ thông
        
        # 3. Xác định RAM (Dựa trên nhu cầu)
        if rec_category in ['Gaming', 'Workstation_Creative']:
            if rec_price in ['duoi_15tr', '15tr_25tr']:
                rec_ram = '8GB' if np.random.random() < 0.3 else '16GB'
            else:
                rec_ram = np.random.choice(['16GB', '32GB'], p=[0.4, 0.6])
        elif rec_category == 'Ultrabook_Business':
            rec_ram = '16GB' # Chuẩn chung hiện nay
        else: # Office
            rec_ram = '8GB' if rec_price == 'duoi_15tr' else '16GB'
            
        # 4. Xác định ROM
        rec_rom = '512GB' # Mặc định phổ biến nhất
        if rec_category in ['Gaming', 'Workstation_Creative'] and rec_price not in ['duoi_15tr', '15tr_25tr']:
            rec_rom = '1TB'
        
        # 5. Xác định Brand (Phần khó nhất - kết hợp Prefer & Nhu cầu)
        # Logic: Nếu user thích hãng X và hãng X có dòng máy phù hợp -> Chọn X
        # Nếu không -> Chọn hãng mạnh nhất trong phân khúc đó
        
        # Mapping Brand thế mạnh theo Category
        strong_brands = {
            'Gaming': ['MSI', 'Asus', 'Acer', 'Lenovo', 'HP'],
            'Workstation_Creative': ['Apple', 'Dell', 'Asus', 'Lenovo'],
            'Ultrabook_Business': ['Apple', 'Dell', 'HP', 'Lenovo', 'Asus'],
            'Office_Student': ['Dell', 'HP', 'Asus', 'Acer', 'Lenovo']
        }
        
        # Lấy danh sách brand mạnh cho category này
        candidates = strong_brands[rec_category]
        
        if preferred_brand in candidates:
            # 70% user sẽ mua đúng hãng mình thích nếu nó có sản phẩm phù hợp
            rec_brand = preferred_brand if np.random.random() < 0.7 else np.random.choice(candidates)
        else:
            # Nếu hãng thích không làm dòng này (VD thích Apple nhưng cần Gaming) -> Chọn hãng top
            if rec_category == 'Gaming':
                rec_brand = np.random.choice(['Asus', 'MSI', 'Lenovo'], p=[0.4, 0.3, 0.3])
            elif rec_category == 'Office_Student':
                rec_brand = np.random.choice(['Dell', 'HP', 'Asus'], p=[0.35, 0.35, 0.3])
            else:
                rec_brand = np.random.choice(candidates)
                
        # 6. Gán biến động nhẹ (Noise) để model không bị overfit (học vẹt)
        if np.random.random() < 0.05: # 5% người mua ngẫu hứng
            rec_brand = np.random.choice(brands)
            
        data.append({
            'occupation': occupation,
            'monthly_income': monthly_income,
            'age': age,
            'preferred_brand': preferred_brand,
            'preferred_ram': preferred_ram,
            'usage_type': pref_usage,
            'purchase_count': purchase_count,
            'purchase_month': purchase_month,
            'purchase_quarter': purchase_quarter,
            # Targets
            'recommended_brand': rec_brand,
            'recommended_category': rec_category,
            'recommended_ram': rec_ram,
            'recommended_rom': rec_rom,
            'recommended_price_range': rec_price,
        })
        
    return pd.DataFrame(data)

# ============================================================================
# PHẦN 2 & 3 & 4: GIỮ NGUYÊN CODE CẤU TRÚC MODEL & TRAINING
# (Chỉ cập nhật tham số training để tốt hơn)
# ============================================================================

def preprocess_data(df):
    feature_cols = [
        'occupation', 'monthly_income', 'age', 'preferred_brand',
        'preferred_ram', 'usage_type', 'purchase_count',
        'purchase_month', 'purchase_quarter'
    ]
    target_cols = [
        'recommended_brand', 'recommended_category',
        'recommended_ram', 'recommended_rom',
        'recommended_price_range'
    ]
    
    df_encoded = df.copy()
    label_encoders = {}
    
    # Encode categorical features
    for col in ['occupation', 'preferred_brand', 'preferred_ram', 'usage_type']:
        le = LabelEncoder()
        df_encoded[col] = le.fit_transform(df_encoded[col])
        label_encoders[f'feature_{col}'] = le
        
    # Encode targets
    for col in target_cols:
        le = LabelEncoder()
        df_encoded[col] = le.fit_transform(df_encoded[col])
        label_encoders[f'target_{col}'] = le
        
    X = df_encoded[feature_cols].values
    y = df_encoded[target_cols].values
    
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    return X_scaled, y, target_cols, label_encoders, scaler, feature_cols

class HybridModel:
    def __init__(self):
        self.xgb_models = {}
        self.mlp_models = {}
        # Điều chỉnh trọng số: Tin tưởng XGBoost hơn vì dữ liệu có cấu trúc rõ ràng
        self.weights = { 
            'recommended_brand': (0.7, 0.3), 
            'recommended_category': (0.7, 0.3),
            'recommended_ram': (0.6, 0.4),
            'recommended_rom': (0.6, 0.4),
            'recommended_price_range': (0.7, 0.3)
        }
        
    def fit(self, X_train, y_train, target_cols):
        print("\n🚀 TRAINING MODELS...")
        for i, target in enumerate(target_cols):
            y_target = y_train[:, i]
            
            # Tinh chỉnh tham số XGBoost: Tăng độ sâu, giảm learning rate
            xgb = XGBClassifier(
                n_estimators=300,        # Tăng số cây
                max_depth=8,             # Tăng độ sâu để học rule phức tạp
                learning_rate=0.05,      # Giảm LR để học kỹ hơn
                subsample=0.8,
                colsample_bytree=0.8,
                random_state=42,
                eval_metric='mlogloss',
                use_label_encoder=False,
                verbosity=0
            )
            xgb.fit(X_train, y_target)
            self.xgb_models[target] = xgb
            
            # Tinh chỉnh MLP
            mlp = MLPClassifier(
                hidden_layer_sizes=(128, 64),
                activation='relu',
                solver='adam',
                max_iter=500,
                random_state=42
            )
            mlp.fit(X_train, y_target)
            self.mlp_models[target] = mlp

    def predict(self, X, target_cols):
        predictions = {}
        for target in target_cols:
            xgb_prob = self.xgb_models[target].predict_proba(X)
            mlp_prob = self.mlp_models[target].predict_proba(X)
            
            # Padding if needed (in case classes mismatch in fold - rare in full train)
            n_classes = max(xgb_prob.shape[1], mlp_prob.shape[1])
            if xgb_prob.shape[1] < n_classes:
                xgb_prob = np.hstack([xgb_prob, np.zeros((xgb_prob.shape[0], n_classes - xgb_prob.shape[1]))])
            if mlp_prob.shape[1] < n_classes:
                mlp_prob = np.hstack([mlp_prob, np.zeros((mlp_prob.shape[0], n_classes - mlp_prob.shape[1]))])
                
            w1, w2 = self.weights[target]
            avg_prob = w1 * xgb_prob + w2 * mlp_prob
            predictions[target] = np.argmax(avg_prob, axis=1)
        return predictions

    def save_model(self, encoders, scaler, save_dir='models'):
        """Lưu toàn bộ model, encoder và scaler"""
        if not os.path.exists(save_dir):
            os.makedirs(save_dir)
            
        # Lưu XGBoost models
        with open(os.path.join(save_dir, 'xgb_models.pkl'), 'wb') as f:
            pickle.dump(self.xgb_models, f)
            
        # Lưu MLP models
        with open(os.path.join(save_dir, 'mlp_models.pkl'), 'wb') as f:
            pickle.dump(self.mlp_models, f)
            
        # Lưu Encoders
        with open(os.path.join(save_dir, 'label_encoders.pkl'), 'wb') as f:
            pickle.dump(encoders, f)
            
        # Lưu Scaler
        with open(os.path.join(save_dir, 'scaler.pkl'), 'wb') as f:
            pickle.dump(scaler, f)
            
        print(f"\n✅ Model saved to directory: {save_dir}")

def main():
    print("="*60)
    print("🔥 HYBRID MODEL V2 - DATASET 3000 SAMPLES (REALISTIC LOGIC)")
    print("="*60)
    
    # 1. Tạo Data
    df = generate_synthetic_data(3000)
    df.to_csv('synthetic_purchase_data_v2.csv', index=False)
    print(f"✅ Created synthetic data: {df.shape}")
    
    # 2. Xử lý
    X, y, target_cols, label_encoders, scaler, feature_cols = preprocess_data(df)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # 3. Train
    model = HybridModel()
    model.fit(X_train, y_train, target_cols)
    
    # 4. Evaluate
    print("\n📊 EVALUATION REPORT (Test Set):")
    hybrid_preds = model.predict(X_test, target_cols)
    
    results = {}
    for i, target in enumerate(target_cols):
        y_true = y_test[:, i]
        y_pred = hybrid_preds[target]
        acc = accuracy_score(y_true, y_pred)
        results[target] = acc
        print(f"  🔹 {target:<25} Accuracy: {acc*100:.2f}%")

    # 5. Lưu model
    model.save_model(label_encoders, scaler)
    
    # 6. Lưu kết quả
    with open('model_v2_results.json', 'w') as f:
        json.dump(results, f)

if __name__ == '__main__':
    main()
