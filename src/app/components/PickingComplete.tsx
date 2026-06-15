import { CheckCircle, Package, ArrowRight, Clock } from "lucide-react";

interface PickingCompleteProps {
  onNavigate: (screen: string) => void;
  data?: any;
}

export function PickingComplete({ onNavigate, data }: PickingCompleteProps) {
  const order = data || {};
  return (
    <div className="flex flex-col min-h-screen bg-[#F5F7FA] items-center justify-center px-4">
      {/* Success Animation Circle */}
      <div className="relative mb-8">
        <div className="w-32 h-32 rounded-full flex items-center justify-center" style={{ backgroundColor: "#E8F5E9" }}>
          <div className="w-24 h-24 rounded-full flex items-center justify-center" style={{ backgroundColor: "#C8E6C9" }}>
            <CheckCircle size={56} color="#2E7D32" strokeWidth={2} />
          </div>
        </div>
        {/* Ripple rings */}
        <div className="absolute inset-0 rounded-full border-4 border-green-200 animate-ping opacity-30" />
      </div>

      <h1 className="text-gray-900 mb-2 text-center" style={{ fontWeight: 700, fontSize: "24px" }}>Picking Complete!</h1>
      <p className="text-gray-500 mb-8 text-center" style={{ fontSize: "14px" }}>All items picked successfully for order #{order.order_number || "QC100245"}</p>

      {/* Stats Cards */}
      <div className="w-full max-w-sm grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center mx-auto mb-2">
            <Package size={20} color="#00891D" />
          </div>
          <p className="text-gray-900" style={{ fontWeight: 700, fontSize: "22px" }}>{order.item_count || 12}</p>
          <p className="text-gray-500" style={{ fontSize: "11px" }}>Total Items</p>
        </div>
        <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center mx-auto mb-2">
            <CheckCircle size={20} color="#2E7D32" />
          </div>
          <p className="text-green-700" style={{ fontWeight: 700, fontSize: "22px" }}>{order.item_count || 12}</p>
          <p className="text-gray-500" style={{ fontSize: "11px" }}>Picked</p>
        </div>
        <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center mx-auto mb-2">
            <Clock size={20} color="#EF5A06" />
          </div>
          <p className="text-orange-600" style={{ fontWeight: 700, fontSize: "22px" }}>
            {order.picking_started_at && order.picking_completed_at 
              ? Math.max(1, Math.round((new Date(order.picking_completed_at).getTime() - new Date(order.picking_started_at).getTime()) / 60000)) + "m"
              : "1m"}
          </p>
          <p className="text-gray-500" style={{ fontSize: "11px" }}>Time Taken</p>
        </div>
      </div>

      {/* Order Summary Card */}
      <div className="w-full max-w-sm bg-white rounded-2xl p-4 mb-6 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-gray-700" style={{ fontWeight: 600, fontSize: "14px" }}>Order Summary</h3>
          <span className="bg-green-100 text-green-700 rounded-full px-2 py-0.5" style={{ fontSize: "11px", fontWeight: 600 }}>All Picked</span>
        </div>
        {[
          { label: "Order Number", value: `#${order.order_number || "QC100245"}` },
          { label: "Order Type", value: order.order_type || "Quick Commerce" },
          { label: "Pick Start", value: order.picking_started_at ? new Date(order.picking_started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "10:34 AM" },
          { label: "Pick End", value: order.picking_completed_at ? new Date(order.picking_completed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "10:40 AM" },
          { label: "Accuracy", value: "100%" },
        ].map(row => (
          <div key={row.label} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
            <span className="text-gray-500" style={{ fontSize: "13px" }}>{row.label}</span>
            <span className="text-gray-800" style={{ fontWeight: 600, fontSize: "13px" }}>{row.value}</span>
          </div>
        ))}
      </div>

      {/* CTA Button */}
      <div className="w-full max-w-sm">
        <button
          onClick={() => onNavigate("packing-queue")}
          className="w-full flex items-center justify-center gap-3 rounded-2xl py-4 shadow-lg"
          style={{ backgroundColor: "#00891D" }}
        >
          <Package size={20} color="white" />
          <span className="text-white" style={{ fontWeight: 700, fontSize: "16px" }}>Move to Packing</span>
          <ArrowRight size={20} color="white" />
        </button>
        <button
          onClick={() => onNavigate("picking-queue")}
          className="w-full mt-3 flex items-center justify-center gap-2 rounded-2xl py-3 border border-gray-200"
        >
          <span className="text-gray-600" style={{ fontWeight: 500, fontSize: "14px" }}>Back to Picking Queue</span>
        </button>
      </div>
    </div>
  );
}
