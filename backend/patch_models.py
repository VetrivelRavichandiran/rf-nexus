import h5py
import json

def patch_model(file_path):
    print(f"🛠️ Patching {file_path}...")
    try:
        with h5py.File(file_path, 'r+') as f:
            # Load the model configuration from the H5 attributes
            model_config = f.attrs.get('model_config')
            if model_config is None:
                print("❌ No model_config found in this file.")
                return

            # Convert bytes to string if necessary and parse JSON
            config_str = model_config.decode('utf-8') if isinstance(model_config, bytes) else model_config
            config_dict = json.loads(config_str)

            # Search and replace 'batch_shape' with 'batch_input_shape'
            config_json = json.dumps(config_dict)
            if '"batch_shape"' in config_json:
                fixed_json = config_json.replace('"batch_shape"', '"batch_input_shape"')
                # Save it back
                f.attrs['model_config'] = fixed_json.encode('utf-8')
                print(f"✅ Success! 'batch_shape' replaced with 'batch_input_shape'.")
            else:
                print("ℹ️ 'batch_shape' not found. File might already be compatible or uses a different structure.")
    except Exception as e:
        print(f"❌ Failed to patch: {e}")

# Patch both models
patch_model("trained_models/forward_model.h5")
patch_model("trained_models/reverse_model.h5")