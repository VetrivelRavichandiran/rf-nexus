import { useState, useEffect, memo } from "react";
import { Layers, ZoomIn, Download } from "lucide-react";
import { apiClient } from "../api/base44Client";

const ViewButton = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
    style={{
      background: active ? "rgba(0,245,255,0.12)" : "rgba(255,255,255,0.04)",
      border: `1px solid ${
        active ? "rgba(0,245,255,0.4)" : "rgba(255,255,255,0.08)"
      }`,
      color: active ? "#00f5ff" : "rgba(255,255,255,0.4)",
      boxShadow: active ? "0 0 12px rgba(0,245,255,0.1)" : "none",
    }}
  >
    {label}
  </button>
);

const AntennaLayerItem = ({ label, color, visible, onToggle }) => (
  <div
    className="flex items-center justify-between py-2"
    style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
  >
    <div className="flex items-center gap-2.5">
      <div
        className="w-3 h-3 rounded-sm"
        style={{ background: color, boxShadow: `0 0 6px ${color}80` }}
      />
      <span
        className="text-xs"
        style={{
          color: visible ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.3)",
        }}
      >
        {label}
      </span>
    </div>

    <button
      onClick={onToggle}
      className="w-8 h-4 rounded-full transition-all relative"
      style={{
        background: visible
          ? "rgba(0,245,255,0.3)"
          : "rgba(255,255,255,0.08)",
        border: `1px solid ${
          visible ? "rgba(0,245,255,0.5)" : "rgba(255,255,255,0.1)"
        }`,
      }}
    >
      <div
        className="absolute top-0.5 h-3 w-3 rounded-full transition-all"
        style={{
          background: visible ? "#00f5ff" : "rgba(255,255,255,0.3)",
          left: visible ? "calc(100% - 14px)" : "1px",
          boxShadow: visible ? "0 0 6px #00f5ff" : "none",
        }}
      />
    </button>
  </div>
);

/* ---------------- SVG ENGINE ---------------- */

const AntennaDiagram = memo(({ view, layers, data }) => {

  const patchVisible = layers.find((l) => l.id === "patch")?.visible;
  const subVisible = layers.find((l) => l.id === "substrate")?.visible;
  const groundVisible = layers.find((l) => l.id === "ground")?.visible;
  const feedVisible = layers.find((l) => l.id === "feed")?.visible;
  const portVisible = layers.find((l) => l.id === "port")?.visible;
  const patternVisible = layers.find((l) => l.id === "pattern")?.visible;

  const scale = 2.64;

  const pW = (data?.Patch_W || 37.26) * scale;
  const pL = (data?.Patch_L || 28.84) * scale;
  const fW = (data?.Feed_W || 3.07) * scale;

  const sW = (data?.Sub_W || 60) * scale;
  const sL = (data?.Sub_L || 60) * scale;

  return (
    <svg
      viewBox="0 0 500 380"
      className="w-full h-full transition-all duration-500"
      style={{ maxHeight: "420px" }}
    >

      {/* Radiation Pattern */}
      {patternVisible && (
        <g opacity="0.35">
          {[60, 100, 140].map((r, i) => (
            <circle
              key={i}
              cx="250"
              cy="140"
              r={r}
              fill="none"
              stroke="rgba(0,245,255,0.15)"
              strokeDasharray="5 5"
            />
          ))}

          {Array.from({ length: 12 }, (_, i) => {
            const angle = (i * 30 * Math.PI) / 180;
            const x = 250 + Math.cos(angle) * 140;
            const y = 140 + Math.sin(angle) * 140;

            return (
              <line
                key={i}
                x1="250"
                y1="140"
                x2={x}
                y2={y}
                stroke="rgba(0,245,255,0.12)"
              />
            );
          })}

          {patchVisible && (
            <ellipse
              cx="250"
              cy="120"
              rx={pW * 0.9}
              ry={pL * 1.5}
              fill="rgba(0,245,255,0.15)"
              stroke="#00f5ff"
              strokeWidth="1.5"
            />
          )}
        </g>
      )}

      {/* Original grid */}
      {Array.from({ length: 12 }, (_, i) => (
        <line
          key={i}
          x1="0"
          y1={i * 35}
          x2="500"
          y2={i * 35}
          stroke="rgba(0,245,255,0.03)"
        />
      ))}

      {patchVisible && (
        <g opacity={Math.min(pL / 120, 0.6)}>
          <ellipse
            cx="250"
            cy="100"
            rx={pW / 2 + 20}
            ry={pL / 2 + 20}
            fill="none"
            stroke="rgba(0,245,255,0.06)"
            strokeDasharray="4 4"
          />
        </g>
      )}

      {/* ISO VIEW */}
      {view === "iso" && (
        <g transform="translate(250,200)">
          {groundVisible && (
            <polygon
              points="-150,80 150,80 120,40 -120,40"
              fill="#6b21a8"
            />
          )}

          {subVisible && (
            <polygon
              points="-140,40 140,40 110,0 -110,0"
              fill="#1a2a4a"
            />
          )}

          {feedVisible && (
            <polygon
              points={`-${fW / 2},0 ${fW / 2},0 ${fW / 2},-30 -${fW / 2},-30`}
              fill="#39ff14"
            />
          )}

          {patchVisible && (
            <polygon
              points={`-${pW / 2},-2 ${pW / 2},-2 ${pW / 2 - 15},${-pL /
                1.5} -${pW / 2 - 15},${-pL / 1.5}`}
              fill="#00f5ff"
            />
          )}

          {portVisible && (
            <circle cx="0" cy="70" r="5" fill="#fbbf24" />
          )}
        </g>
      )}

      {/* TOP VIEW */}
      {view === "top" && (
        <g transform="translate(250,190)">
          {subVisible && (
            <rect
              x={-sW / 2}
              y={-sL / 2}
              width={sW}
              height={sL}
              fill="#0a1932"
            />
          )}

          {patchVisible && (
            <rect
              x={-pW / 2}
              y={-pL / 2}
              width={pW}
              height={pL}
              fill="#00f5ff"
            />
          )}

          {feedVisible && (
            <rect
              x={-fW / 2}
              y={pL / 2}
              width={fW}
              height="60"
              fill="#39ff14"
            />
          )}

          {portVisible && (
            <circle
              cx="0"
              cy={pL / 2 + 70}
              r="6"
              fill="#fbbf24"
            />
          )}
        </g>
      )}

      {/* FRONT VIEW */}
      {view === "front" && (
        <g transform="translate(250,220)">
          {subVisible && (
            <rect
              x={-sW / 2}
              y="-20"
              width={sW}
              height="40"
              fill="#0a1932"
            />
          )}

          {patchVisible && (
            <rect
              x={-pW / 2}
              y="-25"
              width={pW}
              height="6"
              fill="#00f5ff"
            />
          )}
        </g>
      )}
    </svg>
  );
});

