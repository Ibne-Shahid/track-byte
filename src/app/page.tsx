"use client";
import { useState, useEffect } from "react";
import confetti from "canvas-confetti";

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

  // Auth States
  const [playerName, setPlayerName] = useState<string | null>(null);
  const [tempName, setTempName] = useState("");

  useEffect(() => {
    const savedName = localStorage.getItem("track_byte_player");
    if (savedName) {
      setPlayerName(savedName);
    }
  }, []);

  useEffect(() => {
    if (playerName) fetchMissions();
  }, [playerName]);

  const fetchMissions = async () => {
    if (!playerName) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/missions?playerName=${playerName}`);
      const data = await res.json();
      setMissions(data);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempName.trim()) {
      localStorage.setItem("track_byte_player", tempName);
      setPlayerName(tempName);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("track_byte_player");
    setPlayerName(null);
    setMissions([]);
  };

  const handleConfetti = (isBossMission: boolean) => {
    if (isBossMission) {
      confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 } });
    } else {
      confetti({ particleCount: 80, spread: 50, origin: { y: 0.6 } });
    }
  };

  const addMission = async () => {
    if (!newMission || !playerName) return;
    setLoading(true);
    try {
      await fetch("/api/missions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newMission, isBoss, playerName }),
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
        handleConfetti(isBossMission);
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
      await fetch(`/api/missions/${id}`, { method: "DELETE" });
      await fetchMissions();
    } finally {
      setLoading(false);
    }
  };

  // Login Screen
  if (!playerName) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-gray-900 p-10 rounded-[3rem] border border-gray-800 text-center shadow-2xl">
          <h1 className="text-4xl font-black italic text-cyan-500 mb-2">TRACK BYTE</h1>
          <p className="text-gray-500 text-xs uppercase tracking-widest mb-8 font-bold">Initialize Identity</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              className="w-full bg-black border border-gray-800 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-cyan-500 text-center text-lg"
              placeholder="Enter Player Name..."
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              required
            />
            <button className="w-full bg-white text-black font-black py-4 rounded-2xl hover:bg-cyan-400 transition-all uppercase tracking-tighter">
              Start Operation
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-[#050505] text-white p-4 md:p-10 font-sans relative overflow-x-hidden ${isBoss ? 'bg-red-950/5' : ''}`}>

      {loading && !showOverlay && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-md">
          <div className="w-14 h-14 border-4 border-t-cyan-500 border-cyan-900/30 rounded-full animate-spin"></div>
        </div>
      )}

      {showOverlay && (
        <div className="fixed inset-0 z-101 flex items-center justify-center bg-black/80 backdrop-blur-2xl">
          <h1 className="text-6xl font-black text-red-600 animate-pulse italic uppercase tracking-tighter">SYSTEM BROKED</h1>
        </div>
      )}

      <div className="max-w-3xl mx-auto">
        <header className="mb-16 flex justify-between items-end border-b border-gray-900 pb-6">
          <div>
            <h1 className="text-4xl font-black italic tracking-tighter text-white">TRACK <span className="text-cyan-500">BYTE</span></h1>
            <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mt-1">Player: {playerName}</p>
          </div>
          <button onClick={handleLogout} className="text-[10px] font-black text-gray-700 hover:text-red-500 uppercase tracking-widest transition-colors">Terminate Session</button>
        </header>

        <div className="bg-[#0a0a0a] p-2 rounded-[2.5rem] border border-gray-800/50 mb-12">
          <div className="bg-[#0f0f0f] p-6 rounded-[2.3rem] border border-gray-800">
            <input
              className="w-full bg-transparent p-2 text-xl outline-none mb-6 placeholder:text-gray-800 font-bold"
              placeholder="Assign next objective..."
              value={newMission}
              onChange={(e) => setNewMission(e.target.value)}
            />
            <div className="flex items-center justify-between">
              <button onClick={() => setIsBoss(!isBoss)} className={`flex items-center gap-3 px-6 py-2.5 rounded-2xl border-2 transition-all font-black text-[11px] uppercase tracking-wider ${isBoss ? 'bg-red-600/10 border-red-600 text-red-500' : 'border-gray-800 text-gray-600'}`}>SYSTEM BREAKER LEVEL</button>
              <button onClick={addMission} className="bg-white text-black font-black px-12 py-3.5 rounded-2xl hover:bg-cyan-400 transition-all">DEPLOY</button>
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          {missions.map((mission) => (
            <div key={mission._id} className={`flex items-center justify-between p-7 rounded-[2.2rem] border transition-all duration-500 ${mission.status === "Completed" ? "bg-black/40 border-gray-900 opacity-30" : mission.isBoss ? "bg-red-950/5 border-red-900/40 hover:border-red-600" : "bg-[#0a0a0a] border-gray-800 hover:border-gray-600"}`}>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className={`text-2xl font-bold tracking-tight transition-all duration-500 ${mission.status === "Completed" ? "text-gray-600 line-through opacity-50" : "text-gray-100"}`}>
                    {mission.title}
                  </h3>

                  {mission.isBoss && (
                    mission.status === "Completed" ? (
                      <span className="flex items-center gap-1 bg-green-500/20 text-green-500 border border-green-500/50 text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-tighter shadow-[0_0_10px_rgba(34,197,94,0.2)]">
                        ✓ System Breached
                      </span>
                    ) : (
                      <span className="relative flex items-center gap-1 bg-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded uppercase italic animate-pulse">
                        <span className="absolute inset-0 bg-red-600 rounded animate-ping opacity-25"></span>
                        <span className="relative">CRITICAL</span>
                      </span>
                    )
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest inline-block ${mission.status === "Completed" ? "bg-gray-800 text-gray-500" : "bg-cyan-950 text-cyan-500"}`}>
                    {mission.status}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {mission.status !== "Completed" && (
                  <button onClick={() => updateStatus(mission._id, mission.status, mission.isBoss)} className={`h-14 w-14 rounded-[1.2rem] flex items-center justify-center transition-all ${mission.isBoss ? 'bg-red-600' : 'bg-white text-black'}`}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </button>
                )}
                <button onClick={() => deleteMission(mission._id)} className="h-10 w-10 text-gray-800 hover:text-red-500 transition-all flex items-center justify-center">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                </button>
              </div>
            </div>
          ))}

          {missions.length === 0 && !loading && (
            <div className="text-center py-20 border-2 border-dashed border-gray-800 rounded-[2.5rem] bg-[#070707]">
              <p className="text-gray-600 font-bold uppercase tracking-[0.3em] text-xs">No active signals for {playerName}...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}