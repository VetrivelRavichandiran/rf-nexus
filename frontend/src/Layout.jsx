import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Cpu, Zap, BarChart2, Box, Download, Home, Activity,
  ChevronRight, Wifi, Radio, Settings, Bell, User
} from "lucide-react";

const navItems = [
  { icon: Home, label: "Dashboard", page: "Dashboard" },
  { icon: Zap, label: "Generate Design", page: "GenerateDesign" },
  { icon: Box, label: "3D Structure", page: "Structure3D" },
  { icon: BarChart2, label: "S11 Graph", page: "S11Graph" },
  { icon: Download, label: "Export to PDF", page: "Export" },
  { icon: Activity, label: "Analysis", page: "Analysis" },
  { icon: Settings, label: "Settings", page: "Settings" },
];

export default function Layout({ children, currentPageName }) {
  const [time, setTime] = useState(new Date());
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [pulseActive, setPulseActive] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const pulse = setInterval(() => {
      setPulseActive(true);
      setTimeout(() => setPulseActive(false), 500);
    }, 3000);
    return () => clearInterval(pulse);
  }, []);

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }} className="flex h-screen overflow-hidden bg-[#04060f]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Orbitron:wght@400;600;700;900&display=swap');

        :root {
          --neon-cyan: #00f5ff;
          --neon-purple: #a855f7;
          --neon-green: #39ff14;
          --neon-pink: #ff0080;
          --dark-bg: #04060f;
          --panel-bg: #070b18;
          --card-bg: #0a1020;
          --border-glow: rgba(0, 245, 255, 0.2);
        }

        * { box-sizing: border-box; }

        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #04060f; }
        ::-webkit-scrollbar-thumb { background: #00f5ff33; border-radius: 4px; }

        .nav-btn {
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
        }
        .nav-btn::before {
          content: '';
          position: absolute;
          left: 0; top: 0; bottom: 0;
          width: 3px;
          background: var(--neon-cyan);
          transform: scaleY(0);
          transition: transform 0.3s ease;
          border-radius: 0 2px 2px 0;
          box-shadow: 0 0 8px var(--neon-cyan);
        }
        .nav-btn:hover::before, .nav-btn.active::before { transform: scaleY(1); }
        .nav-btn:hover {
          background: rgba(0, 245, 255, 0.06) !important;
        }
        .nav-btn.active {
          background: rgba(0, 245, 255, 0.1) !important;
        }

        .glow-text {
          text-shadow: 0 0 10px rgba(0, 245, 255, 0.8), 0 0 20px rgba(0, 245, 255, 0.4);
        }

        .panel-border {
          border: 1px solid rgba(0, 245, 255, 0.15);
          box-shadow: 0 0 20px rgba(0, 245, 255, 0.03), inset 0 0 20px rgba(0, 0, 0, 0.3);
        }

        .grid-bg {
          background-image: 
            linear-gradient(rgba(0, 245, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 245, 255, 0.03) 1px, transparent 1px);
          background-size: 40px 40px;
        }

        @keyframes scan {
          0% { transform: translateY(-100%); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(100vh); opacity: 0; }
        }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-4px); }
        }

        @keyframes rotate-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes pulse-ring {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(0, 245, 255, 0.4); }
          70% { transform: scale(1); box-shadow: 0 0 0 8px rgba(0, 245, 255, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(0, 245, 255, 0); }
        }

        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }

        .logo-icon {
          animation: float 3s ease-in-out infinite;
        }

        .status-dot {
          animation: pulse-ring 2s infinite;
        }

        .scan-line {
          position: fixed;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, rgba(0, 245, 255, 0.4), transparent);
          animation: scan 6s linear infinite;
          pointer-events: none;
          z-index: 9999;
        }

        .shimmer-text {
          background: linear-gradient(90deg, #00f5ff, #a855f7, #00f5ff);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 3s linear infinite;
        }

        .corner-tl::before {
          content: '';
          position: absolute;
          top: -1px; left: -1px;
          width: 16px; height: 16px;
          border-top: 2px solid #00f5ff;
          border-left: 2px solid #00f5ff;
          border-radius: 2px 0 0 0;
        }
        .corner-tr::after {
          content: '';
          position: absolute;
          top: -1px; right: -1px;
          width: 16px; height: 16px;
          border-top: 2px solid #00f5ff;
          border-right: 2px solid #00f5ff;
          border-radius: 0 2px 0 0;
        }
      `}</style>

      {/* Scan line effect */}
      <div className="scan-line" />

      {/* Sidebar */}
      <div
        className="flex flex-col panel-border relative z-10 transition-all duration-300"
        style={{
          width: sidebarExpanded ? "240px" : "72px",
          minWidth: sidebarExpanded ? "240px" : "72px",
          background: "linear-gradient(180deg, #060a18 0%, #04060f 100%)",
          borderRight: "1px solid rgba(0, 245, 255, 0.12)",
        }}
      >
        {/* Logo Area */}
        <div className="p-4 pb-3" style={{ borderBottom: "1px solid rgba(0, 245, 255, 0.1)" }}>
          <div className="flex items-center gap-3">
            <div
              className="logo-icon flex-shrink-0 relative flex items-center justify-center rounded-xl"
              style={{
                width: 44, height: 44,
                background: "linear-gradient(135deg, rgba(0, 245, 255, 0.2), rgba(168, 85, 247, 0.2))",
                border: "1px solid rgba(0, 245, 255, 0.4)",
                boxShadow: "0 0 20px rgba(0, 245, 255, 0.2)",
              }}
            >
              <Radio size={22} color="#00f5ff" />
            </div>
            {sidebarExpanded && (
              <div>
                <div className="shimmer-text font-bold text-sm leading-tight" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                  RF·NEXUS
                </div>
                <div className="text-xs mt-0.5" style={{ color: "rgba(0, 245, 255, 0.5)", fontFamily: "'Orbitron', sans-serif", letterSpacing: "0.15em" }}>
                  v2.0 PRO
                </div>
              </div>
            )}
          </div>

          {sidebarExpanded && (
            <div className="mt-3 flex items-center gap-2 px-2 py-1.5 rounded-lg" style={{ background: "rgba(0, 245, 255, 0.05)", border: "1px solid rgba(0, 245, 255, 0.1)" }}>
              <div className="status-dot w-2 h-2 rounded-full flex-shrink-0" style={{ background: "#39ff14", boxShadow: "0 0 8px #39ff14" }} />
              <span className="text-xs" style={{ color: "rgba(0, 245, 255, 0.7)" }}>SYSTEM ONLINE</span>
              <span className="ml-auto text-xs" style={{ color: "rgba(0, 245, 255, 0.4)", fontFamily: "'Orbitron', sans-serif" }}>
                {time.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map(({ icon: Icon, label, page }) => {
            const isActive = currentPageName === page;
            return (
              <Link key={page} to={createPageUrl(page)}>
                <div
                  className={`nav-btn flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer ${isActive ? "active" : ""}`}
                  style={{ transition: "all 0.2s" }}
                >
                  <div
                    className="flex-shrink-0 flex items-center justify-center rounded-lg"
                    style={{
                      width: 34, height: 34,
                      background: isActive ? "rgba(0, 245, 255, 0.15)" : "rgba(255,255,255,0.04)",
                      border: `1px solid ${isActive ? "rgba(0, 245, 255, 0.4)" : "rgba(255,255,255,0.06)"}`,
                      boxShadow: isActive ? "0 0 10px rgba(0, 245, 255, 0.2)" : "none",
                    }}
                  >
                    <Icon size={15} color={isActive ? "#00f5ff" : "rgba(255,255,255,0.45)"} />
                  </div>
                  {sidebarExpanded && (
                    <>
                      <span className="text-sm flex-1" style={{ color: isActive ? "#00f5ff" : "rgba(255,255,255,0.55)", fontWeight: isActive ? 600 : 400 }}>
                        {label}
                      </span>
                      {isActive && <ChevronRight size={12} color="rgba(0, 245, 255, 0.5)" />}
                    </>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Bottom user area */}
        <div className="p-3" style={{ borderTop: "1px solid rgba(0, 245, 255, 0.1)" }}>
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, rgba(168, 85, 247, 0.3), rgba(0, 245, 255, 0.1))", border: "1px solid rgba(168, 85, 247, 0.3)" }}>
              <User size={14} color="#a855f7" />
            </div>
            {sidebarExpanded && (
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium truncate" style={{ color: "rgba(255,255,255,0.7)" }}>RF Engineer</div>
                <div className="text-xs truncate" style={{ color: "rgba(255,255,255,0.3)" }}>FYP · 2026</div>
              </div>
            )}
            {sidebarExpanded && (
              <button
                onClick={() => setSidebarExpanded(false)}
                className="p-1 rounded-md hover:bg-white/5 transition-colors"
              >
                <ChevronRight size={12} color="rgba(255,255,255,0.3)" style={{ transform: "rotate(180deg)" }} />
              </button>
            )}
          </div>
          {!sidebarExpanded && (
            <button
              onClick={() => setSidebarExpanded(true)}
              className="w-full mt-2 flex justify-center p-2 rounded-xl hover:bg-white/5 transition-colors"
            >
              <ChevronRight size={14} color="rgba(0, 245, 255, 0.5)" />
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div
          className="flex items-center justify-between px-6 py-3 flex-shrink-0"
          style={{
            background: "rgba(6, 10, 24, 0.95)",
            borderBottom: "1px solid rgba(0, 245, 255, 0.1)",
            backdropFilter: "blur(10px)",
          }}
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {(() => {
                  const NavIcon = navItems.find(n => n.page === currentPageName)?.icon;
                  return NavIcon ? <NavIcon size={16} color="#00f5ff" /> : null;
                })()}
              <span className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.8)" }}>
                {navItems.find(n => n.page === currentPageName)?.label || currentPageName}
              </span>
            </div>
            <ChevronRight size={12} color="rgba(255,255,255,0.2)" />
            <span className="text-xs px-2 py-0.5 rounded-md" style={{ background: "rgba(0, 245, 255, 0.08)", color: "#00f5ff", border: "1px solid rgba(0, 245, 255, 0.2)" }}>
              Patch Antenna Designer
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Live metrics in topbar */}
            <div className="hidden md:flex items-center gap-4">
              {[
                { label: "FREQ", value: "2.4 GHz", color: "#00f5ff" },
                { label: "GAIN", value: "8.2 dBi", color: "#a855f7" },
                { label: "S11", value: "-28 dB", color: "#39ff14" },
              ].map(m => (
                <div key={m.label} className="flex items-center gap-2">
                  <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em" }}>{m.label}</span>
                  <span className="text-xs font-bold" style={{ color: m.color, fontFamily: "'Orbitron', sans-serif" }}>{m.value}</span>
                </div>
              ))}
            </div>

            <div className="w-px h-5" style={{ background: "rgba(255,255,255,0.1)" }} />

            <button className="relative p-2 rounded-lg hover:bg-white/5 transition-colors" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
              <Bell size={14} color="rgba(255,255,255,0.4)" />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full" style={{ background: "#ff0080", boxShadow: "0 0 6px #ff0080" }} />
            </button>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: "rgba(0, 245, 255, 0.05)", border: "1px solid rgba(0, 245, 255, 0.15)" }}>
              <Cpu size={12} color="#00f5ff" />
              <span className="text-xs" style={{ color: "#00f5ff", fontFamily: "'Orbitron', sans-serif" }}>{pulseActive ? "COMPUTING" : "READY"}</span>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto grid-bg">
          {children}
        </div>
      </div>
    </div>
  );
}