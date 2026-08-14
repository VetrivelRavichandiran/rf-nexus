import { useState, useEffect } from "react";
import { Settings, Cpu, Database, Bell, User, Sliders, Save, RefreshCw, CheckCircle } from "lucide-react";

const Toggle = ({ on, onToggle }) => (
  <button onClick={onToggle}
    className="w-11 h-6 rounded-full transition-all relative"
    style={{ background: on ? "rgba(0,245,255,0.3)" : "rgba(255,255,255,0.08)", border: `1px solid ${on ? "rgba(0,245,255,0.5)" : "rgba(255,255,255,0.1)"}` }}>
    <div className="absolute top-0.5 h-5 w-5 rounded-full transition-all"
      style={{ background: on ? "#00f5ff" : "rgba(255,255,255,0.3)", left: on ? "calc(100% - 22px)" : "2px", boxShadow: on ? "0 0 8px #00f5ff" : "none" }} />
  </button>
);

const Slider = ({ value, onChange, min = 0, max = 100, color = "#00f5ff" }) => (
  <div className="flex items-center gap-3">
    <input type="range" min={min} max={max} value={value} onChange={e => onChange(Number(e.target.value))}
      className="flex-1 appearance-none h-1.5 rounded-full outline-none cursor-pointer"
      style={{ background: `linear-gradient(90deg, ${color} ${((value - min) / (max - min)) * 100}%, rgba(255,255,255,0.08) ${((value - min) / (max - min)) * 100}%)` }} />
    <span className="text-xs w-8 text-right" style={{ color, fontFamily: "'Orbitron', sans-serif" }}>{value}</span>
  </div>
);

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    gpuAccel: true, autoOptimize: true, realTimeSim: false,
    notifications: true, darkMode: true, animations: true,
    meshDensity: 75, popSize: 100, maxIter: 200, convergence: 85,
    substrate: "FR4", solver: "time", precision: "high",
  });

  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("rf_nexus_config");
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (err) {
        console.error("Failed to load settings", err);
      }
    }
  }, []);

  const set = (k, v) => setSettings(s => ({ ...s, [k]: v }));

  const handleSave = () => {
    setSaving(true);
    localStorage.setItem("rf_nexus_config", JSON.stringify(settings));
    
    // Simulate a high-speed engine save
    setTimeout(() => {
      setSaving(false);
      setSaveStatus(true);
      setTimeout(() => setSaveStatus(false), 2000);
    }, 800);
  };

  return (
    <div className="p-6 space-y-5 min-h-full bg-[#050810] text-white">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold font-['Orbitron'] text-[#fff]">Settings</h2>
          <p className="text-xs mt-0.5 text-white/40">Configure Titan Simulation Engine & AI Hyperparameters</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
          style={{ 
            background: saveStatus ? "rgba(57,255,20,0.1)" : "rgba(0,245,255,0.1)", 
            border: `1px solid ${saveStatus ? "#39ff14" : "rgba(0,245,255,0.3)"}`, 
            color: saveStatus ? "#39ff14" : "#00f5ff", 
            fontFamily: "'Orbitron', sans-serif" 
          }}>
          {saving ? <RefreshCw size={14} className="animate-spin" /> : saveStatus ? <CheckCircle size={14} /> : <Save size={14} />}
          {saving ? "Syncing..." : saveStatus ? "Config Saved" : "Save Config"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Simulation Engine */}
        <div className="rounded-2xl p-6 transition-all hover:border-white/20" style={{ background: "linear-gradient(135deg, #0a1020, #070b18)", border: "1px solid rgba(0,245,255,0.12)" }}>
          <div className="flex items-center gap-2 mb-6">
            <Cpu size={18} color="#00f5ff" />
            <span className="text-sm font-bold uppercase tracking-widest text-white/80 font-['Orbitron']">Simulation Engine</span>
          </div>
          <div className="space-y-5">
            {[
              { label: "GPU Acceleration", key: "gpuAccel", desc: "CUDA-enabled parallel processing" },
              { label: "Auto Optimization", key: "autoOptimize", desc: "Genetic algorithm post-generate" },
              { label: "Real-Time Simulation", key: "realTimeSim", desc: "Live EM field preview (high CPU)" },
            ].map(s => (
              <div key={s.key} className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white/70">{s.label}</div>
                  <div className="text-[10px] text-white/30">{s.desc}</div>
                </div>
                <Toggle on={settings[s.key]} onToggle={() => set(s.key, !settings[s.key])} />
              </div>
            ))}
            <div className="mt-4 pt-4 border-t border-white/5">
              <div className="flex justify-between items-center mb-3">
                <div className="text-xs text-white/40 uppercase tracking-tighter">Mesh Density (Tetrahedral)</div>
                <div className="text-[10px] text-[#00f5ff] font-mono">{settings.meshDensity}% Accuracy</div>
              </div>
              <Slider value={settings.meshDensity} onChange={v => set("meshDensity", v)} color="#00f5ff" />
            </div>
          </div>
        </div>

        {/* ML Optimizer */}
        <div className="rounded-2xl p-6" style={{ background: "linear-gradient(135deg, #0a1020, #070b18)", border: "1px solid rgba(168,85,247,0.12)" }}>
          <div className="flex items-center gap-2 mb-6">
            <Sliders size={18} color="#a855f7" />
            <span className="text-sm font-bold uppercase tracking-widest text-white/80 font-['Orbitron']">ML Optimizer (GA)</span>
          </div>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-[10px] uppercase text-white/40">Population Size</span>
              </div>
              <Slider value={settings.popSize} onChange={v => set("popSize", v)} min={10} max={500} color="#a855f7" />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-[10px] uppercase text-white/40">Max Iterations</span>
              </div>
              <Slider value={settings.maxIter} onChange={v => set("maxIter", v)} min={10} max={1000} color="#a855f7" />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-[10px] uppercase text-white/40">Convergence Threshold</span>
              </div>
              <Slider value={settings.convergence} onChange={v => set("convergence", v)} color="#39ff14" />
            </div>
          </div>
        </div>

        {/* Default Material */}
        <div className="rounded-2xl p-6" style={{ background: "linear-gradient(135deg, #0a1020, #070b18)", border: "1px solid rgba(251,191,36,0.12)" }}>
          <div className="flex items-center gap-2 mb-6">
            <Database size={18} color="#fbbf24" />
            <span className="text-sm font-bold uppercase tracking-widest text-white/80 font-['Orbitron']">Materials & Solver</span>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold uppercase text-[#fbbf24]/60 mb-3 block">Primary Substrate</label>
              <div className="grid grid-cols-3 gap-2">
                {["FR4", "RO4003", "Taconic"].map(s => (
                  <button key={s} onClick={() => set("substrate", s)}
                    className="py-2.5 rounded-xl text-xs font-bold transition-all"
                    style={{
                      background: settings.substrate === s ? "rgba(251,191,36,0.12)" : "rgba(255,255,255,0.03)",
                      border: `1px solid ${settings.substrate === s ? "rgba(251,191,36,0.4)" : "rgba(255,255,255,0.08)"}`,
                      color: settings.substrate === s ? "#fbbf24" : "rgba(255,255,255,0.4)",
                    }}>{s}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-[#a855f7]/60 mb-3 block">Solver Domain</label>
              <div className="grid grid-cols-2 gap-2">
                {[{ id: "time", label: "Time Domain" }, { id: "freq", label: "Freq Domain" }].map(s => (
                  <button key={s.id} onClick={() => set("solver", s.id)}
                    className="py-2.5 rounded-xl text-xs font-bold transition-all"
                    style={{
                      background: settings.solver === s.id ? "rgba(168,85,247,0.12)" : "rgba(255,255,255,0.03)",
                      border: `1px solid ${settings.solver === s.id ? "rgba(168,85,247,0.4)" : "rgba(255,255,255,0.08)"}`,
                      color: settings.solver === s.id ? "#a855f7" : "rgba(255,255,255,0.4)",
                    }}>{s.label}</button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Display */}
        <div className="rounded-2xl p-6" style={{ background: "linear-gradient(135deg, #0a1020, #070b18)", border: "1px solid rgba(57,255,20,0.12)" }}>
          <div className="flex items-center gap-2 mb-6">
            <Bell size={18} color="#39ff14" />
            <span className="text-sm font-bold uppercase tracking-widest text-white/80 font-['Orbitron']">Display Config</span>
          </div>
          <div className="space-y-4">
            {[
              { label: "Desktop Notifications", key: "notifications" },
              { label: "UI Animations", key: "animations" },
              { label: "Dark Mode", key: "darkMode" },
            ].map(s => (
              <div key={s.key} className="flex items-center justify-between">
                <span className="text-xs font-bold text-white/60">{s.label}</span>
                <Toggle on={settings[s.key]} onToggle={() => set(s.key, !settings[s.key])} />
              </div>
            ))}
          </div>

          <div className="mt-5 pt-5 border-t border-white/5">
            <div className="text-[10px] uppercase text-white/30 mb-3 font-bold">Calculation Precision</div>
            <div className="grid grid-cols-3 gap-2">
              {["fast", "balanced", "high"].map(p => (
                <button key={p} onClick={() => set("precision", p)}
                  className="py-2.5 rounded-xl text-[10px] font-bold capitalize transition-all"
                  style={{
                    background: settings.precision === p ? "rgba(57,255,20,0.1)" : "rgba(255,255,255,0.03)",
                    border: `1px solid ${settings.precision === p ? "rgba(57,255,20,0.4)" : "rgba(255,255,255,0.08)"}`,
                    color: settings.precision === p ? "#39ff14" : "rgba(255,255,255,0.4)",
                  }}>{p}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Version Info */}
      <div className="rounded-2xl p-5 flex items-center justify-between"
        style={{ background: "rgba(0,245,255,0.03)", border: "1px solid rgba(0,245,255,0.08)" }}>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(0,245,255,0.08)", border: "1px solid rgba(0,245,255,0.2)" }}>
            <Settings size={18} color="#00f5ff" />
          </div>
          <div>
            <div className="text-xs font-bold tracking-widest" style={{ color: "rgba(255,255,255,0.8)", fontFamily: "'Orbitron', sans-serif" }}>RF·NEXUS PRO ENGINE</div>
            <div className="text-[10px]" style={{ color: "rgba(255,255,255,0.25)" }}>Core v2.4.0 · B.Tech ECE Final Year Project · {new Date().getFullYear()} Edition</div>
          </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all hover:bg-white/5"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)" }}>
          <RefreshCw size={12} />Check Synthesis Updates
        </button>
      </div>
    </div>
  );
}