import { useState, useEffect } from "react";
import { ArrowLeft, QrCode, CheckCircle, MapPin, Package, Loader2 } from "lucide-react";
import api from "../../api/axios";

interface SelfPickupProps {
  onBack: () => void;
}

export function SelfPickup({ onBack }: SelfPickupProps) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifiedIds, setVerifiedIds] = useState<string[]>([]);
  const [activeOrder, setActiveOrder] = useState<string | null>(null);

  const fetchOrders = () => {
    api.get('/orders?status=ready').then(res => {
      setOrders(res.data.filter((o: any) => o.order_type === 'Self Pickup'));
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleVerify = (id: string) => {
    setVerifiedIds(prev => [...prev, id]);
    setActiveOrder(null);
  };

  const handleCollect = async (id: string) => {
    try {
      await api.put(`/orders/${id}/status`, { status: 'completed' });
      setOrders(prev => prev.filter(o => o.id !== id));
      setVerifiedIds(prev => prev.filter(vid => vid !== id));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#F5F7FA] items-center justify-center">
        <Loader2 className="animate-spin text-[#0277BD]" size={40} />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F7FA]">
      <div style={{ background: "linear-gradient(135deg, #0277BD 0%, #01579B 100%)" }} className="px-4 pt-12 pb-4">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
            <ArrowLeft size={20} color="white" />
          </button>
          <div className="flex-1">
            <h1 className="text-white" style={{ fontWeight: 700, fontSize: "18px" }}>Self Pickup</h1>
            <p className="text-white/70" style={{ fontSize: "12px" }}>{orders.length} orders awaiting pickup</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-4">
          {["C01", "C02", "C03"].map((counter, i) => (
            <div key={counter} className="bg-white/10 rounded-xl p-3 text-center">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mx-auto mb-1">
                <MapPin size={18} color="white" />
              </div>
              <p className="text-white" style={{ fontWeight: 700, fontSize: "14px" }}>{counter}</p>
              <p className="text-white/60" style={{ fontSize: "10px" }}>{i === 2 ? "Self-service" : "Staffed"}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3 p-4">
        {orders.map((order) => {
          const isVerified = verifiedIds.includes(order.id);
          const isActive = activeOrder === order.id;

          // Fake tokens for simulation since we don't store them yet
          const token = `T${order.order_number.slice(-4)}`;
          const counter = `C0${(parseInt(order.order_number.slice(-1)) % 3) + 1}`;

          return (
            <div key={order.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div
                className="px-4 py-2 flex items-center justify-between"
                style={{ backgroundColor: isVerified ? "#E8F5E9" : "#FFF8E1" }}
              >
                <div className="flex items-center gap-1.5">
                  {isVerified ? (
                    <CheckCircle size={14} color="#2E7D32" />
                  ) : (
                    <QrCode size={14} color="#F57F17" />
                  )}
                  <span style={{ color: isVerified ? "#2E7D32" : "#F57F17", fontWeight: 600, fontSize: "11px" }}>
                    {isVerified ? "QR Verified — Ready to Hand Over" : "Awaiting Customer QR Scan"}
                  </span>
                </div>
                <span className="text-gray-400" style={{ fontSize: "10px" }}>{order.elapsed_minutes} min ago</span>
              </div>

              <div className="p-4">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex-1 bg-blue-50 rounded-2xl p-3 text-center">
                    <p className="text-gray-500 mb-0.5" style={{ fontSize: "10px" }}>TOKEN</p>
                    <p className="text-blue-800" style={{ fontWeight: 900, fontSize: "28px", letterSpacing: "2px" }}>{token}</p>
                  </div>
                  <div className="flex-1 bg-green-50 rounded-2xl p-3 text-center">
                    <p className="text-gray-500 mb-0.5" style={{ fontSize: "10px" }}>COUNTER</p>
                    <p className="text-green-800" style={{ fontWeight: 900, fontSize: "28px" }}>{counter}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-green-700" style={{ fontWeight: 700, fontSize: "13px" }}>
                      {order.customer_name ? order.customer_name.split(" ").map((n: string) => n[0]).join("") : "U"}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-800" style={{ fontWeight: 600, fontSize: "13px" }}>{order.customer_name}</p>
                    <p className="text-gray-500" style={{ fontSize: "11px" }}>#{order.order_number} · ₹{order.total_value}</p>
                  </div>
                </div>

                {isActive && !isVerified && (
                  <div className="bg-gray-900 rounded-2xl p-4 mb-3 flex flex-col items-center">
                    <div className="relative w-32 h-32 flex items-center justify-center mb-2">
                      <QrCode size={80} color="white" strokeWidth={1} />
                      <div className="absolute inset-0 border-2 border-green-400 rounded-xl animate-pulse" />
                    </div>
                    <p className="text-white/70 text-center" style={{ fontSize: "11px" }}>Scan customer's pickup QR code</p>
                  </div>
                )}

                <div className="flex gap-2">
                  {!isVerified ? (
                    <>
                      <button
                        onClick={() => setActiveOrder(isActive ? null : order.id)}
                        className="flex-1 flex items-center justify-center gap-2 rounded-xl py-3 border border-green-200"
                      >
                        <QrCode size={15} color="#00891D" />
                        <span style={{ color: "#00891D", fontWeight: 600, fontSize: "13px" }}>{isActive ? "Cancel" : "Scan QR"}</span>
                      </button>
                      {isActive && (
                        <button
                          onClick={() => handleVerify(order.id)}
                          className="flex-[2] flex items-center justify-center gap-2 rounded-xl py-3"
                          style={{ backgroundColor: "#00891D" }}
                        >
                          <CheckCircle size={15} color="white" />
                          <span className="text-white" style={{ fontWeight: 600, fontSize: "13px" }}>Verify Customer</span>
                        </button>
                      )}
                    </>
                  ) : (
                    <button
                      onClick={() => handleCollect(order.id)}
                      className="w-full flex items-center justify-center gap-2 rounded-xl py-3"
                      style={{ backgroundColor: "#2E7D32" }}
                    >
                      <Package size={16} color="white" />
                      <span className="text-white" style={{ fontWeight: 600, fontSize: "14px" }}>Order Collected ✓</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {orders.length === 0 && (
          <div className="bg-white rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-sm mt-4">
            <CheckCircle size={48} color="#0277BD" className="mb-3" />
            <h3 className="text-gray-900 font-bold mb-1">All Caught Up!</h3>
            <p className="text-gray-500 text-sm">No self pickup orders waiting.</p>
          </div>
        )}
      </div>
    </div>
  );
}
