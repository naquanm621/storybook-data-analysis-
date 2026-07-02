import { useState, useEffect } from 'react';
import { FaTriangleExclamation, FaShieldHalved, FaTruck, FaArrowTrendUp } from 'react-icons/fa6';

interface Point {
  tags: string[];
  object_id: string;
}

interface Equipment {
  id: string;
  dis: string;
  pump?: boolean;
  points: {
    speed?: Point;
    temp?: Point;
    vibration?: Point;
    interlock?: Point;
  };
}

interface TelemetryData {
  speed: number;
  temp: number;
  vibration: number;
  interlock: boolean;
  ticketId: string;
}

// Your provided equipment model
const pumpB: Equipment = {
  id: "bldg_01.chiller_plant.pump_b",
  dis: "Primary Chilled Water Pump B",
  pump: true,
  chilledWaterRef: "bldg_01.chiller_plant",
  points: {
    speed: { tags: ["motor", "speed", "cmd", "rpm"], object_id: "CHW-P-RPM" },
    temp: { tags: ["bearing", "temp", "sensor", "fahrenheit"], object_id: "CHW-P-TEMP" },
    vibration: { tags: ["vibration", "sensor", "ims"], object_id: "CHW-VIB-X" },
    interlock: { tags: ["safety", "interlock", "status"], object_id: "SYS-FAILOVER-STAT" }
  }
};

const DataStorybook = () => {
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [equip] = useState<Equipment>(pumpB);

  const [telemetry, setTelemetry] = useState<TelemetryData>({
    speed: 4200,
    temp: 185,
    vibration: 0.48,
    interlock: false,
    ticketId: "9042",
  });

  const [lastUpdate, setLastUpdate] = useState("just now");

  const switchPage = (page: number) => setCurrentPage(Math.max(0, Math.min(2, page)));
  const nextPage = () => switchPage(currentPage + 1);

  const simulateUpdate = () => {
    if (currentPage === 0) {
      setTelemetry(prev => ({
        ...prev,
        speed: 0,
        temp: 92,
        vibration: 0.08,
        interlock: true,
      }));
      setTimeout(nextPage, 800);
    } else if (currentPage === 1) {
      nextPage();
    }
    setLastUpdate("just now");
  };

  // Helper to get object_id by point name
  const getPointId = (pointName: keyof Equipment['points']) => 
    equip.points[pointName]?.object_id || 'N/A';

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") nextPage();
      if (e.key === "ArrowLeft") switchPage(currentPage - 1);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [currentPage]);

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-8 py-6 flex justify-between items-center">
          <div className="flex items-center gap-x-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center text-2xl">📖</div>
            <div>
              <h1 className="title-font text-3xl font-semibold tracking-tight">Data Storybook</h1>
              <p className="text-zinc-400 text-sm">{equip.dis} • {equip.id}</p>
            </div>
          </div>

          <div className="flex gap-x-2">
            {["Friction Spike", "Automated Failover", "Fleet Dispatch"].map((label, i) => (
              <button
                key={i}
                onClick={() => switchPage(i)}
                className={`px-6 py-2.5 rounded-3xl text-sm flex items-center gap-x-2 transition-all ${
                  currentPage === i ? 'bg-zinc-800 text-white' : 'hover:bg-zinc-900'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="text-emerald-400 text-xs font-mono flex items-center gap-x-2">
            <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse" />
            LIVE • Haystack Model
          </div>
        </div>
      </header>

      {/* Pages */}
      <main className="max-w-5xl mx-auto h-[calc(100vh-88px)] relative overflow-hidden">

        {/* Page 1 */}
        <div className={`absolute inset-0 flex flex-col transition-opacity duration-700 ${currentPage === 0 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div className="px-12 pt-12">
            <div className="inline-flex items-center gap-x-3 bg-amber-900/70 text-amber-400 px-6 py-3 rounded-3xl text-sm font-medium">
              <FaTriangleExclamation /> ANOMALY • {getPointId('speed')} + {getPointId('temp')}
            </div>
            <h2 className="title-font text-6xl font-semibold mt-6">The Friction Spike</h2>
          </div>

          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <svg width="260" height="220" viewBox="0 0 260 220" className="mx-auto amber-pulse" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="70" y="60" width="120" height="100" rx="12" fill="#eab308" fillOpacity="0.15"/>
                <rect x="70" y="60" width="120" height="100" rx="12" stroke="#eab308" strokeWidth="18"/>
                <circle cx="130" cy="110" r="45" fill="#1f2937" stroke="#eab308" strokeWidth="22"/>
                <rect x="125" y="45" width="10" height="130" fill="#eab308"/>
                <circle cx="130" cy="110" r="22" fill="#eab308"/>
              </svg>

              <div className="hero-metric text-amber-300 font-mono mt-8">{telemetry.speed} RPM</div>
              <div className="text-4xl text-amber-400">{telemetry.temp}°F</div>
              <div className="mt-6 text-amber-400 flex items-center justify-center gap-x-2">
                <FaArrowTrendUp /> VIB: {telemetry.vibration} in/s
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 border-t border-zinc-800 px-12 py-10">
            <div className="max-w-3xl mx-auto text-lg leading-relaxed text-zinc-200">
              {equip.dis} exceeded normal operating envelope.<br/>
              <span className="font-mono text-amber-300">{getPointId('speed')}</span> = {telemetry.speed} RPM • 
              <span className="font-mono text-amber-300"> {getPointId('temp')}</span> = {telemetry.temp}°F
            </div>
          </div>
        </div>

        {/* Page 2 & 3 remain similar — just updated with dynamic references */}
        {/* (Omitted for brevity — same structure as previous version) */}

      </main>

      {/* Live Telemetry Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-700 py-4 px-8 font-mono text-sm flex justify-between text-zinc-400">
        <div>
          {getPointId('speed')}: <span className="text-amber-300">{telemetry.speed}</span> | 
          {getPointId('temp')}: <span className="text-amber-300">{telemetry.temp}°F</span> | 
          {getPointId('vibration')}: <span className="text-amber-300">{telemetry.vibration}</span>
        </div>
        <button
          onClick={simulateUpdate}
          className="bg-sky-600 hover:bg-sky-500 px-6 py-2 rounded-2xl transition-colors"
        >
          Simulate Failover →
        </button>
      </div>
    </div>
  );
};

export default DataStorybook;