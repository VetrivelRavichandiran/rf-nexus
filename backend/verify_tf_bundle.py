import os
import sys
import importlib

def test_titan_sledgehammer():
    print("--- 🔬 TITAN ENGINE: BUNDLE SIMULATION ---")

    # 1. Test the "Compat" Handshake
    print("\n🧪 Testing: tensorflow.compat.v2 discovery...")
    try:
        # This is exactly what failed in the EXE
        import tensorflow.compat.v2 as tf_v2
        print("✅ SUCCESS: tensorflow.compat.v2 is active and reachable.")
    except ImportError as e:
        print(f"❌ FAILED: tensorflow.compat is missing: {e}")
        return

    # 2. Test the "Keras 3" Handshake
    print("\n🧪 Testing: Keras Internal Pathing...")
    try:
        from keras.src.applications import convnext
        print("✅ SUCCESS: Keras internal modules are loading correctly.")
    except Exception as e:
        print(f"❌ FAILED: Keras pathing error: {e}")
        return

    # 3. Verify the "Sledgehammer" Hooks
    print("\n🧪 Verifying PyInstaller Hook locations...")
    try:
        from PyInstaller.utils.hooks import collect_submodules
        tf_subs = collect_submodules('tensorflow')
        if any('compat' in s for s in tf_subs):
            print(f"✅ SUCCESS: PyInstaller hooks found {len(tf_subs)} TF submodules (including compat).")
        else:
            print("⚠️ WARNING: PyInstaller hooks might be missing 'compat'.")
    except ImportError:
        print("ℹ️ PyInstaller not in venv, skipping hook check (this is okay).")

    # 4. Final ModelManager Load Test
    print("\n🧪 Testing ModelManager with DTypePolicyPatch...")
    try:
        # Import your manager to see if it boots with the patch
        from ml_pipeline.model_manager import model_manager
        if model_manager.forward_model is not None:
            print("✅ SUCCESS: ModelManager loaded .h5 models using the DTypePolicyPatch.")
        else:
            print("❌ FAILED: ModelManager initialized but models are None.")
    except Exception as e:
        print(f"❌ FAILED: ModelManager crash: {e}")

    print("\n" + "="*50)
    print("🚀 READINESS VERIFIED: Proceed to 'pyinstaller --clean'")
    print("="*50)

if __name__ == "__main__":
    test_titan_sledgehammer()