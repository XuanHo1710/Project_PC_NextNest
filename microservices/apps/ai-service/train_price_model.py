"""
══════════════════════════════════════════════════════════════════════════
  TECH PRODUCT PRICE PREDICTION — Training Pipeline v2.0
══════════════════════════════════════════════════════════════════════════
  Dự đoán giá linh kiện máy tính, laptop, điện thoại dựa trên thông số.

  Danh mục hỗ trợ:
    - laptop      : Laptop / Notebook
    - cpu         : Bộ vi xử lý (Intel / AMD)
    - ram         : Bộ nhớ RAM (DDR4 / DDR5)
    - gpu         : Card đồ họa rời (NVIDIA / AMD)
    - smartphone  : Điện thoại thông minh
    - ssd         : Ổ cứng SSD

  Models : XGBoost + LightGBM → Weighted Ensemble (60/40)
  Metrics: R², MAE, RMSE, MAPE
══════════════════════════════════════════════════════════════════════════
"""

import os
import json
import time
import argparse
import warnings
import numpy as np
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import r2_score, mean_absolute_error, mean_squared_error
from xgboost import XGBRegressor
from lightgbm import LGBMRegressor

warnings.filterwarnings("ignore")

# ════════════════════════════════════════════════════════════════════════
# PHẦN 1: SYNTHETIC DATA — Mô phỏng thị trường Việt Nam 2024-2025
# ════════════════════════════════════════════════════════════════════════


