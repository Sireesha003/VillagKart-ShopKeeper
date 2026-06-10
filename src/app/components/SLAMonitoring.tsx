import { useState, useEffect } from "react";
import { ArrowLeft, AlertTriangle, TrendingUp, Clock, CheckCircle, BarChart2, Loader2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line, Tooltip } from "recharts";
import api from "../../api/axios";

interface SLAMonitoringProps {
  onBack: () => void;
}

const hourlyData = [
  { time: "09:00", orders: 8, onTime: 8, breached: 0 },
  { time: "09:30", orders: 12, onTime: 10, breached: 2 },
  { time: "10:00", orders: 15, onTime: 13, breached: 2 },
  { time: "10:30", orders: 9, onTime: 9, breached: 0 },
  { time: "11:00", orders: 11, onTime: 10, breached: 1 },
  { time: "11:30", orders: 7, onTime: 7, breached: 0 },
];

const processingTimes = [
  { time: "09:00", picking: 8, packing: 5, handover: 3 },
  { time: "09:30", picking: 10, packing: 6, handover: 4 },
  { time: "10:00", picking: 7, packing: 4, handover: 2 },
  { time: "10:30", picking: 9, packing: 5, handover: 3 },
  { time: "11:00", picking: 11, packing: 7, handover: 4 },
  { time: "11:30", picking: 8, packing: 5, handover: 3 },
];

export function SLAMonitoring({ onBack }: SLAMonitoringProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/sla').then(res => {
      setData(res.data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#F5F7FA] items-center justify-center">
        <Loader2 className="animate-spin text-[#D32F2F]" size={40} />
      </div>
    );
  }

  const breaches = data?.breaches || [];
  const summary = data?.summary || { active_breaches: 0, at_risk: 0, active_orders: 0, avg_fulfillment: 0 };
  const onTimeCount = summary.active_orders - summary.at_risk - summary.active_breaches;
  
  let complianceRate = 100;
  if (summary.active_orders > 0) {
    complianceRate = (onTimeCount / summary.active_orders) * 100;
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F7FA]">
      <div style={{ background: "linear-gradient(135deg, #D32F2F 0%, #B71C1C 100%)" }} className="px-4 pt-12 pb-4">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
            <ArrowLeft size={20} color="white" />
          </button>
          <div className="flex-1">
            <h1 className="text-white" style={{ fontWeight: 700, fontSize: "18px" }}>SLA Monitoring</h1>
            <p className="text-white/70" style={{ fontSize: "12px" }}>Operations Command Center · Today</p>
          </div>
          <div className="bg-white/20 rounded-full px-2.5 py-1 flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-white" style={{ fontWeight: 600, fontSize: "11px" }}>Live</span>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 mt-4">
          {[
            { label: "Active Orders", value: summary.active_orders, color: "white" },
            { label: "On Track", value: onTimeCount, color: "#4CAF50" },
            { label: "At Risk", value: summary.at_risk, color: "#FFC107" },
            { label: "Breached", value: summary.active_breaches, color: "#FF5252" },
          ].map(s => (
            <div key={s.label} className="bg-white/10 rounded-xl p-2 text-center">
              <p style={{ color: s.color, fontWeight: 700, fontSize: "16px" }}>{s.value}</p>
              <p className="text-white/70" style={{ fontSize: "9px" }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4 p-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-gray-700" style={{ fontWeight: 600, fontSize: "13px" }}>SLA Compliance Rate</h3>
            <span className="text-green-600" style={{ fontWeight: 700, fontSize: "14px" }}>{complianceRate.toFixed(1)}%</span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-2">
            <div className="h-full flex">
              <div style={{ width: `${complianceRate}%`, backgroundColor: "#2E7D32" }} />
              <div style={{ width: `${(summary.at_risk/summary.active_orders)*100 || 0}%`, backgroundColor: "#FFC107" }} />
              <div style={{ width: `${(summary.active_breaches/summary.active_orders)*100 || 0}%`, backgroundColor: "#D32F2F" }} />
            </div>
          </div>
        </div>

        {breaches.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={16} color="#D32F2F" />
              <h3 className="text-gray-700" style={{ fontWeight: 600, fontSize: "13px" }}>SLA Breach Alerts</h3>
              <span className="ml-auto bg-red-100 text-red-700 rounded-full px-2 py-0.5" style={{ fontSize: "11px", fontWeight: 600 }}>
                {breaches.length} today
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {breaches.map((breach: any) => (
                <div
                  key={breach.order_number}
                  className="rounded-xl p-3"
                  style={{ backgroundColor: breach.delay_minutes > 15 ? "#FFEBEE" : "#FFF3E0" }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-gray-800" style={{ fontWeight: 700, fontSize: "13px" }}>#{breach.order_number}</span>
                    <span style={{ color: "#D32F2F", fontWeight: 700, fontSize: "13px" }}>+{breach.delay_minutes} min</span>
                  </div>
                  <p className="text-gray-500" style={{ fontSize: "11px" }}>{breach.order_type} · Stage: {breach.status}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="text-gray-700 mb-3" style={{ fontWeight: 600, fontSize: "13px" }}>Hourly Order Volume</h3>
          <div style={{ height: 150 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyData} barSize={18}>
                <XAxis dataKey="time" tick={{ fontSize: 9, fill: "#9E9E9E" }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip contentStyle={{ fontSize: "11px", borderRadius: "8px", border: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }} />
                <Bar dataKey="onTime" stackId="a" fill="#2E7D32" radius={[0, 0, 2, 2]} name="On Time" />
                <Bar dataKey="breached" stackId="a" fill="#D32F2F" radius={[2, 2, 0, 0]} name="Breached" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm pb-10">
          <h3 className="text-gray-700 mb-3" style={{ fontWeight: 600, fontSize: "13px" }}>Stage Time Trend (minutes)</h3>
          <div style={{ height: 130 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={processingTimes}>
                <XAxis dataKey="time" tick={{ fontSize: 9, fill: "#9E9E9E" }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip contentStyle={{ fontSize: "11px", borderRadius: "8px", border: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }} />
                <Line type="monotone" dataKey="picking" stroke="#00891D" strokeWidth={2} dot={false} name="Picking" />
                <Line type="monotone" dataKey="packing" stroke="#EF5A06" strokeWidth={2} dot={false} name="Packing" />
                <Line type="monotone" dataKey="handover" stroke="#2E7D32" strokeWidth={2} dot={false} name="Handover" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-4 mt-2">
            {[
              { label: "Picking", color: "#00891D" },
              { label: "Packing", color: "#EF5A06" },
              { label: "Handover", color: "#2E7D32" },
            ].map(l => (
              <div key={l.label} className="flex items-center gap-1">
                <div className="w-3 h-0.5 rounded-full" style={{ backgroundColor: l.color }} />
                <span className="text-gray-400" style={{ fontSize: "10px" }}>{l.label}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
