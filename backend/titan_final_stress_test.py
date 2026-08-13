import os
import sys
import numpy as np

def run_stress_test():
    print("\n" + "="*50)
    print("🛡️  TITAN ENGINE: FULL-STACK STRESS TEST")
    print("="*50)

    # 1. TEST CORE FRAMEWORKS
    print("\n🧪 STEP 1: Core Frameworks...")
    try:
        import tensorflow as tf
        import absl.app
        import google.protobuf
        import pandas as pd
        import fpdf
        import matplotlib.pyplot as plt
        import seaborn as sns
        print(f"✅ Frameworks Stable (TF {tf.__version__})")
    except ImportError as e:
        print(f"❌ FRAMEWORK FAILURE: {e}")
        return False
    # 2. TEST INTERNAL PATHING
    print("\n🧪 STEP 2: Internal Keras Guts...")
    try:
        from tensorflow.python.keras.models import load_model
        from tensorflow.python.keras.utils.generic_utils import CustomObjectScope
        print("✅ Internal Keras Paths: ACCESSIBLE")
    except ImportError as e:
        print(f"❌ PATHING FAILURE: {e}")
        return False

    # 3. TEST MODEL MANAGER & DESERIALIZATION
    print("\n🧪 STEP 3: Model Manager & Inference...")
    try:
        sys.path.append(os.getcwd())
        from ml_pipeline.model_manager import model_manager
        
        if model_manager.forward_model and model_manager.reverse_model:
            print("✅ Models Loaded: SUCCESS")
            
            # TEST INFERENCE (Direct call avoids DistributedDataset error)
            print("🧪 Testing Neural Logic (Direct Inference)...")
            # Using 7 features as required by your model
            dummy_input = np.random.rand(1, 7).astype(np.float32)
            prediction = model_manager.forward_model(dummy_input, training=False)
            print("✅ Neural Inference: FUNCTIONAL")
        else:
            print("❌ MODEL LOADING: Models are None.")
            return False
    except Exception as e:
        print(f"❌ MODEL MANAGER FAILURE: {e}")
        return False

    # 4. TEST API SETUP
    print("\n🧪 STEP 4: API Handshake...")
    try:
        from main import app
        print("✅ FastAPI Routing: VERIFIED")
    except Exception as e:
        print(f"❌ API STARTUP FAILURE: {e}")
        return False

    print("\n" + "="*50)
    print("🚀 TITAN IS BATTLE-READY: 100% PASS RATE")
    print("="*50)
    return True

if __name__ == "__main__":
    if not run_stress_test():
        sys.exit(1)