class TechPriceDataGenerator:
    """Sinh dữ liệu giá sản phẩm công nghệ mô phỏng thực tế VN."""

    def __init__(self, seed: int = 42):
        self.rng = np.random.default_rng(seed)

    def generate_all(self, n: int = 3000) -> dict[str, pd.DataFrame]:
        data = {}
        for name, fn in [
            ("laptop", self._gen_laptop),
            ("cpu", self._gen_cpu),
            ("ram", self._gen_ram),
            ("gpu", self._gen_gpu),
            ("smartphone", self._gen_smartphone),
            ("ssd", self._gen_ssd),
        ]:
            data[name] = fn(n)
        return data

    # ── Laptop ─────────────────────────────────────────────────────────
    def _gen_laptop(self, n: int) -> pd.DataFrame:
        BRANDS = ["Dell", "HP", "Lenovo", "Asus", "Acer", "MSI", "Apple", "Samsung", "LG", "Huawei"]
        BRAND_MULT = {
            "Dell": 1.00, "HP": 0.95, "Lenovo": 0.95, "Asus": 1.05,
            "Acer": 0.85, "MSI": 1.15, "Apple": 1.55, "Samsung": 1.10,
            "LG": 1.05, "Huawei": 0.90,
        }
        CPU_TIERS = {
            "i3": 2.5, "i5": 5, "i7": 9, "i9": 15,
            "Ryzen 3": 2, "Ryzen 5": 4.5, "Ryzen 7": 8, "Ryzen 9": 13,
            "M1": 8, "M2": 12, "M3": 15, "M3 Pro": 22, "M3 Max": 35,
        }
        GPU_TIERS = {
            "Integrated": 0, "GTX 1650": 2, "RTX 3050": 4, "RTX 4050": 6,
            "RTX 4060": 9, "RTX 4070": 14, "RTX 4080": 22, "RTX 4090": 35,
            "RX 6500M": 2, "RX 7600M": 5, "RX 7700S": 8,
        }
        RAM_VAL = {8: 1, 16: 2.2, 32: 5, 64: 12}
        STORAGE_VAL = {256: 0.5, 512: 1, 1024: 2.5, 2048: 5}
        RES_VAL = {"HD": -0.5, "FHD": 0, "QHD": 1.5, "4K": 3.5}

        rows = []
        for _ in range(n):
            brand = self.rng.choice(BRANDS)

            # CPU
            if brand == "Apple":
                cpu_brand, cpu_tier = "Apple", self.rng.choice(["M1", "M2", "M3", "M3 Pro", "M3 Max"],
                                                                p=[0.15, 0.25, 0.30, 0.20, 0.10])
                gpu_tier = "Integrated"
            else:
                cpu_brand = self.rng.choice(["Intel", "AMD"], p=[0.6, 0.4])
                if cpu_brand == "Intel":
                    cpu_tier = self.rng.choice(["i3", "i5", "i7", "i9"], p=[0.15, 0.35, 0.35, 0.15])
                else:
                    cpu_tier = self.rng.choice(["Ryzen 3", "Ryzen 5", "Ryzen 7", "Ryzen 9"],
                                               p=[0.10, 0.35, 0.35, 0.20])
                # GPU
                gpu_pool = list(GPU_TIERS.keys())
                gpu_probs = np.array([0.25, 0.08, 0.12, 0.15, 0.18, 0.10, 0.05, 0.02, 0.02, 0.02, 0.01])
                gpu_tier = self.rng.choice(gpu_pool, p=gpu_probs)

            ram_gb = int(self.rng.choice([8, 16, 32, 64], p=[0.20, 0.45, 0.28, 0.07]))
            storage_gb = int(self.rng.choice([256, 512, 1024, 2048], p=[0.08, 0.42, 0.38, 0.12]))
            screen_size = float(self.rng.choice([13.3, 14, 15.6, 16, 17.3], p=[0.15, 0.25, 0.30, 0.20, 0.10]))
            screen_res = self.rng.choice(["HD", "FHD", "QHD", "4K"], p=[0.05, 0.50, 0.33, 0.12])
            weight_kg = round(float(self.rng.uniform(0.9 if screen_size <= 14 else 1.5,
                                                      2.0 if screen_size <= 14 else 3.2)), 1)
            is_touchscreen = int(self.rng.random() < 0.12)

            # --- Price formula (triệu VND) ---
            base = (5 + CPU_TIERS[cpu_tier] + GPU_TIERS[gpu_tier]
                    + RAM_VAL[ram_gb] + STORAGE_VAL[storage_gb]
                    + RES_VAL[screen_res] + is_touchscreen * 1.2
                    + (screen_size - 14) * 0.3)
            price = base * BRAND_MULT.get(brand, 1.0)
            price_vnd = int(round(price * self.rng.normal(1.0, 0.07) * 1_000_000, -4))
            price_vnd = max(price_vnd, 5_000_000)

            rows.append({
                "brand": brand, "cpu_brand": cpu_brand, "cpu_tier": cpu_tier,
                "gpu_tier": gpu_tier, "ram_gb": ram_gb, "storage_gb": storage_gb,
                "screen_size": screen_size, "screen_resolution": screen_res,
                "weight_kg": weight_kg, "is_touchscreen": is_touchscreen,
                "price": price_vnd,
            })
        return pd.DataFrame(rows)

    # ── CPU (Desktop) ──────────────────────────────────────────────────
    def _gen_cpu(self, n: int) -> pd.DataFrame:
        SPECS = {
            # family: (cores, threads, base_ghz, boost_ghz, tdp, cache_mb, base_price_M)
            "i3-12100":  (4,  8,  3.3, 4.3,  60, 12,  2.8),
            "i3-13100":  (4,  8,  3.4, 4.5,  60, 12,  3.2),
            "i5-12400":  (6, 12,  2.5, 4.4,  65, 18,  4.5),
            "i5-13400":  (10,16,  2.5, 4.6,  65, 20,  5.2),
            "i5-13600K": (14,20,  3.5, 5.1, 125, 24,  7.0),
            "i5-14600K": (14,20,  3.5, 5.3, 125, 24,  7.5),
            "i7-13700K": (16,24,  3.4, 5.4, 125, 30, 10.0),
            "i7-14700K": (20,28,  3.4, 5.6, 125, 33, 11.0),
            "i9-13900K": (24,32,  3.0, 5.8, 125, 36, 15.0),
            "i9-14900K": (24,32,  3.2, 6.0, 125, 36, 16.5),
            "R5-5600":   (6, 12,  3.5, 4.4,  65, 32,  3.0),
            "R5-5600X":  (6, 12,  3.7, 4.6,  65, 32,  3.8),
            "R5-7600":   (6, 12,  3.8, 5.1,  65, 32,  5.5),
            "R5-7600X":  (6, 12,  4.7, 5.3, 105, 32,  6.2),
            "R7-5800X":  (8, 16,  3.8, 4.7, 105, 32,  6.0),
            "R7-7700X":  (8, 16,  4.5, 5.4, 105, 32,  8.5),
            "R7-7800X3D":(8, 16,  4.2, 5.0, 120, 96, 11.0),
            "R9-7900X":  (12,24,  4.7, 5.6, 170, 64, 13.5),
            "R9-7950X":  (16,32,  4.5, 5.7, 170, 64, 18.0),
            "R9-7950X3D":(16,32,  4.2, 5.7, 120,128, 20.0),
        }
        families = list(SPECS.keys())

        rows = []
        for _ in range(n):
            family = self.rng.choice(families)
            cores, threads, base, boost, tdp, cache, base_price = SPECS[family]
            brand = "Intel" if family.startswith("i") else "AMD"
            socket = "LGA1700" if brand == "Intel" else "AM5" if "7" in family else "AM4"
            has_igpu = 1 if (brand == "Intel" or "G" in family) else 0

            price = base_price * self.rng.normal(1.0, 0.06) * 1_000_000
            price_vnd = int(round(max(price, 1_500_000), -4))

            rows.append({
                "brand": brand, "family": family, "cores": cores, "threads": threads,
                "base_clock_ghz": base, "boost_clock_ghz": boost,
                "tdp_watts": tdp, "cache_mb": cache, "has_igpu": has_igpu,
                "socket": socket, "price": price_vnd,
            })
        return pd.DataFrame(rows)

    # ── RAM ─────────────────────────────────────────────────────────────
    def _gen_ram(self, n: int) -> pd.DataFrame:
        BRANDS = ["Corsair", "G.Skill", "Kingston", "TeamGroup", "Crucial", "Lexar"]
        BRAND_MULT = {"Corsair": 1.15, "G.Skill": 1.12, "Kingston": 1.05,
                      "TeamGroup": 0.95, "Crucial": 1.0, "Lexar": 0.92}
        DDR4_SPEEDS = [2666, 3200, 3600, 4000]
        DDR5_SPEEDS = [4800, 5200, 5600, 6000, 6400, 7200]

        rows = []
        for _ in range(n):
            brand = self.rng.choice(BRANDS)
            ddr_type = self.rng.choice(["DDR4", "DDR5"], p=[0.35, 0.65])
            if ddr_type == "DDR4":
                speed = int(self.rng.choice(DDR4_SPEEDS))
                cap = int(self.rng.choice([8, 16, 32], p=[0.35, 0.45, 0.20]))
                base = {8: 0.4, 16: 0.75, 32: 1.5}[cap]
                speed_mult = 1 + (speed - 2666) / 2666 * 0.25
            else:
                speed = int(self.rng.choice(DDR5_SPEEDS))
                cap = int(self.rng.choice([8, 16, 32, 64], p=[0.15, 0.40, 0.35, 0.10]))
                base = {8: 0.55, 16: 0.95, 32: 2.0, 64: 5.0}[cap]
                speed_mult = 1 + (speed - 4800) / 4800 * 0.40

            kit_count = int(self.rng.choice([1, 2], p=[0.40, 0.60]))
            has_rgb = int(self.rng.random() < 0.35)
            has_heatsink = int(self.rng.random() < 0.60)
            cas_latency = int(self.rng.choice([16, 18, 22, 30, 32, 36, 40]))

            price = base * speed_mult * BRAND_MULT[brand] * kit_count
            price += has_rgb * 0.15 + has_heatsink * 0.05
            price_vnd = int(round(price * self.rng.normal(1.0, 0.06) * 1_000_000, -3))
            price_vnd = max(price_vnd, 200_000)

            rows.append({
                "brand": brand, "type": ddr_type, "speed_mhz": speed,
                "capacity_gb": cap, "kit_count": kit_count,
                "cas_latency": cas_latency, "has_rgb": has_rgb,
                "has_heatsink": has_heatsink, "price": price_vnd,
            })
        return pd.DataFrame(rows)

    # ── GPU (Desktop) ──────────────────────────────────────────────────
    def _gen_gpu(self, n: int) -> pd.DataFrame:
        CHIPSETS = {
            # chipset: (vram, mem_type, base_price_M)
            "GTX 1650":       (4,  "GDDR6",  3.5),
            "RTX 3060":       (12, "GDDR6",  7.0),
            "RTX 3060 Ti":    (8,  "GDDR6X", 8.5),
            "RTX 4060":       (8,  "GDDR6",  8.5),
            "RTX 4060 Ti":    (8,  "GDDR6",  11.0),
            "RTX 4070":       (12, "GDDR6X", 15.5),
            "RTX 4070 Ti S":  (16, "GDDR6X", 22.0),
            "RTX 4080 Super": (16, "GDDR6X", 30.0),
            "RTX 4090":       (24, "GDDR6X", 45.0),
            "RX 6600":        (8,  "GDDR6",  4.5),
            "RX 7600":        (8,  "GDDR6",  7.0),
            "RX 7700 XT":     (12, "GDDR6",  11.0),
            "RX 7800 XT":     (16, "GDDR6",  14.0),
            "RX 7900 XT":     (20, "GDDR6",  22.0),
            "RX 7900 XTX":    (24, "GDDR6",  27.0),
        }
        MANUFACTURERS = ["Asus", "MSI", "Gigabyte", "EVGA", "Zotac", "Sapphire", "PowerColor", "XFX"]
        MFR_MULT = {"Asus": 1.12, "MSI": 1.08, "Gigabyte": 1.05, "EVGA": 1.03,
                    "Zotac": 0.97, "Sapphire": 1.05, "PowerColor": 0.95, "XFX": 0.97}
        chipset_names = list(CHIPSETS.keys())

        rows = []
        for _ in range(n):
            chipset = self.rng.choice(chipset_names)
            vram, mem_type, base = CHIPSETS[chipset]
            gpu_brand = "NVIDIA" if chipset.startswith(("GTX", "RTX")) else "AMD"

            # Filter manufacturers by brand compatibility
            if gpu_brand == "AMD":
                mfr = self.rng.choice(["Sapphire", "PowerColor", "XFX", "Asus", "MSI", "Gigabyte"])
            else:
                mfr = self.rng.choice(["Asus", "MSI", "Gigabyte", "EVGA", "Zotac"])

            tdp = int(self.rng.integers(75, 450))
            base_clock = round(float(self.rng.uniform(1200, 2600)), 0)
            boost_clock = round(base_clock + float(self.rng.uniform(100, 500)), 0)

            price = base * MFR_MULT.get(mfr, 1.0)
            price_vnd = int(round(price * self.rng.normal(1.0, 0.07) * 1_000_000, -4))
            price_vnd = max(price_vnd, 2_500_000)

            rows.append({
                "gpu_brand": gpu_brand, "chipset": chipset, "vram_gb": vram,
                "memory_type": mem_type, "manufacturer": mfr,
                "base_clock_mhz": int(base_clock), "boost_clock_mhz": int(boost_clock),
                "tdp_watts": tdp, "price": price_vnd,
            })
        return pd.DataFrame(rows)

    # ── Smartphone ─────────────────────────────────────────────────────
    def _gen_smartphone(self, n: int) -> pd.DataFrame:
        BRANDS = ["Samsung", "Apple", "Xiaomi", "OPPO", "Vivo", "Realme", "OnePlus", "Google"]
        BRAND_MULT = {"Samsung": 1.15, "Apple": 1.50, "Xiaomi": 0.85, "OPPO": 0.95,
                      "Vivo": 0.90, "Realme": 0.80, "OnePlus": 1.05, "Google": 1.10}
        PROCESSORS = {
            # tier: base_price_M
            "Snapdragon 8 Gen 3": 8, "Snapdragon 8 Gen 2": 6.5,
            "Snapdragon 8 Gen 1": 5, "Snapdragon 7 Gen 3": 3.5,
            "Snapdragon 6 Gen 1": 2, "Snapdragon 4 Gen 2": 1.2,
            "Dimensity 9300": 7, "Dimensity 8300": 4,
            "Dimensity 7200": 2.5, "Dimensity 6100": 1.5,
            "A17 Pro": 10, "A16 Bionic": 8, "A15 Bionic": 6,
            "Exynos 2400": 6, "Tensor G3": 6,
        }
        proc_list = list(PROCESSORS.keys())

        rows = []
        for _ in range(n):
            brand = self.rng.choice(BRANDS)

            # Processor based on brand
            if brand == "Apple":
                proc = self.rng.choice(["A17 Pro", "A16 Bionic", "A15 Bionic"])
            elif brand == "Samsung":
                proc = self.rng.choice(["Snapdragon 8 Gen 3", "Snapdragon 8 Gen 2",
                                        "Exynos 2400", "Snapdragon 7 Gen 3", "Snapdragon 6 Gen 1"])
            elif brand == "Google":
                proc = "Tensor G3"
            else:
                proc = self.rng.choice(proc_list)

            ram_gb = int(self.rng.choice([4, 6, 8, 12, 16], p=[0.10, 0.15, 0.35, 0.30, 0.10]))
            storage_gb = int(self.rng.choice([64, 128, 256, 512, 1024], p=[0.08, 0.30, 0.35, 0.20, 0.07]))
            screen_size = round(float(self.rng.choice([6.1, 6.4, 6.5, 6.7, 6.8, 7.6])), 1)
            screen_type = self.rng.choice(["IPS", "AMOLED", "LTPO AMOLED"],
                                          p=[0.25, 0.40, 0.35])
            battery_mah = int(self.rng.choice([3500, 4000, 4500, 5000, 5500]))
            camera_mp = int(self.rng.choice([12, 48, 50, 64, 108, 200], p=[0.10, 0.20, 0.30, 0.15, 0.15, 0.10]))
            is_5g = int(self.rng.random() < 0.70)
            is_foldable = int(screen_size >= 7.5)

            base = (PROCESSORS.get(proc, 3) + ram_gb * 0.15 + storage_gb / 128 * 0.8
                    + (1.5 if screen_type == "LTPO AMOLED" else 0.5 if screen_type == "AMOLED" else 0)
                    + camera_mp / 50 * 0.8 + is_5g * 0.8 + is_foldable * 8)
            price = base * BRAND_MULT.get(brand, 1.0)
            price_vnd = int(round(price * self.rng.normal(1.0, 0.08) * 1_000_000, -4))
            price_vnd = max(price_vnd, 2_000_000)

            rows.append({
                "brand": brand, "processor_tier": proc, "ram_gb": ram_gb,
                "storage_gb": storage_gb, "screen_size": screen_size,
                "screen_type": screen_type, "battery_mah": battery_mah,
                "camera_mp": camera_mp, "is_5g": is_5g, "is_foldable": is_foldable,
                "price": price_vnd,
            })
        return pd.DataFrame(rows)

    # ── SSD ─────────────────────────────────────────────────────────────
    def _gen_ssd(self, n: int) -> pd.DataFrame:
        BRANDS = ["Samsung", "WD", "Crucial", "Kingston", "Seagate", "Lexar", "ADATA"]
        BRAND_MULT = {"Samsung": 1.20, "WD": 1.05, "Crucial": 1.0,
                      "Kingston": 1.0, "Seagate": 0.95, "Lexar": 0.90, "ADATA": 0.92}
        INTERFACES = {
            "SATA":      1.0,
            "PCIe 3.0":  1.35,
            "PCIe 4.0":  1.70,
            "PCIe 5.0":  2.50,
        }

        rows = []
        for _ in range(n):
            brand = self.rng.choice(BRANDS)
            ssd_type = self.rng.choice(["2.5-inch", "M.2"], p=[0.20, 0.80])
            if ssd_type == "2.5-inch":
                interface = "SATA"
            else:
                interface = self.rng.choice(["SATA", "PCIe 3.0", "PCIe 4.0", "PCIe 5.0"],
                                            p=[0.05, 0.20, 0.55, 0.20])
            capacity_gb = int(self.rng.choice([256, 512, 1024, 2048, 4096],
                                              p=[0.12, 0.30, 0.35, 0.18, 0.05]))
            has_dram = int(self.rng.random() < 0.45)

            read_speed = int({
                "SATA": 550, "PCIe 3.0": 3500, "PCIe 4.0": 7000, "PCIe 5.0": 12000,
            }[interface] * self.rng.uniform(0.85, 1.0))
            write_speed = int(read_speed * self.rng.uniform(0.70, 0.95))

            base = {256: 0.35, 512: 0.65, 1024: 1.2, 2048: 2.5, 4096: 5.5}[capacity_gb]
            price = base * INTERFACES[interface] * BRAND_MULT[brand]
            price += has_dram * 0.1
            price_vnd = int(round(price * self.rng.normal(1.0, 0.06) * 1_000_000, -3))
            price_vnd = max(price_vnd, 150_000)

            rows.append({
                "brand": brand, "type": ssd_type, "capacity_gb": capacity_gb,
                "interface": interface, "read_speed_mbps": read_speed,
                "write_speed_mbps": write_speed, "has_dram": has_dram,
                "price": price_vnd,
            })
        return pd.DataFrame(rows)


