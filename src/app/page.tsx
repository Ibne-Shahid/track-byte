"use client";
import { useState, useEffect } from "react";

interface Mission {
  _id: string;
  title: string;
  status: string;
  isBoss: boolean;
}

export default function Home() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [newMission, setNewMission] = useState("");
  const [isBoss, setIsBoss] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);

  const fetchMissions = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/missions");
      const data = await res.json();
      setMissions(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMissions();
  }, []);

  const addMission = async () => {
    if (!newMission) return;
    setLoading(true);
    try {
      await fetch("/api/missions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newMission, isBoss }),
      });
      setNewMission("");
      setIsBoss(false);
      await fetchMissions();
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, currentStatus: string, isBossMission: boolean) => {
    if (currentStatus === "Completed") return;
    setLoading(true);
    try {
      const response = await fetch(`/api/missions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Completed" }),
      });
      if (response.ok) {
        if (isBossMission) {
          setShowOverlay(true);
          setTimeout(() => setShowOverlay(false), 3000);
        }
        await fetchMissions();
      }
    } finally {
      setLoading(false);
    }
  };

  const deleteMission = async (id: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/missions/${id}`, {
        method: "DELETE",
      });
      if (response.ok) await fetchMissions();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-10 font-sans relative overflow-x-hidden">
      {loading && !showOverlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md">
          <div className="w-14 h-14 border-4 border-t-cyan-500 border-cyan-900/30 rounded-full animate-spin"></div>
        </div>
      )}

      {showOverlay && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-red-600/20 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="text-center animate-bounce">
            <h1 className="text-6xl md:text-8xl font-black text-white drop-shadow-[0_0_30px_rgba(220,38,38,1)] italic tracking-tighter">
              BOSS DEFEATED
            </h1>
            <p className="text-red-400 font-bold tracking-[0.5em] mt-4 uppercase">Mission Accomplished</p>
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-5xl font-black italic tracking-tighter text-transparent bg-clip-text bg-linear-to-r from-cyan-400 to-blue-600">
            TRACK BYTE
          </h1>
          <p className="text-gray-500 text-sm mt-2 tracking-widest uppercase font-bold underline decoration-cyan-500/30">System v1.0.4</p>
        </header>

        <div className="bg-gray-900/50 p-6 rounded-3xl border border-gray-800 mb-12 backdrop-blur-sm">
          <input
            className="w-full bg-black border border-gray-800 p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all text-lg mb-4"
            placeholder="Initialize new objective..."
            value={newMission}
            onChange={(e) => setNewMission(e.target.value)}
          />
          <div className="flex flex-wrap items-center justify-between gap-4">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input 
                type="checkbox" 
                className="w-6 h-6 rounded accent-red-600 transition-all cursor-pointer" 
                checked={isBoss}
                onChange={(e) => setIsBoss(e.target.checked)}
              />
              <span className={`font-black text-sm tracking-tighter ${isBoss ? "text-red-500 animate-pulse" : "text-gray-500"}`}>
                HIGH-LEVEL BOSS TARGET
              </span>
            </label>
            <button 
              onClick={addMission}
              className={`px-8 py-3 rounded-2xl font-black transition-all active:scale-95 ${isBoss ? "bg-red-600 hover:bg-red-700 shadow-[0_0_20px_rgba(220,38,38,0.4)]" : "bg-white text-black hover:bg-cyan-400"}`}
            >
              DEPLOY
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {missions.map((mission) => (
            <div 
              key={mission._id} 
              className={`group relative p-6 rounded-3xl border-2 transition-all duration-500 ${
                mission.status === "Completed" 
                  ? "bg-gray-900/20 border-gray-800 opacity-40" 
                  : mission.isBoss 
                    ? "bg-red-950/10 border-red-900/50 hover:border-red-600 shadow-2xl shadow-red-900/20" 
                    : "bg-gray-900 border-gray-800 hover:border-cyan-500/50"
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    {mission.isBoss && <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded italic">BOSS</span>}
                    <h3 className={`text-xl font-bold tracking-tight ${mission.status === "Completed" ? "line-through text-gray-600" : "text-white"}`}>
                      {mission.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-[10px] font-black tracking-widest uppercase ${mission.status === "Completed" ? "text-green-500" : "text-yellow-500"}`}>
                      {mission.status}
                    </span>
                    {mission.isBoss && mission.status !== "Completed" && (
                      <div className="w-24 bg-gray-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-red-600 h-full animate-pulse w-full"></div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {mission.status !== "Completed" && (
                    <button 
                      onClick={() => updateStatus(mission._id, mission.status, mission.isBoss)}
                      className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${
                        mission.isBoss 
                        ? "bg-red-600 hover:bg-red-500 text-white" 
                        : "bg-cyan-900/30 text-cyan-400 hover:bg-cyan-500 hover:text-white"
                      }`}
                    >
                      {mission.isBoss ? "EXECUTE TARGET" : "MARK DONE"}
                    </button>
                  )}
                  <button 
                    onClick={() => deleteMission(mission._id)}
                    className="p-2 text-gray-700 hover:text-white transition-colors"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          {missions.length === 0 && !loading && (
            <div className="text-center py-20 border-2 border-dashed border-gray-800 rounded-3xl">
              <p className="text-gray-600 font-bold uppercase tracking-tighter">No active signals. Awaiting objectives...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}