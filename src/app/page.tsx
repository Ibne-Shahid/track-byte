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

  const handleConfetti = (isBossMission: boolean) => {
    if (isBossMission) {
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) return clearInterval(interval);
        const particleCount = 50 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: Math.random(), y: Math.random() - 0.2 } });
      }, 250);
    } else {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#06b6d4', '#ffffff']
      });
    }
  };

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
      const response = await fetch(`/api/missions/${id}`, {
        method: "DELETE",
      });
      if (response.ok) await fetchMissions();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen bg-[#050505] text-white p-4 md:p-10 font-sans relative overflow-x-hidden transition-colors duration-1000 ${isBoss ? 'bg-red-950/5' : ''}`}>
      
      {loading && !showOverlay && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md">
          <div className="w-14 h-14 border-4 border-t-cyan-500 border-cyan-900/30 rounded-full animate-spin"></div>
        </div>
      )}

      {showOverlay && (
        <div className="fixed inset-0 z-[101] flex items-center justify-center bg-black/80 backdrop-blur-2xl">
          <div className="text-center scale-110 md:scale-150">
            <h1 className="text-6xl font-black italic tracking-tighter text-red-600 drop-shadow-[0_0_20px_rgba(220,38,38,0.8)] animate-pulse uppercase">
              Boss Slain
            </h1>
            <div className="h-1 w-full bg-red-600 mt-2 shadow-[0_0_10px_rgba(220,38,38,1)]"></div>
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto">
        <header className="mb-16 flex justify-between items-center border-b border-gray-900 pb-6">
          <div className="group cursor-default">
            <h1 className="text-4xl font-black italic tracking-tighter text-white group-hover:text-cyan-400 transition-colors">
              TRACK <span className="text-cyan-500">BYTE</span>
            </h1>
            <p className="text-[10px] font-bold text-gray-600 tracking-[0.4em] uppercase">Tactical Mission Interface</p>
          </div>
          <div className="hidden md:block">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-6 w-1 bg-cyan-900/30 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-500 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }}></div>
                </div>
              ))}
            </div>
          </div>
        </header>

        <div className="bg-[#0a0a0a] p-2 rounded-[2.5rem] border border-gray-800/50 shadow-2xl mb-12">
          <div className="bg-[#0f0f0f] p-6 rounded-[2.3rem] border border-gray-800">
            <input
              className="w-full bg-transparent p-2 text-xl outline-none mb-6 placeholder:text-gray-800 font-bold tracking-tight"
              placeholder="Assign next objective..."
              value={newMission}
              onChange={(e) => setNewMission(e.target.value)}
              disabled={loading}
            />
            <div className="flex items-center justify-between">
              <button 
                onClick={() => setIsBoss(!isBoss)}
                disabled={loading}
                className={`flex items-center gap-3 px-6 py-2.5 rounded-2xl border-2 transition-all font-black text-[11px] uppercase tracking-wider ${isBoss ? 'bg-red-600/10 border-red-600 text-red-500' : 'border-gray-800 text-gray-600'}`}
              >
                <div className={`w-2 h-2 rounded-full ${isBoss ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,1)]' : 'bg-gray-800'}`}></div>
                Boss Level
              </button>
              
              <button 
                onClick={addMission}
                disabled={loading}
                className="bg-white text-black font-black px-12 py-3.5 rounded-2xl transition-all hover:bg-cyan-400 active:scale-90 shadow-xl disabled:opacity-50"
              >
                DEPLOY
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          {missions.map((mission) => (
            <div 
              key={mission._id} 
              className={`group relative flex items-center justify-between p-7 rounded-[2.2rem] border transition-all duration-500 ${
                mission.status === "Completed" 
                ? "bg-black/40 border-gray-900 opacity-30" 
                : mission.isBoss 
                  ? "bg-red-950/5 border-red-900/40 hover:border-red-600 shadow-[0_0_30px_rgba(220,38,38,0.05)]" 
                  : "bg-[#0a0a0a] border-gray-800 hover:border-gray-600"
              }`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-2">
                  <h3 className={`text-2xl font-bold tracking-tight leading-none ${mission.status === "Completed" ? "text-gray-600" : "text-gray-100"}`}>
                    {mission.title}
                  </h3>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${mission.status === "Completed" ? "bg-gray-800 text-gray-500" : "bg-cyan-950 text-cyan-500"}`}>
                    {mission.status}
                  </span>
                  {mission.isBoss && mission.status !== "Completed" && (
                    <span className="text-[9px] font-black text-red-600 uppercase tracking-widest animate-pulse italic underline decoration-red-600/50 underline-offset-4">
                      Critical Target
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4">
                {mission.status !== "Completed" && (
                  <button 
                    onClick={() => updateStatus(mission._id, mission.status, mission.isBoss)}
                    disabled={loading}
                    className={`h-14 w-14 rounded-[1.2rem] flex items-center justify-center transition-all hover:scale-110 active:scale-90 ${mission.isBoss ? 'bg-red-600 text-white shadow-lg shadow-red-900/40' : 'bg-white text-black hover:bg-cyan-400'}`}
                  >
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </button>
                )}
                <button 
                  onClick={() => deleteMission(mission._id)}
                  disabled={loading}
                  className="h-10 w-10 text-gray-800 hover:text-red-500 transition-all flex items-center justify-center group-hover:opacity-100 opacity-0"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                </button>
              </div>
            </div>
          ))}

          {missions.length === 0 && !loading && (
            <div className="text-center py-20 border-2 border-dashed border-gray-800 rounded-[2.5rem] bg-[#070707]">
              <div className="mb-4 flex justify-center opacity-20">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/></svg>
              </div>
              <p className="text-gray-600 font-bold uppercase tracking-[0.3em] text-xs">No active signals. Awaiting objectives...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}