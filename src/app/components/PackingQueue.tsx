import { useState, useEffect } from "react";
import { ArrowLeft, Clock, Package, Play, CheckCircle2, AlertCircle } from "lucide-react";
import api from "../../api/axios";
import { useSocket } from "../../hooks/useSocket";

interface PackingQueueProps {
  onNavigate: (screen: string) => void;
  onBack: () => void;
}

export function PackingQueue({ onNavigate, onBack }: PackingQueueProps) {
  const [packingOrders, setPackingOrders] = useState<any[]>([]);
  const socket = useSocket(1);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders');
      // Filter for packing statuses
      const orders = res.data.filter((o: any) => o.status === 'packing');
      
      const processedOrders = orders.map((o: any) => ({
        ...o,
        items: 10, // Mock item count
        tray: o.tray_number || "P03",
        urgent: o.sla_minutes <= 15
      }));
      setPackingOrders(processedOrders);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchOrders();
    if (socket.current) {
      socket.current.on('order:status', fetchOrders);
    }
    return () => {
      if (socket.current) socket.current.off('order:status');
    };
  }, [socket.current]);

  const stats = {
    awaiting: packingOrders.length,
    urgent: packingOrders.filter(o => o.urgent).length
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F7FA]">
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #EF5A06 0%, #D84315 100%)" }} className="px-4 pt-12 pb-4">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
            <ArrowLeft size={20} color="white" />
          </button>
          <div className="flex-1">
            <h1 className="text-white" style={{ fontWeight: 700, fontSize: "18px" }}>Packing Queue</h1>
            <p className="text-white/70" style={{ fontSize: "12px" }}>{packingOrders.length} orders ready to pack</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-4">
          {[
            { label: "Awaiting", value: stats.awaiting, color: "white" },
            { label: "Urgent", value: stats.urgent, color: "#FFF3E0" },
            { label: "Avg SLA", value: "13m", color: "#E8F5E9" },
          ].map(s => (
            <div key={s.label} className="bg-white/10 rounded-xl p-2 text-center">
              <p style={{ color: s.color, fontWeight: 700, fontSize: "18px" }}>{s.value}</p>
              <p className="text-white/70" style={{ fontSize: "10px" }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Packing Tray Overview */}
      <div className="px-4 mt-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="text-gray-700 mb-3" style={{ fontWeight: 600, fontSize: "13px" }}>Packing Trays</h3>
          <div className="grid grid-cols-5 gap-2">
            {["P01", "P03", "P05", "P07", "P09"].map((tray, i) => (
              <div key={tray} className="flex flex-col items-center">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-1"
                  style={{ backgroundColor: i < 2 ? "#FFF3E0" : "#E8F5E9" }}
                >
                  <Package size={20} color={i < 2 ? "#EF5A06" : "#00891D"} />
                </div>
                <span style={{ fontSize: "10px", fontWeight: 700, color: i < 2 ? "#EF5A06" : "#00891D" }}>{tray}</span>
                <span style={{ fontSize: "9px", color: "#9E9E9E" }}>{i < 2 ? "Active" : "Free"}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Orders */}
      <div className="flex flex-col gap-3 p-4">
        {packingOrders.map((order) => (
          <div key={order.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {order.urgent && (
              <div className="bg-orange-50 border-b border-orange-100 px-4 py-1.5 flex items-center gap-1.5">
                <AlertCircle size={12} color="#EF5A06" />
                <span style={{ color: "#EF5A06", fontWeight: 600, fontSize: "11px" }}>URGENT — SLA Critical!</span>
              </div>
            )}
            <div className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-gray-900" style={{ fontWeight: 700, fontSize: "15px" }}>{order.order_number}</span>
                    <span className="rounded-full px-2 py-0.5" style={{ fontSize: "10px", fontWeight: 600, backgroundColor: "#FFF3E0", color: "#EF5A06" }}>
                      Tray {order.tray}
                    </span>
                  </div>
                  <span className="text-gray-500" style={{ fontSize: "12px" }}>{order.order_type}</span>
                </div>
                <div className="flex items-center gap-1 rounded-full px-2.5 py-1" style={{ backgroundColor: order.sla_minutes <= 10 ? "#FFEBEE" : "#FFF3E0" }}>
                  <Clock size={11} color={order.sla_minutes <= 10 ? "#D32F2F" : "#EF5A06"} />
                  <span style={{ color: order.sla_minutes <= 10 ? "#D32F2F" : "#EF5A06", fontWeight: 700, fontSize: "11px" }}>{order.sla_minutes}m</span>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-2.5 mb-3">
                <Package size={14} color="#EF5A06" />
                <span className="text-gray-600" style={{ fontSize: "12px" }}>{order.items} items to pack</span>
                <span className="ml-auto text-gray-400" style={{ fontSize: "11px" }}>Tray: {order.tray}</span>
              </div>

              <button
                onClick={() => onNavigate("packing-screen", order)}
                className="w-full flex items-center justify-center gap-2 rounded-xl py-3"
                style={{ backgroundColor: "#EF5A06" }}
              >
                <Play size={16} color="white" />
                <span className="text-white" style={{ fontWeight: 600, fontSize: "14px" }}>Start Packing</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