# ════════════════════════════════════════════════════════════════════════
# PHẦN 2: FEATURE DEFINITIONS
# ════════════════════════════════════════════════════════════════════════

CATEGORY_SCHEMA: dict[str, dict] = {
    "laptop": {
        "categorical": ["brand", "cpu_brand", "cpu_tier", "gpu_tier", "screen_resolution"],
        "numerical": ["ram_gb", "storage_gb", "screen_size", "weight_kg", "is_touchscreen"],
    },
    "cpu": {
        "categorical": ["brand", "family", "socket"],
        "numerical": ["cores", "threads", "base_clock_ghz", "boost_clock_ghz",
                       "tdp_watts", "cache_mb", "has_igpu"],
    },
    "ram": {
        "categorical": ["brand", "type"],
        "numerical": ["speed_mhz", "capacity_gb", "kit_count", "cas_latency",
                       "has_rgb", "has_heatsink"],
    },
    "gpu": {
        "categorical": ["gpu_brand", "chipset", "memory_type", "manufacturer"],
        "numerical": ["vram_gb", "base_clock_mhz", "boost_clock_mhz", "tdp_watts"],
    },
    "smartphone": {
        "categorical": ["brand", "processor_tier", "screen_type"],
        "numerical": ["ram_gb", "storage_gb", "screen_size", "battery_mah",
                       "camera_mp", "is_5g", "is_foldable"],
    },
    "ssd": {
        "categorical": ["brand", "type", "interface"],
        "numerical": ["capacity_gb", "read_speed_mbps", "write_speed_mbps", "has_dram"],
    },
}


