import { useState, useEffect, Suspense } from "react";
import { Zap, TrendingUp, Cpu, Activity, Radio, BarChart2, Target, Wifi, ArrowUpRight, Box, Maximize2, Circle } from "lucide-react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stage, PerspectiveCamera, ContactShadows, Environment } from "@react-three/drei";
import { apiClient } from "../api/base44Client";
import AntennaModel from "./AntennaView"; // The 3D Component we built

// --- YOUR ORIGINAL UTILITY COMPONENTS ---

const AnimatedCounter = ({ target, suffix = "", duration = 2000 }) => {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setVal(target); clearInterval(timer); }
      else setVal(parseFloat(start.toFixed(2)));
    }, 16);
    return () => clearInterval(timer);
  }, [target]);
  return <span>{val}{suffix}</span>;
};

const MetricCard = ({ label, value, suffix, icon: Icon, color, change, delay = 0 }) => {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), delay); return () => clearTimeout(t); }, []);
  return (
    <div
      className="relative overflow-hidden rounded-2xl p-5 transition-all duration-700"
      style={{
        background: "linear-gradient(135deg, #0a1020, #070b18)",
        border: `1px solid ${visible ? color + "33" : "rgba(255,255,255,0.05)"}`,
        boxShadow: visible ? `0 0 30px ${color}10` : "none",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(16px)",
      }}
    >
      <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl opacity-10" style={{ background: color, transform: "translate(30%, -30%)" }} />
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl" style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
            <Icon size={18} color={color} />
          </div>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs" style={{ background: "rgba(57, 255, 20, 0.1)", color: "#39ff14", border: "1px solid rgba(57, 255, 20, 0.2)" }}>
            <ArrowUpRight size={10} /> {change}
          </div>
        </div>
        <div className="text-3xl font-bold mb-1" style={{ color, fontFamily: "'Orbitron', sans-serif" }}>
          {visible ? <AnimatedCounter target={parseFloat(value)} suffix={suffix} /> : `0${suffix}`}
        </div>
        <div className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{label}</div>
      </div>
      <div className="absolute bottom-0 left-0 w-16 h-0.5" style={{ background: `linear-gradient(90deg, ${color}, transparent)` }} />
    </div>
  );
};

const RadarChart = () => {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    let p = 0;
    const t = setInterval(() => { p += 1; setProgress(p); if (p >= 100) clearInterval(t); }, 20);
    return () => clearInterval(t);
  }, []);

  const params = [
    { label: "Gain", val: 82, color: "#00f5ff" },
    { label: "Directivity", val: 90, color: "#a855f7" },
    { label: "Rad Eff", val: 75, color: "#39ff14" },
    { label: "Total Eff", val: 68, color: "#ff0080" },
    { label: "S11", val: 95, color: "#fbbf24" },
    { label: "VSWR", val: 88, color: "#00f5ff" },
  ];

  return (
    <div className="space-y-3">
      {params.map((p, i) => (
        <div key={p.label} className="flex items-center gap-3">
          <span className="text-xs w-20 text-right flex-shrink-0" style={{ color: "rgba(255,255,255,0.45)" }}>{p.label}</span>
          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{
                width: `${(progress / 100) * p.val}%`,
                background: `linear-gradient(90deg, ${p.color}80, ${p.color})`,
                boxShadow: `0 0 8px ${p.color}60`,
                transitionDelay: `${i * 100}ms`,
              }}
            />
          </div>
          <span className="text-xs w-8 flex-shrink-0" style={{ color: p.color, fontFamily: "'Orbitron', sans-serif" }}>{p.val}%</span>
        </div>
      ))}
    </div>
  );
};

const FreqSpectrumBar = () => {
  const bars = Array.from({ length: 30 }, (_, i) => ({
    h: Math.random() * 60 + 10,
    color: i > 10 && i < 20 ? "#00f5ff" : "#a855f7",
    active: i > 10 && i < 20,
  }));
  return (
    <div className="flex items-end gap-0.5 h-16">
      {bars.map((b, i) => (
        <div key={i} className="flex-1 rounded-t-sm transition-all duration-300"
          style={{
            height: `${b.h}%`,
            background: b.active ? `linear-gradient(180deg, ${b.color}, ${b.color}40)` : "rgba(255,255,255,0.06)",
            boxShadow: b.active ? `0 0 8px ${b.color}60` : "none",
          }}
        />
      ))}
    </div>
  );
};

const activities = [
  { time: "09:42", label: "Design Generated", sub: "2.4GHz Patch Antenna", color: "#00f5ff", status: "done" },
  { time: "09:38", label: "S11 Analysis Complete", sub: "Return Loss: -28.3 dB", color: "#39ff14", status: "done" },
  { time: "09:31", label: "3D Model Rendered", sub: "FR4 Substrate", color: "#a855f7", status: "done" },
  { time: "09:20", label: "CST Export Ready", sub: "project_v3.cst", color: "#fbbf24", status: "pending" },
  { time: "09:15", label: "Optimization Run", sub: "GA Iteration #47", color: "#ff0080", status: "done" },
];

