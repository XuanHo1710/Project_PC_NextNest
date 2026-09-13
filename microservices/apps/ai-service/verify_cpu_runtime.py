"""Offline image smoke check; never loads application modules or model weights."""

from importlib.metadata import distributions


def main():
    installed = {
        distribution.metadata["Name"].lower().replace("_", "-")
        for distribution in distributions()
    }
    gpu_packages = sorted(
        name for name in installed
        if name.startswith(("nvidia-", "cuda-", "triton"))
    )
    if gpu_packages:
        raise RuntimeError(f"GPU packages found in CPU image: {gpu_packages}")
    if "xgboost-cpu" not in installed or "xgboost" in installed:
        raise RuntimeError("Install xgboost-cpu instead of the full xgboost distribution")

    import torch
    from sentence_transformers import SentenceTransformer
    from xgboost import XGBRegressor
    from lightgbm import LGBMRegressor
    import pandas
    import sklearn

    if torch.version.cuda is not None:
        raise RuntimeError("Expected a CPU-only PyTorch build")
    if (torch.tensor([1.0, 2.0]) * 2).tolist() != [2.0, 4.0]:
        raise RuntimeError("CPU tensor smoke check failed")
    print(
        f"CPU runtime OK: torch={torch.__version__}, "
        f"pandas={pandas.__version__}, sklearn={sklearn.__version__}; "
        f"{SentenceTransformer.__name__}, {XGBRegressor.__name__}, "
        f"{LGBMRegressor.__name__} imports passed"
    )


if __name__ == "__main__":
    main()
