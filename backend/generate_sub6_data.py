import pandas as pd
import numpy as np

def generate_sub6_titan_data(num_samples=5000):
    print(f"🚀 Generating {num_samples} rows of Sub-6GHz Antenna Data...")
    
    # 1. Randomly sample Frequencies (1.0 to 8.0 GHz)
    freq = np.random.uniform(1.0, 8.0, num_samples)
    
    # 2. Physics-Based Dimensions (Approximate for FR4 substrate, Er=4.4)
    # Patch Length (L) is roughly 0.49 * c / (f * sqrt(Er))
    # At 2.4GHz, this is ~30mm. At 5.8GHz, this is ~12mm.
    c = 300 # Speed of light in mm*GHz
    er = 4.4
    
    # Calculate base dimensions with random variance for "tuning" slots
    patch_l = (0.48 * c / (freq * np.sqrt(er))) * np.random.uniform(0.95, 1.05, num_samples)
    patch_w = patch_l * np.random.uniform(1.1, 1.5, num_samples)
    
    feed_w = np.random.uniform(2.5, 3.5, num_samples) # Standard 50-ohm line width
    slot1_w = patch_w * np.random.uniform(0.1, 0.3, num_samples)
    slot1_l = patch_l * np.random.uniform(0.2, 0.4, num_samples)
    slot2_w = slot1_w * np.random.uniform(0.8, 1.2, num_samples)
    
    # 3. Predict Performance (Synthetic Mapping)
    # Lower frequencies generally have slightly better Gain/Efficiency
    gain = np.random.uniform(4.5, 7.5, num_samples) - (freq * 0.1)
    directivity = gain + np.random.uniform(0.5, 1.5, num_samples)
    s11 = np.random.uniform(-35.0, -12.0, num_samples)
    rad_eff = np.random.uniform(0.80, 0.96, num_samples)
    total_eff = rad_eff * np.random.uniform(0.85, 0.95, num_samples)
    vswr = np.random.uniform(1.05, 1.8, num_samples)

    data = {
        'Freq_GHz': freq,
        'Patch_W': patch_w, 'Patch_L': patch_l, 'Feed_W': feed_w,
        'Slot1_W': slot1_w, 'Slot1_L': slot1_l, 'Slot2_W': slot2_w,
        'Gain': gain, 'Directivity': directivity, 'S11(dB)': s11,
        'Rad_eff': rad_eff, 'Total_eff': total_eff, 'VSWR': vswr
    }

    df = pd.DataFrame(data)
    df.to_csv(r'D:\DD\TITAN_READY_DATA.csv', index=False)
    print("✅ New Sub-6GHz Dataset saved to D:\\DD\\TITAN_READY_DATA.csv")

generate_sub6_titan_data(5000)