import numpy as np

def generate_s11_curve(center_freq=2.4):
    """Generates dynamic S11 curve data points around the target frequency."""
    data = []
    freqs = np.arange(1.0, 5.05, 0.05)
    for f in freqs:
        dist = abs(f - center_freq)
        s11 = -28 * np.exp(-(dist / 0.2)**2) - 2 if dist < 0.5 else -2 - 2 * np.sin(f * 3) * np.exp(-dist * 0.5)
        data.append({
            "freq": round(float(f), 2),
            "s11": round(float(s11), 2),
            "s11_opt": round(float(s11 - 1.5), 2)
        })
    return data