"use client";
import { useState, useEffect } from "react";

interface Mission {
  _id: string;
  title: string;
  status: string;
}

export default function Home() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [newMission, setNewMission] = useState("");
  const [loading, setLoading] = useState(false);

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
        body: JSON.stringify({ title: newMission }),
      });
      setNewMission("");
      await fetchMissions();
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, currentStatus: string) => {
    setLoading(true);
    const nextStatus = currentStatus === "Pending" ? "Completed" : "Pending";
    try {
      const response = await fetch(`/api/missions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (response.ok) await fetchMissions();
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
    <div className="min-h-screen bg-gray-900 text-white p-8 font-sans relative">
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-cyan-400 mb-8 border-b border-cyan-900 pb-2">Track Byte 🕹️</h1>

        <div className="flex gap-2 mb-10">
          <input
            className="flex-1 bg-gray-800 border border-gray-700 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            placeholder="Enter mission name..."
            value={newMission}
            onChange={(e) => setNewMission(e.target.value)}
            disabled={loading}
          />
          <button
            onClick={addMission}
            disabled={loading}
            className="bg-cyan-600 hover:bg-cyan-500 px-6 py-3 rounded-lg font-bold transition disabled:opacity-50"
          >
            Add Mission
          </button>
        </div>

        <div className="space-y-4 text-white">
          {missions.map((mission) => (
            <div key={mission._id} className="flex items-center justify-between bg-gray-800 p-4 rounded-xl border border-gray-700">
              <div>
                <p className={`text-lg ${mission.status === "Completed" ? "line-through text-gray-500" : ""}`}>
                  {mission.title}
                </p>
                <span className={`text-xs uppercase font-bold ${mission.status === "Completed" ? "text-green-400" : "text-yellow-400"}`}>
                  {mission.status}
                </span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => updateStatus(mission._id, mission.status)}
                  disabled={mission.status === "Completed"}
                  className="text-sm bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded disabled:opacity-50"
                >
                  Done
                </button>
                <button
                  onClick={() => deleteMission(mission._id)}
                  disabled={loading}
                  className="text-sm bg-red-900/50 hover:bg-red-600 text-red-200 px-3 py-1 rounded disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}