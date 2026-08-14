import { useState, useEffect } from "react";
import { FileText, Download, Cpu, ShieldCheck } from "lucide-react";

export default function Export() {
  const [activeDesign, setActiveDesign] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("latest_titan_design");
      if (raw) setActiveDesign(JSON.parse(raw));
    } catch (err) { 
      console.error("Sync Error", err); 
    }
  }, []);

  const handleDownloadReport = async () => {
    if (!activeDesign) return alert("Please generate a design first.");
    
    setExporting(true);

    try {
      const response = await fetch("http://localhost:8000/api/v1/export/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ format: "report", dimensions: activeDesign })
      });

      if (!response.ok) throw new Error("Backend synthesis failed");

      const blob = await response.blob();

      if (blob.size === 0) {
        throw new Error("Empty PDF received");
      }

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `RF_NEXUS_REPORT_${Date.now()}.pdf`;

      document.body.appendChild(link);
      link.click();

      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        link.remove();
        setExporting(false);
        setDone(true);
      }, 300);

    } catch (err) {
      console.error("Download Error:", err);
      setExporting(false);
      alert("Error generating PDF. Check backend logs.");
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 bg-[#050810] text-white min-h-screen">
      
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold font-['Orbitron'] tracking-tighter text-[#00f5ff]">
          Engineering Documentation
        </h2>
        <p className="text-white/40 text-sm">Industrial Synthesis Reports</p>
      </div>

      <div className="bg-[#070b18] border border-white/10 rounded-3xl p-10 flex flex-col items-center text-center space-y-6">
        
        <div className="w-24 h-24 rounded-3xl bg-[#00f5ff05] border border-[#00f5ff20] flex items-center justify-center">
          <FileText size={48} className="text-[#00f5ff]" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-2xl font-bold">Titan Master Report v4.0</h3>
          <p className="text-white/40 text-sm max-w-md">
            Features vector-labeled diagrams, AI confidence scores,
            and professional watermarks.
          </p>
        </div>

        <button 
          onClick={handleDownloadReport}
          disabled={exporting}
          className={`w-full max-w-md py-5 rounded-2xl font-bold font-['Orbitron'] transition-all flex items-center justify-center gap-3 ${
            exporting 
              ? 'bg-white/5 text-white/30' 
              : 'bg-[#00f5ff] text-black hover:scale-[1.05]'
          }`}
        >
          {exporting
            ? <><Cpu className="animate-spin" /> PACKAGING...</>
            : <><Download size={20} /> DOWNLOAD MASTER REPORT</>}
        </button>

        {done && (
          <div className="flex items-center gap-2 text-[#39ff14] text-xs font-bold uppercase tracking-widest">
            <ShieldCheck size={16} /> Verified Document Ready
          </div>
        )}
      </div>
    </div>
  );
}