# ════════════════════════════════════════════════════════════════════════
# PHẦN 3: MODEL TRAINING
# ════════════════════════════════════════════════════════════════════════


def _mape(y_true, y_pred):
    mask = y_true != 0
    return float(np.mean(np.abs((y_true[mask] - y_pred[mask]) / y_true[mask])) * 100)


class PriceModelTrainer:
    """Train và evaluate ensemble price prediction models."""

    XGB_WEIGHT = 0.60
    LGBM_WEIGHT = 0.40

    def __init__(self):
        self.models: dict[str, dict] = {}
        self.metrics: dict[str, dict] = {}

    def train_category(self, df: pd.DataFrame, category: str):
        schema = CATEGORY_SCHEMA[category]
        cat_cols = schema["categorical"]
        num_cols = schema["numerical"]
        feature_cols = cat_cols + num_cols

        # Encode categorical
        encoders: dict[str, LabelEncoder] = {}
        df_enc = df.copy()
        for col in cat_cols:
            le = LabelEncoder()
            df_enc[col] = le.fit_transform(df_enc[col].astype(str))
            encoders[col] = le

        X = df_enc[feature_cols].values.astype(np.float64)
        y = df_enc["price"].values.astype(np.float64)

        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)

        X_train, X_test, y_train, y_test = train_test_split(
            X_scaled, y, test_size=0.20, random_state=42
        )

        # ── XGBoost ──
        xgb = XGBRegressor(
            n_estimators=400, max_depth=8, learning_rate=0.05,
            subsample=0.85, colsample_bytree=0.85,
            reg_alpha=0.1, reg_lambda=1.0,
            random_state=42, verbosity=0, n_jobs=-1,
        )
        xgb.fit(X_train, y_train)

        # ── LightGBM ──
        lgbm = LGBMRegressor(
            n_estimators=400, max_depth=8, learning_rate=0.05,
            subsample=0.85, colsample_bytree=0.85,
            reg_alpha=0.1, reg_lambda=1.0,
            random_state=42, verbose=-1, n_jobs=-1,
        )
        lgbm.fit(X_train, y_train)

        # ── Ensemble ──
        y_xgb = xgb.predict(X_test)
        y_lgbm = lgbm.predict(X_test)
        y_pred = self.XGB_WEIGHT * y_xgb + self.LGBM_WEIGHT * y_lgbm

        # Metrics
        r2 = r2_score(y_test, y_pred)
        mae = mean_absolute_error(y_test, y_pred)
        rmse = np.sqrt(mean_squared_error(y_test, y_pred))
        mape = _mape(y_test, y_pred)

        # Feature importance (average of both models)
        xgb_imp = xgb.feature_importances_
        lgbm_imp = lgbm.feature_importances_
        # Normalize
        xgb_imp = xgb_imp / xgb_imp.sum()
        lgbm_imp = lgbm_imp / lgbm_imp.sum()
        avg_imp = self.XGB_WEIGHT * xgb_imp + self.LGBM_WEIGHT * lgbm_imp
        importances = {col: round(float(imp), 4) for col, imp in zip(feature_cols, avg_imp)}
        importances = dict(sorted(importances.items(), key=lambda x: -x[1]))

        self.models[category] = {
            "xgb_model": xgb,
            "lgbm_model": lgbm,
            "encoders": encoders,
            "scaler": scaler,
            "feature_cols": feature_cols,
            "categorical_cols": cat_cols,
            "numerical_cols": num_cols,
            "importances": importances,
        }
        self.metrics[category] = {
            "r2": round(r2, 4),
            "mae": int(mae),
            "rmse": int(rmse),
            "mape": round(mape, 2),
            "train_size": len(X_train),
            "test_size": len(X_test),
        }
        return self.metrics[category]

    def save_all(self, save_dir: str = "models"):
        os.makedirs(save_dir, exist_ok=True)

        for category, bundle in self.models.items():
            path = os.path.join(save_dir, f"price_{category}.joblib")
            joblib.dump(bundle, path)

        registry = {
            "categories": list(self.models.keys()),
            "metrics": self.metrics,
            "weights": {"xgb": self.XGB_WEIGHT, "lgbm": self.LGBM_WEIGHT},
        }
        with open(os.path.join(save_dir, "price_model_registry.json"), "w", encoding="utf-8") as f:
            json.dump(registry, f, indent=2, ensure_ascii=False)


