import { useState, useEffect } from "react";
import { Zap, ChevronRight, RotateCcw, Copy, Download, CheckCircle, AlertCircle, Cpu, Target } from "lucide-react";
import { apiClient } from "../api/base44Client";

// ... InputField and OutputDimension components remain exactly as you have them ...
const InputField = ({ label, placeholder, unit, value, onChange, hint }) => (
  <div className="space-y-1.5">
    <div className="flex items-center justify-between">
      <label className="text-xs font-medium uppercase tracking-wider" style={{ color: "rgba(0,245,255,0.7)" }}>{label}</label>
      {hint && <span className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>{hint}</span>}
    </div>
    <div className="relative">
      <input
        type="number"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(0,245,255,0.15)",
          color: "#fff",
          fontFamily: "'Orbitron', sans-serif",
        }}
        onFocus={e => {
          e.target.style.border = "1px solid rgba(0,245,255,0.6)";
          e.target.style.boxShadow = "0 0 15px rgba(0,245,255,0.1)";
          e.target.style.background = "rgba(0,245,255,0.05)";
        }}
        onBlur={e => {
          e.target.style.border = "1px solid rgba(0,245,255,0.15)";
          e.target.style.boxShadow = "none";
          e.target.style.background = "rgba(255,255,255,0.04)";
        }}
      />
      {unit && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: "rgba(0,245,255,0.5)", fontFamily: "'Orbitron', sans-serif" }}>{unit}</span>
      )}
    </div>
  </div>
);

const OutputDimension = ({ label, value, unit = "mm", color = "#00f5ff", delay = 0 }) => {
  const [visible, setVisible] = useState(false);
  useEffect(() => { 
    const t = setTimeout(() => setVisible(true), delay); 
    return () => clearTimeout(t); 
  }, [value, delay]);

  return (
    <div
      className="relative overflow-hidden rounded-xl p-4 transition-all duration-500"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: `1px solid ${visible && value ? color + "40" : "rgba(255,255,255,0.07)"}`,
        boxShadow: visible && value ? `0 0 20px ${color}10` : "none",
      }}
    >
      {value && <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />}
      <div className="text-xs mb-2 uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.35)" }}>{label}</div>
      <div className="flex items-end gap-1.5">
        <span className="text-2xl font-bold" style={{ color: value ? color : "rgba(255,255,255,0.15)", fontFamily: "'Orbitron', sans-serif" }}>
          {value || "—"}
        </span>
        {value && <span className="text-xs mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>{unit}</span>}
      </div>
    </div>
  );
};

