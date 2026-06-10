import { useState, useEffect } from "react";
import { ArrowLeft, CheckCircle, XCircle, AlertTriangle, RotateCcw, Loader2 } from "lucide-react";
import api from "../../api/axios";

interface ReturnsProps {
  onBack: () => void;
}

type ReturnStatus = "pending" | "approved" | "rejected";

const returnReasons = [
  { key: "damaged", label: "Damaged Product", icon: "💔", color: "#D32F2F", bg: "#FFEBEE" },
  { key: "wrong", label: "Wrong Item", icon: "❌", color: "#EF5A06", bg: "#FFF3E0" },
  { key: "expired", label: "Expired Product", icon: "⏰", color: "#F57F17", bg: "#FFFDE7" },
  { key: "missing", label: "Missing Item", icon: "📦", color: "#00891D", bg: "#F3E5F5" },
  { key: "quality", label: "Quality Issue", icon: "⚠️", color: "#0277BD", bg: "#E1F5FE" },
  { key: "Wrong Item Delivered", label: "Wrong Item", icon: "❌", color: "#EF5A06", bg: "#FFF3E0" },
  { key: "Damaged Product", label: "Damaged Product", icon: "💔", color: "#D32F2F", bg: "#FFEBEE" },
];

export function Returns({ onBack }: ReturnsProps) {
  const [returnRequests, setReturnRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<"all" | ReturnStatus>("all");

  const fetchReturns = () => {
    api.get('/returns').then(res => {
      setReturnRequests(res.data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchReturns();
  }, []);

  const approve = async (id: number) => {
    try {
      await api.put(`/returns/${id}/approve`);
      fetchReturns();
    } catch (err) {
      console.error(err);
    }
  };

  const reject = async (id: number) => {
    // Implementing reject API call (if backend supports, otherwise just update local state for now)
    try {
      // await api.put(`/returns/${id}/reject`); 
      // For now, since reject API isn't in backend yet, we'll optimistically update
      setReturnRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'rejected' } : r));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#F5F7FA] items-center justify-center">
        <Loader2 className="animate-spin text-[#6D4C41]" size={40} />
      </div>
    );
  }

  const filtered = returnRequests.filter(r =>
    activeFilter === "all" ? true : r.status === activeFilter
  );

  const counts = {
    pending: returnRequests.filter(r => r.status === "pending").length,
    approved: returnRequests.filter(r => r.status === "approved").length,
    rejected: returnRequests.filter(r => r.status === "rejected").length,
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F7FA]">
      <div style={{ background: "linear-gradient(135deg, #6D4C41 0%, #4E342E 100%)" }} className="px-4 pt-12 pb-4">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
            <ArrowLeft size={20} color="white" />
          </button>
          <div className="flex-1">
            <h1 className="text-white" style={{ fontWeight: 700, fontSize: "18px" }}>Returns Management</h1>
            <p className="text-white/70" style={{ fontSize: "12px" }}>{counts.pending} pending review</p>
          </div>
          {counts.pending > 0 && (
            <div className="bg-red-500 rounded-full px-2.5 py-1">
              <span className="text-white" style={{ fontWeight: 700, fontSize: "12px" }}>{counts.pending}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2 mt-4">
          {[
            { key: "pending", label: "Pending", value: counts.pending, color: "#FFC107" },
            { key: "approved", label: "Approved", value: counts.approved, color: "#4CAF50" },
            { key: "rejected", label: "Rejected", value: counts.rejected, color: "#FF5252" },
          ].map(s => (
            <div key={s.key} className="bg-white/10 rounded-xl p-2 text-center">
              <p style={{ color: s.color, fontWeight: 700, fontSize: "18px" }}>{s.value}</p>
              <p className="text-white/70" style={{ fontSize: "10px" }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 pt-4 pb-2">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {(["all", "pending", "approved", "rejected"] as const).map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className="rounded-full px-3 py-1.5 whitespace-nowrap flex-shrink-0"
              style={{
                backgroundColor: activeFilter === f ? "#6D4C41" : "white",
                color: activeFilter === f ? "white" : "#757575",
                fontWeight: activeFilter === f ? 600 : 400,
                fontSize: "12px",
                border: "1px solid",
                borderColor: activeFilter === f ? "#6D4C41" : "#E0E0E0",
              }}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)} {f !== "all" && `(${counts[f as ReturnStatus]})`}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3 p-4">
        {filtered.map((ret) => {
          const status = ret.status;
          const reasonInfo = returnReasons.find(r => r.key === ret.reason) || { label: ret.reason, icon: "⚠️", color: "#0277BD", bg: "#E1F5FE" };
          return (
            <div key={ret.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div
                className="px-4 py-1.5 flex items-center gap-1.5"
                style={{ backgroundColor: status === "approved" ? "#E8F5E9" : status === "rejected" ? "#FFEBEE" : "#FFF8E1" }}
              >
                {status === "approved" ? <CheckCircle size={12} color="#2E7D32" /> :
                  status === "rejected" ? <XCircle size={12} color="#D32F2F" /> :
                    <AlertTriangle size={12} color="#F57F17" />}
                <span style={{
                  color: status === "approved" ? "#2E7D32" : status === "rejected" ? "#D32F2F" : "#F57F17",
                  fontWeight: 600, fontSize: "11px"
                }}>
                  {status === "approved" ? "Return Approved" : status === "rejected" ? "Return Rejected" : "Pending Review"}
                </span>
              </div>

              <div className="p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center" style={{ fontSize: "32px" }}>
                    📦
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900 mb-0.5" style={{ fontWeight: 700, fontSize: "14px" }}>Order #{ret.order_number}</p>
                    <p className="text-gray-500" style={{ fontSize: "11px" }}>Refund: ₹{ret.refund_amount}</p>
                    <p className="text-gray-400" style={{ fontSize: "11px" }}>Customer: {ret.customer_name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 rounded-xl p-2.5 mb-3" style={{ backgroundColor: reasonInfo.bg }}>
                  <span style={{ fontSize: "16px" }}>{reasonInfo.icon}</span>
                  <div>
                    <p style={{ color: reasonInfo.color, fontWeight: 600, fontSize: "12px" }}>Return Reason</p>
                    <p style={{ color: reasonInfo.color, fontSize: "11px", opacity: 0.8 }}>{reasonInfo.label}</p>
                  </div>
                </div>

                {status === "pending" && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => reject(ret.id)}
                      className="flex-1 flex items-center justify-center gap-2 rounded-xl py-3 border border-red-200 bg-red-50"
                    >
                      <XCircle size={15} color="#D32F2F" />
                      <span style={{ color: "#D32F2F", fontWeight: 600, fontSize: "13px" }}>Reject</span>
                    </button>
                    <button
                      onClick={() => approve(ret.id)}
                      className="flex-[2] flex items-center justify-center gap-2 rounded-xl py-3"
                      style={{ backgroundColor: "#2E7D32" }}
                    >
                      <CheckCircle size={15} color="white" />
                      <span className="text-white" style={{ fontWeight: 600, fontSize: "13px" }}>Approve Return</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