# ════════════════════════════════════════════════════════════════════════
# PHẦN 4: KAGGLE DATA LOADER (Optional)
# ════════════════════════════════════════════════════════════════════════


def load_kaggle_laptop_csv(path: str) -> pd.DataFrame:
    """
    Load laptop CSV from Kaggle (e.g. 'ironmanrk/laptop-price-prediction').
    Expects columns: Company, TypeName, Ram, Weight, ScreenResolution,
                     Cpu, Gpu, Memory, OpSys, Price (EUR or VND).
    Maps to our schema automatically.
    """
    df = pd.read_csv(path)

    def _parse_cpu_tier(cpu_str: str) -> str:
        cpu_str = str(cpu_str).lower()
        for tier in ["i9", "i7", "i5", "i3", "ryzen 9", "ryzen 7", "ryzen 5", "ryzen 3",
                      "m3 max", "m3 pro", "m3", "m2", "m1"]:
            if tier in cpu_str:
                return tier.title() if "ryzen" in tier or tier.startswith("m") else tier
        return "i5"

    def _parse_gpu_tier(gpu_str: str) -> str:
        gpu_str = str(gpu_str).upper()
        for tier in ["RTX 4090", "RTX 4080", "RTX 4070", "RTX 4060", "RTX 4050",
                      "RTX 3050", "GTX 1650", "RX 7700S", "RX 7600M", "RX 6500M"]:
            if tier in gpu_str:
                return tier
        if "INTEL" in gpu_str or "IRIS" in gpu_str or "UHD" in gpu_str:
            return "Integrated"
        return "Integrated"

    def _parse_ram(ram_val) -> int:
        try:
            return int(str(ram_val).replace("GB", "").strip())
        except ValueError:
            return 8

    def _parse_storage(mem_str: str) -> int:
        mem_str = str(mem_str).upper()
        if "2TB" in mem_str or "2048" in mem_str:
            return 2048
        if "1TB" in mem_str or "1024" in mem_str:
            return 1024
        if "512" in mem_str:
            return 512
        if "256" in mem_str:
            return 256
        return 512

    def _parse_resolution(res_str: str) -> str:
        res_str = str(res_str)
        if "3840" in res_str or "4K" in res_str.upper():
            return "4K"
        if "2560" in res_str or "QHD" in res_str.upper():
            return "QHD"
        if "1920" in res_str or "FHD" in res_str.upper() or "Full HD" in res_str:
            return "FHD"
        return "HD"

    result = pd.DataFrame({
        "brand": df.get("Company", df.get("brand", "Unknown")),
        "cpu_brand": df.get("Cpu", "").apply(
            lambda x: "Apple" if "apple" in str(x).lower() or "m1" in str(x).lower()
            else "AMD" if "amd" in str(x).lower() or "ryzen" in str(x).lower()
            else "Intel"
        ) if "Cpu" in df.columns else "Intel",
        "cpu_tier": df.get("Cpu", df.get("cpu", "i5")).apply(_parse_cpu_tier),
        "gpu_tier": df.get("Gpu", df.get("gpu", "Integrated")).apply(_parse_gpu_tier),
        "ram_gb": df.get("Ram", df.get("ram_gb", 8)).apply(_parse_ram),
        "storage_gb": df.get("Memory", df.get("storage_gb", 512)).apply(_parse_storage),
        "screen_size": df.get("Inches", df.get("screen_size", 15.6)).astype(float),
        "screen_resolution": df.get("ScreenResolution", "FHD").apply(_parse_resolution),
        "weight_kg": df.get("Weight", df.get("weight_kg", 2.0)).apply(
            lambda x: float(str(x).replace("kg", "").strip()) if pd.notna(x) else 2.0
        ),
        "is_touchscreen": df.get("ScreenResolution", "").apply(
            lambda x: 1 if "touch" in str(x).lower() else 0
        ) if "ScreenResolution" in df.columns else 0,
    })

    # Price: convert EUR to VND if needed (1 EUR ≈ 27,000 VND)
    price_col = "Price" if "Price" in df.columns else "Price_euros" if "Price_euros" in df.columns else "price"
    prices = df[price_col].astype(float)
    if prices.median() < 100_000:  # Likely EUR
        prices = (prices * 27_000).astype(int)
    result["price"] = prices.apply(lambda x: int(round(x, -4)))

    return result