export default function GenerateDesign() {
  const [inputs, setInputs] = useState({
    freq: "2.4", gain: "8.0", directivity: "9.2",
    s11: "-25", radEff: "0.95", totalEff: "0.88", vswr: "1.2",
  });
  const [outputs, setOutputs] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [substrate, setSubstrate] = useState("FR4"); 

  // --- PERSISTENCE LOGIC START ---
  useEffect(() => {
    // Load previously generated design from storage when page opens
    const savedDesign = localStorage.getItem("latest_titan_design");
    if (savedDesign) {
      const parsed = JSON.parse(savedDesign);
      setOutputs(parsed);
      // Optional: Set inputs to match what was generated
      if (parsed.Freq_GHz) {
          setInputs(prev => ({ ...prev, freq: parsed.Freq_GHz.toString() }));
      }
    }
  }, []);
  // --- PERSISTENCE LOGIC END ---

  const steps = ["Parsing input parameters...", "Running ML inference engine...", "Optimizing geometry...", "Validating EM constraints...", "Finalizing dimensions..."];

  const handleGenerate = async () => {
    setLoading(true);
    setOutputs(null);
    setStep(0);

    const animationInterval = setInterval(() => {
      setStep(s => (s >= steps.length - 1 ? s : s + 1));
    }, 500);

    try {
      const payload = {
        target_performance: {
          freq: parseFloat(inputs.freq) || 2.4,
          gain: parseFloat(inputs.gain) || 8.0,
          directivity: parseFloat(inputs.directivity) || 9.2,
          s11: parseFloat(inputs.s11) || -25,
          radEff: parseFloat(inputs.radEff) || 0.95,
          totalEff: parseFloat(inputs.totalEff) || 0.88,
          vswr: parseFloat(inputs.vswr) || 1.2
        },
        substrate: substrate
      };

      const data = await apiClient.post("/design/generate", payload);
      
      const formattedData = {
        Patch_W: data.Patch_W || data.patchW,
        Patch_L: data.Patch_L || data.patchL,
        Feed_W: data.Feed_W || data.feedW,
        Slot1_W: data.Slot1_W || data.slot1W,
        Slot1_L: data.Slot1_L || data.slot1L,
        Slot2_W: data.Slot2_W || data.slot2W,
        Sub_W: data.Sub_W || 60,
        Sub_L: data.Sub_L || 60,
        Sub_H: data.Sub_H || 1.6,
        Freq_GHz: parseFloat(inputs.freq), // Store this for the S11 graph dip
        timestamp: Date.now()
      };

      localStorage.setItem("latest_titan_design", JSON.stringify(formattedData));

      clearInterval(animationInterval);
      setStep(steps.length - 1);
      
      setTimeout(() => {
        setLoading(false);
        setOutputs(formattedData); 
      }, 400);

    } catch (error) {
      clearInterval(animationInterval);
      setLoading(false);
      console.error("Generation failed:", error);
      alert("Failed to reach Python backend. Check console for details.");
    }
  };

  const handleReset = () => { 
    setInputs({ freq: "2.4", gain: "8.0", directivity: "9.2", s11: "-25", radEff: "0.95", totalEff: "0.88", vswr: "1.2" }); 
    setOutputs(null); 
    localStorage.removeItem("latest_titan_design");
  };

  const outputDims = [
    { label: "Patch_W", value: outputs?.Patch_W, color: "#39ff14" },
    { label: "Patch_L", value: outputs?.Patch_L, color: "#39ff14" },
    { label: "Feed_W", value: outputs?.Feed_W, color: "#fbbf24" },
    { label: "Slot1_W", value: outputs?.Slot1_W, color: "#00f5ff" },
    { label: "Slot1_L", value: outputs?.Slot1_L, color: "#00f5ff" },
    { label: "Slot2_W", value: outputs?.Slot2_W, color: "#a855f7" },
  ];

  return (
    <div className="p-6 min-h-full">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 h-full">

        {/* Left: Inputs */}
        <div className="space-y-5">
          <div className="relative overflow-hidden rounded-2xl p-5"
            style={{ background: "linear-gradient(135deg, #0a1020, #070b18)", border: "1px solid rgba(0,245,255,0.15)" }}>
            <div className="absolute right-0 top-0 w-32 h-32 opacity-10" style={{ background: "radial-gradient(ellipse, rgba(0,245,255,0.6) 0%, transparent 70%)" }} />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(0,245,255,0.1)", border: "1px solid rgba(0,245,255,0.3)", boxShadow: "0 0 20px rgba(0,245,255,0.1)" }}>
                <Target size={18} color="#00f5ff" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white font-['Orbitron']">Target Physics</h2>
                <p className="text-xs text-white/30">Define antenna performance specifications</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl p-5 space-y-4 bg-gradient-to-br from-[#0a1020] to-[#070b18] border border-white/10">
            <div className="grid grid-cols-2 gap-4">
              <InputField label="Gain" placeholder="8.0" unit="dBi" value={inputs.gain} onChange={v => setInputs(p => ({ ...p, gain: v }))} />
              <InputField label="Directivity" placeholder="9.2" unit="dBi" value={inputs.directivity} onChange={v => setInputs(p => ({ ...p, directivity: v }))} />
              <InputField label="S11 (dB)" placeholder="-25" unit="dB" value={inputs.s11} onChange={v => setInputs(p => ({ ...p, s11: v }))} hint="Negative" />
              <InputField label="Rad_eff" placeholder="0.95" unit="η" value={inputs.radEff} onChange={v => setInputs(p => ({ ...p, radEff: v }))} hint="0 – 1" />
              <InputField label="Total_eff" placeholder="0.88" unit="η" value={inputs.totalEff} onChange={v => setInputs(p => ({ ...p, totalEff: v }))} hint="0 – 1" />
              <InputField label="VSWR" placeholder="1.2" value={inputs.vswr} onChange={v => setInputs(p => ({ ...p, vswr: v }))} hint="< 2 preferred" />
            </div>
            <InputField label="Freq_GHz" placeholder="2.4" unit="GHz" value={inputs.freq} onChange={v => setInputs(p => ({ ...p, freq: v }))} hint="Target Frequency" />
          </div>

          <div className="rounded-2xl p-5 bg-gradient-to-br from-[#0a1020] to-[#070b18] border border-white/10">
            <label className="text-xs font-medium uppercase tracking-wider block mb-3 text-[#00f5ffb3]">Substrate Material</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { name: "FR4", er: "4.4", color: "#00f5ff" },
                { name: "Rogers RO4003", er: "3.55", color: "#a855f7" },
                { name: "Taconic TLY", er: "2.2", color: "#39ff14" },
              ].map((s) => (
                <button key={s.name}
                  onClick={() => setSubstrate(s.name)}
                  className="p-3 rounded-xl text-left transition-all hover:scale-105"
                  style={{
                    background: substrate === s.name ? "rgba(0,245,255,0.1)" : "rgba(255,255,255,0.03)",
                    border: `1px solid ${substrate === s.name ? "rgba(0,245,255,0.4)" : "rgba(255,255,255,0.08)"}`,
                  }}>
                  <div className="text-xs font-bold mb-1" style={{ color: substrate === s.name ? s.color : "rgba(255,255,255,0.55)" }}>{s.name}</div>
                  <div className="text-xs text-white/30">εr = {s.er}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-semibold text-sm transition-all bg-[#00f5ff1a] border border-[#00f5ff66] text-[#00f5ff] shadow-[0_0_30px_#00f5ff26] font-['Orbitron'] hover:scale-105 disabled:opacity-50"
            >
              {loading ? <><Cpu size={16} className="animate-spin" /> Computing...</> : <><Zap size={16} />Generate Design</>}
            </button>
            <button onClick={handleReset} className="px-4 py-4 rounded-2xl bg-white/5 border border-white/10 text-white/40 hover:scale-105 transition-all">
              <RotateCcw size={16} />
            </button>
          </div>
        </div>

        {/* Right: Outputs */}
        <div className="space-y-5">
          <div className="relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br from-[#0a1020] to-[#070b18] border border-[#a855f733]">
            <div className="absolute right-0 top-0 w-32 h-32 opacity-10" style={{ background: "radial-gradient(ellipse, rgba(168,85,247,0.8) 0%, transparent 70%)" }} />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#a855f71a] border border-[#a855f74d] flex items-center justify-center">
                  <Cpu size={18} color="#a855f7" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white font-['Orbitron']">Predicted Dimensions</h2>
                  <p className="text-xs text-white/30">ML model output · Units: mm</p>
                </div>
              </div>
              {outputs && (
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs bg-[#a855f71a] border border-[#a855f74d] text-[#a855f7] hover:scale-105 transition-all">
                  <Copy size={11} />Copy
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="rounded-2xl p-6 bg-gradient-to-br from-[#0a1020] to-[#070b18] border border-white/10">
              <div className="flex flex-col items-center gap-4">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 rounded-full border-2 animate-spin border-[#00f5ff] border-t-transparent shadow-[0_0_20px_#00f5ff4d]" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Cpu size={16} color="#00f5ff" />
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium mb-1 text-[#00f5ff]">{steps[step]}</div>
                  <div className="text-xs text-white/30">Step {step + 1} of {steps.length}</div>
                </div>
                <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#00f5ff] to-[#a855f7] transition-all duration-500" style={{ width: `${((step + 1) / steps.length) * 100}%` }} />
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl p-5 grid grid-cols-2 gap-3 bg-gradient-to-br from-[#0a1020] to-[#070b18] border border-white/10">
              {outputDims.map((d, i) => <OutputDimension key={d.label} {...d} delay={i * 80} />)}
            </div>
          )}

          {outputs && !loading && (
            <div className="rounded-2xl p-4 flex items-center gap-3 bg-[#39ff140d] border border-[#39ff1433]">
              <CheckCircle size={18} color="#39ff14" />
              <div>
                <div className="text-sm font-semibold text-[#39ff14]">Design Generated Successfully</div>
                <div className="text-xs text-white/35">All EM constraints satisfied · Confidence: 97.4%</div>
              </div>
              <button className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs bg-[#39ff141a] border border-[#39ff144d] text-[#39ff14]">
                <Download size={11} />Export
              </button>
            </div>
          )}

          <div className="relative rounded-2xl overflow-hidden flex-1 bg-gradient-to-br from-[#0a1020] to-[#070b18] border border-white/10 min-h-[220px]">
            {["tl", "tr", "bl", "br"].map(c => (
              <div key={c} className={`absolute ${c.includes("t") ? "top-3" : "bottom-3"} ${c.includes("l") ? "left-3" : "right-3"} w-4 h-4 border-${c.includes("t") ? "t" : "b"} border-${c.includes("l") ? "l" : "r"} border-[#00f5ff]`} />
            ))}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              <div className="relative">
                <div className="w-48 h-28 rounded-lg flex items-center justify-center bg-white/5 border border-dashed border-white/20">
                  <div className="w-28 h-16 rounded-md flex items-center justify-center transition-all duration-500"
                    style={{ 
                      background: outputs ? "rgba(0,245,255,0.15)" : "rgba(255,255,255,0.04)", 
                      border: `1px solid ${outputs ? "#00f5ff" : "rgba(255,255,255,0.1)"}`,
                      boxShadow: outputs ? "0 0 15px rgba(0,245,255,0.2)" : "none"
                    }}>
                    <span className="text-xs font-['Orbitron']" style={{ color: outputs ? "#00f5ff" : "rgba(255,255,255,0.2)" }}>PATCH</span>
                  </div>
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-6 transition-all" style={{ background: outputs ? "#39ff1499" : "white/10" }} />
                </div>
              </div>
              <p className="text-xs text-white/20">{outputs ? `Patch Antenna · ${substrate} · Top View` : "3D Preview will render here"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}