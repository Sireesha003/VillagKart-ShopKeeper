import { useState, useEffect } from "react";
import { ArrowLeft, Clock, MapPin, CreditCard, Package, CheckCircle, XCircle, User, Phone, Zap, Loader2 } from "lucide-react";
import api from "../../api/axios";

interface OrderDetailsProps {
  onBack: () => void;
  onNavigate: (screen: string, data?: any) => void;
  order?: any;
}

export function OrderDetails({ onBack, onNavigate, order }: OrderDetailsProps) {
  const [fullOrder, setFullOrder] = useState<any>(order || {});
  const [loading, setLoading] = useState(!order?.items);

  // Log fetched order for debugging
  useEffect(() => {
    console.log('Fetched full order:', fullOrder);
  }, [fullOrder]);

  useEffect(() => {
    if (order?.id) {
      api.get(`/orders/${order.id}`).then(res => {
        setFullOrder(res.data);
        setLoading(false);
      }).catch(err => {
        console.error(err);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [order?.id]);

  const handleAccept = async () => {
    if (!fullOrder?.id) return;
    try {
      await api.put(`/orders/${fullOrder.id}/accept`);
      onNavigate("picking-queue");
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async () => {
    if (!fullOrder?.id) return;
    try {
      await api.put(`/orders/${fullOrder.id}/reject`);
      onBack();
    } catch (err) {
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

  const isUrgent = fullOrder.sla_minutes <= 15;
  const mergedItems = fullOrder?.items ?? order?.items ?? [];

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F7FA]">
      <div style={{ background: "linear-gradient(135deg, #00891D 0%, #006614 100%)" }} className="px-4 pt-12 pb-4">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={onBack} className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
            <ArrowLeft size={20} color="white" />
          </button>
          <div className="flex-1">
            <h1 className="text-white" style={{ fontWeight: 700, fontSize: "18px" }}>Order #{fullOrder.order_number}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <Zap size={12} color="white" opacity={0.7} />
              <span className="text-white/70" style={{ fontSize: "12px" }}>{fullOrder.order_type}</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 rounded-full px-3 py-1.5" style={{ backgroundColor: isUrgent ? "#FFCDD2" : "#C8E6C9" }}>
            <Clock size={12} color={isUrgent ? "#D32F2F" : "#2E7D32"} />
            <span style={{ color: isUrgent ? "#D32F2F" : "#2E7D32", fontWeight: 700, fontSize: "12px" }}>{fullOrder.sla_minutes}m SLA</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 p-4 pb-32">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="text-gray-700 mb-3" style={{ fontWeight: 600, fontSize: "13px" }}>Customer Information</h3>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <User size={22} color="#00891D" />
            </div>
            <div>
              <p className="text-gray-900" style={{ fontWeight: 600, fontSize: "15px" }}>{fullOrder.customer_name}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Phone size={11} color="#9E9E9E" />
                <span className="text-gray-500" style={{ fontSize: "12px" }}>{fullOrder.customer_phone}</span>
              </div>
            </div>
          </div>
          <div className="flex items-start gap-2 bg-gray-50 rounded-xl p-2.5">
            <MapPin size={14} color="#00891D" className="mt-0.5 flex-shrink-0" />
            <span className="text-gray-600" style={{ fontSize: "12px" }}>{fullOrder.customer_address || "No address provided"}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-gray-700" style={{ fontWeight: 600, fontSize: "13px" }}>Order Summary</h3>
                        <span className="text-gray-500" style={{ fontSize: "12px" }}>{mergedItems.length} items</span>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div className="bg-green-50 rounded-xl p-2.5 text-center">
                              <p className="text-green-700" style={{ fontWeight: 700, fontSize: "16px" }}>{mergedItems.length}</p>
              <p className="text-green-500" style={{ fontSize: "10px" }}>Items</p>
            </div>
            <div className="bg-green-50 rounded-xl p-2.5 text-center">
              <p className="text-green-700" style={{ fontWeight: 700, fontSize: "14px" }}>₹{fullOrder.total_value}</p>
              <p className="text-green-500" style={{ fontSize: "10px" }}>Total Value</p>
            </div>
            <div className="bg-orange-50 rounded-xl p-2.5 text-center">
              <p className="text-orange-700" style={{ fontWeight: 700, fontSize: "16px" }}>{fullOrder.sla_minutes}m</p>
              <p className="text-orange-500" style={{ fontSize: "10px" }}>SLA Time</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-2.5">
            <CreditCard size={14} color="#9E9E9E" />
            <span className="text-gray-600" style={{ fontSize: "12px" }}>Payment: {fullOrder.payment_method}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Package size={16} color="#00891D" />
            <h3 className="text-gray-700" style={{ fontWeight: 600, fontSize: "13px" }}>Item List ({mergedItems.length})</h3>
          </div>
          <div className="flex flex-col gap-2">
                        {mergedItems.length === 0 ? (
              <p className="text-gray-500" style={{ fontSize: "12px" }}>No items found for this order.</p>
            ) : (
                              mergedItems.map((item: any) => (
                <div key={item.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                  <div className="w-10 h-10 rounded bg-white flex items-center justify-center text-xl overflow-hidden shadow-sm">
                    {item.image_url ? <img src={item.image_url} alt="" /> : '📦'}
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-800" style={{ fontWeight: 600, fontSize: "14px" }}>{item.name || item.product?.name}</p>
                    <p className="text-gray-500" style={{ fontSize: "13px", fontWeight: 500, marginTop: "2px" }}>Qty: {item.quantity} · Location: <span style={{color: "#D32F2F", fontWeight: 700}}>{(item.aisle_location || item.product?.aisle_location) ?? ''}</span></p>
                  </div>
                  <span className="text-gray-700" style={{ fontWeight: 600, fontSize: "13px" }}>₹{item.price ?? item.product?.price}</span>
                </div>
              ))
            )}
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
            <span className="text-gray-500" style={{ fontSize: "13px" }}>Total</span>
            <span className="text-gray-900" style={{ fontWeight: 700, fontSize: "16px" }}>₹{fullOrder.total_value}</span>
          </div>
        </div>
      </div>

      {fullOrder.status === 'new' && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 flex gap-3">
          <button
            onClick={handleReject}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl py-3.5 border border-red-200 bg-red-50"
          >
            <XCircle size={18} color="#D32F2F" />
            <span style={{ color: "#D32F2F", fontWeight: 600, fontSize: "15px" }}>Reject</span>
          </button>
          <button
            onClick={handleAccept}
            className="flex-[2] flex items-center justify-center gap-2 rounded-xl py-3.5"
            style={{ backgroundColor: "#00891D" }}
          >
            <CheckCircle size={18} color="white" />
            <span className="text-white" style={{ fontWeight: 600, fontSize: "15px" }}>Accept Order</span>
          </button>
        </div>
      )}
    </div>
  );
}