# ════════════════════════════════════════════════════════════════════════
# PHẦN 5: MAIN
# ════════════════════════════════════════════════════════════════════════


def main():
    parser = argparse.ArgumentParser(description="Train tech price prediction models")
    parser.add_argument("--samples", type=int, default=3000, help="Synthetic samples per category")
    parser.add_argument("--kaggle-laptop", type=str, default=None, help="Path to Kaggle laptop CSV")
    parser.add_argument("--save-dir", type=str, default="models", help="Directory to save models")
    args = parser.parse_args()

    t0 = time.time()

    print("═" * 66)
    print("  TECH PRODUCT PRICE PREDICTION — Training Pipeline v2.0")
    print("═" * 66)

    # ── 1. Generate / Load Data ──
    print(f"\n📦 Generating synthetic data ({args.samples:,} samples × 6 categories)...")
    generator = TechPriceDataGenerator()
    data = generator.generate_all(args.samples)

    # Optional: merge Kaggle data for laptops
    if args.kaggle_laptop and os.path.exists(args.kaggle_laptop):
        print(f"📂 Loading Kaggle laptop data: {args.kaggle_laptop}")
        kaggle_df = load_kaggle_laptop_csv(args.kaggle_laptop)
        data["laptop"] = pd.concat([data["laptop"], kaggle_df], ignore_index=True)
        print(f"   Merged: {len(kaggle_df)} Kaggle rows → {len(data['laptop'])} total laptop samples")

    for cat, df in data.items():
        mn, mx = df["price"].min(), df["price"].max()
        print(f"  ✅ {cat:<13}: {len(df):>5,} samples | "
              f"Price range: {mn/1e6:,.1f}M ~ {mx/1e6:,.1f}M ₫")

    # Save synthetic CSVs
    csv_dir = os.path.join(args.save_dir, "training_data")
    os.makedirs(csv_dir, exist_ok=True)
    for cat, df in data.items():
        df.to_csv(os.path.join(csv_dir, f"{cat}_data.csv"), index=False)

    # ── 2. Train Models ──
    print("\n🚀 Training models...\n")
    trainer = PriceModelTrainer()

    for cat, df in data.items():
        metrics = trainer.train_category(df, cat)
        m = metrics

        # Pretty print per-model details
        bundle = trainer.models[cat]
        X_test_size = m["test_size"]

        print(f"  ── {cat} {'─' * (50 - len(cat))}")

        # Individual model scores on test
        xgb_model = bundle["xgb_model"]
        lgbm_model = bundle["lgbm_model"]

        top_feats = list(bundle["importances"].items())[:4]
        feat_str = ", ".join(f"{k} ({v*100:.0f}%)" for k, v in top_feats)

        print(f"  Ensemble:  R²={m['r2']:.3f}  MAE={m['mae']:>12,}₫  "
              f"RMSE={m['rmse']:>12,}₫  MAPE={m['mape']:.1f}%")
        print(f"  Top features: {feat_str}")
        print()

    # ── 3. Save Models ──
    trainer.save_all(args.save_dir)

    elapsed = time.time() - t0
    print("═" * 66)
    print(f"  ✅ All models saved to: {args.save_dir}/")
    print(f"  ⏱  Total training time: {elapsed:.1f}s")
    print("═" * 66)


if __name__ == "__main__":
    main()
