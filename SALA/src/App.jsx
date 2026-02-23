import React, { useState, useEffect } from "react";
import { Shield, ShieldAlert, UserCheck, UserX, Clock, Camera } from "lucide-react";

const App = () => {
  const [status, setStatus] = useState({
    status: "LOCKED",
    person_detected: false,
    confidence: 0,
    failed_attempts: 0,
  });
  const [events, setEvents] = useState([]);

  const fetchData = async () => {
    try {
      const statusRes = await fetch("http://localhost/api/get_status.php");
      const statusData = await statusRes.json();
      setStatus(statusData);

      const eventsRes = await fetch("http://localhost/api/get_events.php");
      const eventsData = await eventsRes.json();
      setEvents(eventsData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 1000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    if (status.status === "DANGER") return "bg-red-600";
    if (status.status === "UNLOCKED") return "bg-green-500";
    return "bg-blue-600";
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-8 bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">SALA</h1>
            <p className="text-slate-400">Security Control Interface</p>
          </div>
          <div className={`px-6 py-2 rounded-full font-bold flex items-center gap-2 animate-pulse ${getStatusColor()}`}>
            {status.status === "DANGER" ? <ShieldAlert size={20} /> : <Shield size={20} />}
            {status.status}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-xl">
              <div className="p-4 bg-slate-700/50 flex items-center gap-2 border-b border-slate-600">
                <Camera size={20} className="text-blue-400" />
                <span className="font-semibold uppercase tracking-wider text-sm">Live AI Monitor</span>
              </div>
              <div className="relative aspect-video bg-black flex items-center justify-center">
                <img 
                  src="http://localhost:5000/video_feed" 
                  alt="Live Feed" 
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/640x480?text=Camera+Offline";
                  }}
                />
                {status.person_detected && (
                  <div className="absolute top-4 right-4 bg-red-600 px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg animate-bounce">
                    <UserX size={18} />
                    PERSON DETECTED
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg">
                <div className="flex items-center gap-4 mb-2">
                  <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
                    <UserCheck size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-slate-400 uppercase">Detection Confidence</p>
                    <p className="text-2xl font-bold">{(status.confidence * 100).toFixed(1)}%</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg">
                <div className="flex items-center gap-4 mb-2">
                  <div className="p-3 bg-red-500/10 rounded-xl text-red-500">
                    <ShieldAlert size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-slate-400 uppercase">Failed Attempts</p>
                    <p className="text-2xl font-bold text-red-500">{status.failed_attempts} / 3</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-xl flex flex-col h-[600px]">
            <div className="p-6 border-b border-slate-700 flex items-center gap-2">
              <Clock size={20} className="text-blue-400" />
              <h2 className="text-xl font-bold">Activity Log</h2>
            </div>
            <div className="overflow-y-auto flex-1 p-4 space-y-3">
              {events.map((event, index) => (
                <div key={index} className="p-4 bg-slate-900/50 rounded-xl border border-slate-700 hover:border-slate-500 transition-colors">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-mono text-blue-400">{event.timestamp}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                      event.result === 'Access Granted' || event.result === 'DOOR IS UNLOCKED' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                    }`}>
                      {event.result}
                    </span>
                  </div>
                  <p className="font-semibold text-sm">{event.type}</p>
                  <p className="text-xs text-slate-400">{event.details}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