/* ---------------- MAIN COMPONENT ---------------- */

export default function Structure3D() {

  const [view, setView] = useState("iso");

  const [layers, setLayers] = useState([
    { id: "patch", label: "Radiating Patch", color: "#00f5ff", visible: true },
    { id: "substrate", label: "FR4 Substrate", color: "#3b82f6", visible: true },
    { id: "ground", label: "Ground Plane", color: "#a855f7", visible: true },
    { id: "feed", label: "Microstrip Feed", color: "#39ff14", visible: true },
    { id: "port", label: "SMA Port", color: "#fbbf24", visible: true },
    { id: "pattern", label: "Radiation Pattern", color: "#22d3ee", visible: true },
  ]);

  const [activeData, setActiveData] = useState({
    Patch_W: 37.26,
    Patch_L: 28.84,
    Feed_W: 3.07,
    Sub_W: 60,
    Sub_L: 60,
    Sub_H: 1.6,
  });

  useEffect(() => {
    const fetchDimensions = async () => {
      try {
        const res = await apiClient.get("/design/latest");
        if (res) setActiveData(res);
      } catch {
        console.warn("Backend not running.");
      }
    };

    fetchDimensions();
  }, []);

  const toggleLayer = (id) =>
    setLayers((ls) =>
      ls.map((l) => (l.id === id ? { ...l, visible: !l.visible } : l))
    );

  const exportSTL = () => {
    const blob = new Blob([JSON.stringify(activeData)], {
      type: "text/plain",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = "antenna_design.txt";
    a.click();
  };

  return (
    <div className="p-6 space-y-5 min-h-full bg-[#050810]">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">
          3D Antenna Structure
        </h2>

        <button
          onClick={exportSTL}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs bg-[#00f5ff11] border border-[#00f5ff33] text-[#00f5ff]"
        >
          <Download size={12} />
          Export
        </button>
      </div>

      <div className="flex gap-2">
        {["iso", "top", "front"].map((v) => (
          <ViewButton
            key={v}
            label={v}
            active={view === v}
            onClick={() => setView(v)}
          />
        ))}
      </div>

      <div className="rounded-2xl overflow-hidden border border-[#00f5ff26]">
        <AntennaDiagram view={view} layers={layers} data={activeData} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {layers.map((l) => (
          <AntennaLayerItem
            key={l.id}
            {...l}
            onToggle={() => toggleLayer(l.id)}
          />
        ))}
      </div>
    </div>
  );
}