// --- MAIN DASHBOARD COMPONENT ---

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  
  // State for the 3D model (AI output)
  const [activeDesign, setActiveDesign] = useState({
    Patch_W: 37.26, Patch_L: 28.84, Feed_W: 3.07,
    Slot1_W: 12.4, Slot1_L: 8.6, Slot2_W: 10.2
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await apiClient.get("/dashboard/stats");
        setDashboardData(res);
        // If your API returns the latest design, update the 3D view
        if(res.latest_design) setActiveDesign(res.latest_design);
      } catch (err) {
        console.warn("Backend link pending, using local demo.");
      }
    };
    fetchStats();
  }, []);

  const metrics = dashboardData?.metrics || [
    { label: "Operating Frequency", value: "2.4", suffix: " GHz", icon: Radio, color: "#00f5ff", change: "+0.2%" },
    { label: "Antenna Gain", value: "8.2", suffix: " dBi", icon: TrendingUp, color: "#a855f7", change: "+1.4%" },
    { label: "Return Loss (S11)", value: "28", suffix: " dB", icon: Activity, color: "#39ff14", change: "-3.1%" },
    { label: "Radiation Efficiency", value: "94.7", suffix: "%", icon: Target, color: "#fbbf24", change: "+0.8%" },
  ];

  return (
    <div className="p-6 space-y-6 min-h-full text-white bg-[#050810]">

      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl p-6 border border-[#00f5ff22] bg-gradient-to-br from-[#070b18] to-[#0a1030]">
        <div className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ backgroundImage: "linear-gradient(rgba(0,245,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,245,255,0.1) 1px, transparent 1px)", backgroundSize: "40px 40px" }}
        />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-[#39ff14] shadow-[0_0_6px_#39ff14]" />
              <span className="text-xs uppercase tracking-widest text-[#00f5ff99]">System Online</span>
            </div>
            <h1 className="text-2xl font-bold mb-1 font-['Orbitron']">
              RF<span className="text-[#00f5ff]">·</span>NEXUS Dashboard
            </h1>
            <p className="text-sm text-white/40">AI-Synthesized Microstrip Logic Engine</p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 rounded-xl text-sm font-medium bg-[#00f5ff1a] text-[#00f5ff] border border-[#00f5ff4d] flex items-center gap-2">
              <Zap size={14} /> Quick Synthesize
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, i) => <MetricCard key={m.label} {...m} delay={i * 100} />)}
      </div>

      {/* NEW 3D & PERFORMANCE ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 3D Visualizer (Merged) */}
        <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-[#070b18] h-[450px] relative overflow-hidden">
          <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
            <div className="bg-[#00f5ff11] p-1.5 rounded-lg border border-[#00f5ff33]">
              <Box size={16} className="text-[#00f5ff]" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-white/60">EM Structure Preview</span>
          </div>

          <Canvas shadows camera={{ position: [5, 4, 5], fov: 40 }}>
            <Suspense fallback={null}>
              <Stage environment="city" intensity={0.5}>
                <AntennaModel data={activeDesign} />
              </Stage>
              <OrbitControls autoRotate autoRotateSpeed={0.5} makeDefault />
            </Suspense>
          </Canvas>
          
          <div className="absolute bottom-4 left-4 bg-black/40 backdrop-blur-md p-3 rounded-xl border border-white/10">
             <div className="text-[10px] text-white/30 uppercase">Geometry Engine</div>
             <div className="text-xs font-['Orbitron'] text-[#00f5ff]">L: {activeDesign.Patch_L}mm | W: {activeDesign.Patch_W}mm</div>
          </div>
        </div>

        {/* Performance Radar (Your Original) */}
        <div className="lg:col-span-1 rounded-2xl p-5 border border-white/10 bg-[#070b18]">
          <h3 className="text-sm font-semibold mb-6 flex items-center gap-2">
            <Activity size={16} className="text-[#a855f7]" /> Performance Matrix
          </h3>
          <RadarChart />
        </div>
      </div>

      {/* Frequency Spectrum (Your Original) */}
      <div className="rounded-2xl p-5 border border-white/10 bg-[#070b18]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold">Frequency Spectrum Analysis</h3>
          <div className="flex items-center gap-2 text-xs text-white/30">
            <span className="w-3 h-1 rounded-full bg-[#00f5ff]" /> Active Band
          </div>
        </div>
        <FreqSpectrumBar />
        <div className="flex justify-between mt-2 px-1">
          {["1.0", "1.5", "2.0", "2.4", "3.0", "3.5", "4.0", "5.0"].map(f => (
            <span key={f} className="text-[10px] text-white/20 font-['Orbitron']">{f}GHz</span>
          ))}
        </div>
      </div>

      {/* Bottom Row: Activity + System Status (Your Original) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-2xl p-5 border border-white/10 bg-[#070b18]">
          <h3 className="text-sm font-semibold mb-4">Recent Design Activity</h3>
          <div className="space-y-4">
            {activities.map((a, i) => (
              <div key={i} className="flex items-center gap-4">
                <span className="text-[10px] text-white/20 font-['Orbitron'] w-10">{a.time}</span>
                <div className="w-2 h-2 rounded-full" style={{ background: a.color, boxShadow: `0 0 6px ${a.color}` }} />
                <div className="flex-1">
                  <div className="text-xs font-medium text-white/70">{a.label}</div>
                  <div className="text-[10px] text-white/30">{a.sub}</div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full border border-white/10">{a.status}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl p-5 border border-white/10 bg-[#070b18]">
          <h3 className="text-sm font-semibold mb-4">AI Engine Status</h3>
          <div className="space-y-4">
            {[
              { label: "Neural Solver", pct: 94, color: "#39ff14" },
              { label: "Synthesis Latency", pct: 67, color: "#00f5ff" },
            ].map(s => (
              <div key={s.label}>
                <div className="flex justify-between text-[10px] mb-1 text-white/50">
                  <span>{s.label}</span>
                  <span>{s.pct}%</span>
                </div>
                <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                  <div className="h-full" style={{ width: `${s.pct}%`, background: s.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}