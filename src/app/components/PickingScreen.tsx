import { useState, useEffect } from "react";
import { ArrowLeft, MapPin, CheckCircle, Scan, ChevronRight, Package, Loader2 } from "lucide-react";
import api from "../../api/axios";

interface PickingScreenProps {
  onNavigate: (screen: string, data?: any) => void;
  onBack: () => void;
  order?: any;
}

function LocationBadge({ location }: { location: string }) {
  if (!location) return null;
  const parts = location.split("-");
  return (
    <div className="flex items-center gap-2">
      {parts.map((part, i) => (
        <span key={i} className="bg-red-100 text-red-700 rounded px-3 py-1.5 shadow-sm" style={{ fontWeight: 800, fontSize: "18px", fontFamily: "monospace", letterSpacing: "1px" }}>
          {part}
        </span>
      ))}
    </div>
  );
}

export function PickingScreen({ onNavigate, onBack, order }: PickingScreenProps) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!order?.id) return;
    api.get(`/orders/${order.id}`).then(async res => {
      setItems(res.data.items || []);
      
      // If the order is still "accepted", mark it as "picking" to trigger picking_started_at
      if (res.data.status === 'accepted') {
        try {
          await api.put(`/orders/${order.id}/status`, { status: 'picking' });
        } catch (e) {
          console.error('Failed to update status to picking', e);
        }
      }
      
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [order?.id]);

  const handlePick = async (itemId: number) => {
    try {
      await api.put(`/orders/${order.id}/items/${itemId}/pick`);
      const newItems = items.map(item => 
        item.id === itemId ? { ...item, is_picked: true, picked_qty: item.quantity } : item
      );
      setItems(newItems);
      
      const allPicked = newItems.every(i => i.is_picked);
      if (allPicked) {
        setTimeout(async () => {
          try {
            const updatedOrderRes = await api.get(`/orders/${order.id}`);
            onNavigate("picking-complete", updatedOrderRes.data);
          } catch (e) {
            // fallback
            onNavigate("picking-complete", { ...order, picking_completed_at: new Date().toISOString() });
          }
        }, 300);
      }
    } catch(err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#F5F7FA] items-center justify-center">
        <Loader2 className="animate-spin text-[#00891D]" size={40} />
      </div>
    );
  }

  const pickedItems = items.filter(i => i.is_picked);
  const totalPicked = pickedItems.length;
  const currentIdx = items.findIndex(item => !item.is_picked);
  const currentItem = currentIdx >= 0 ? items[currentIdx] : null;

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F7FA]">
      <div style={{ background: "linear-gradient(135deg, #00891D 0%, #006614 100%)" }} className="px-4 pt-12 pb-4">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={onBack} className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
            <ArrowLeft size={20} color="white" />
          </button>
          <div className="flex-1">
            <h1 className="text-white" style={{ fontWeight: 700, fontSize: "18px" }}>Picking — #{order?.order_number}</h1>
            <p className="text-white/70" style={{ fontSize: "12px" }}>{order?.order_type} · SLA: {order?.sla_minutes}m</p>
          </div>
        </div>

        <div className="bg-white/10 rounded-2xl p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white" style={{ fontWeight: 600, fontSize: "14px" }}>{totalPicked} of {items.length} Picked</span>
            <span className="text-white/70" style={{ fontSize: "12px" }}>{items.length ? Math.round((totalPicked / items.length) * 100) : 0}%</span>
          </div>
          <div className="h-2.5 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${items.length ? (totalPicked / items.length) * 100 : 0}%`, backgroundColor: "#4CAF50" }}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 p-4">
        {currentItem && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden border-2 border-green-300">
            <div className="bg-green-600 px-4 py-2 flex items-center gap-2">
              <span className="text-white" style={{ fontWeight: 600, fontSize: "12px" }}>CURRENT ITEM — Pick this next</span>
            </div>
            <div className="p-4">
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 rounded-2xl bg-gray-50 flex items-center justify-center overflow-hidden">
                  {currentItem.image_url ? (
                    <img src={currentItem.image_url} alt={currentItem.name} className="w-full h-full object-cover" />
                  ) : (
                    <span style={{ fontSize: "40px" }}>📦</span>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-gray-900 mb-1" style={{ fontWeight: 700, fontSize: "16px" }}>{currentItem.name}</p>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Package size={13} color="#00891D" />
                    <span className="text-green-700" style={{ fontWeight: 600, fontSize: "13px" }}>Qty: {currentItem.quantity}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin size={13} color="#9E9E9E" />
                    <LocationBadge location={currentItem.aisle_location} />
                  </div>
                </div>
              </div>

              <div className="mt-3 bg-gray-50 rounded-xl p-2.5 flex items-center justify-between">
                <span className="text-gray-400" style={{ fontSize: "11px", fontFamily: "monospace" }}>Barcode: {currentItem.barcode}</span>
                <button
                  onClick={() => onNavigate("barcode-verification", { ...order, currentItem })}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5"
                  style={{ backgroundColor: "#00891D" }}
                >
                  <Scan size={13} color="white" />
                  <span className="text-white" style={{ fontWeight: 600, fontSize: "12px" }}>Scan</span>
                </button>
              </div>

              <div className="flex gap-3 mt-3">
                <button
                  onClick={() => onNavigate("barcode-verification", { ...order, currentItem })}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl py-3 border-2 border-green-200"
                >
                  <Scan size={16} color="#00891D" />
                  <span style={{ color: "#00891D", fontWeight: 600, fontSize: "14px" }}>Verify</span>
                </button>
                <button
                  onClick={() => handlePick(currentItem.id)}
                  className="flex-[2] flex items-center justify-center gap-2 rounded-xl py-3"
                  style={{ backgroundColor: "#00891D" }}
                >
                  <CheckCircle size={16} color="white" />
                  <span className="text-white" style={{ fontWeight: 600, fontSize: "14px" }}>
                    Mark Picked <ChevronRight size={14} className="inline" />
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm p-4">
          <h3 className="text-gray-700 mb-3" style={{ fontWeight: 600, fontSize: "13px" }}>All Items</h3>
          <div className="flex flex-col gap-2">
            {items.map((item) => {
              const isPicked = item.is_picked;
              const isCurrent = item.id === currentItem?.id;
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-3 py-2.5 px-3 rounded-xl"
                  style={{ backgroundColor: isPicked ? "#E8F5E9" : isCurrent ? "#EDE7F6" : "#F9F9F9" }}
                >
                  <div className="w-10 h-10 rounded bg-white flex items-center justify-center text-xl overflow-hidden shadow-sm">
                    {item.image_url ? <img src={item.image_url} alt="" /> : '📦'}
                  </div>
                  <div className="flex-1">
                    <p style={{ fontWeight: 600, fontSize: "14px", color: isPicked ? "#2E7D32" : "#212121" }}>{item.name}</p>
                    <p style={{ fontSize: "13px", color: "#757575", fontWeight: 500, marginTop: "2px" }}>Qty: {item.quantity} · Location: <span style={{color: "#D32F2F", fontWeight: 700}}>{item.aisle_location}</span></p>
                  </div>
                  {isPicked ? (
                    <CheckCircle size={18} color="#2E7D32" />
                  ) : isCurrent ? (
                    <div className="w-5 h-5 rounded-full border-2 border-green-500 flex items-center justify-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
