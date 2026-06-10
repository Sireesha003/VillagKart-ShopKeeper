import { useState } from "react";
import { ArrowLeft, QrCode, CheckCircle, Scan, Bike } from "lucide-react";

interface HandoverVerificationProps {
  onBack: () => void;
  onNavigate: (screen: string) => void;
}

type Step = "staff-scan" | "rider-scan" | "complete";

export function HandoverVerification({ onBack, onNavigate }: HandoverVerificationProps) {
  const [step, setStep] = useState<Step>("staff-scan");

  const steps = [
    { key: "staff-scan", label: "Staff Verification", desc: "Staff scans the order QR" },
    { key: "rider-scan", label: "Rider Verification", desc: "Rider scans on their app" },
    { key: "complete", label: "Handover Complete", desc: "Dispatched successfully" },
  ];

  const currentStepIdx = steps.findIndex(s => s.key === step);

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F7FA]">
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)" }} className="px-4 pt-12 pb-4">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
            <ArrowLeft size={20} color="white" />
          </button>
          <div>
            <h1 className="text-white" style={{ fontWeight: 700, fontSize: "18px" }}>Handover Verification</h1>
            <p className="text-white/70" style={{ fontSize: "12px" }}>Order #QC100240 · Rider: Arjun Kumar</p>
          </div>
        </div>
      </div>

      {/* Stepper */}
      <div className="bg-white border-b border-gray-100 px-4 py-4">
        <div className="flex items-center">
          {steps.map((s, idx) => (
            <div key={s.key} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center mb-1"
                  style={{
                    backgroundColor: idx < currentStepIdx ? "#2E7D32" : idx === currentStepIdx ? "#00891D" : "#E0E0E0",
                  }}
                >
                  {idx < currentStepIdx ? (
                    <CheckCircle size={16} color="white" />
                  ) : (
                    <span className="text-white" style={{ fontWeight: 700, fontSize: "12px" }}>{idx + 1}</span>
                  )}
                </div>
                <span style={{ fontSize: "9px", fontWeight: 500, color: idx <= currentStepIdx ? "#212121" : "#9E9E9E", textAlign: "center", maxWidth: "60px" }}>
                  {s.label}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div className="flex-1 h-0.5 mx-1 mb-5" style={{ backgroundColor: idx < currentStepIdx ? "#2E7D32" : "#E0E0E0" }} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center px-4 py-8 gap-6">
        {/* QR Code Display */}
        {step !== "complete" && (
          <div className="bg-white rounded-3xl p-6 shadow-sm w-full flex flex-col items-center">
            <p className="text-gray-500 mb-4" style={{ fontSize: "12px" }}>ORDER QR CODE</p>
            {/* Simulated QR Code */}
            <div className="relative w-48 h-48 bg-white border-4 border-gray-900 rounded-2xl flex items-center justify-center mb-4">
              <div className="grid grid-cols-7 gap-0.5 p-2">
                {[...Array(49)].map((_, i) => (
                  <div
                    key={i}
                    className="w-4 h-4 rounded-sm"
                    style={{ backgroundColor: Math.random() > 0.5 ? "#1a1a1a" : "transparent" }}
                  />
                ))}
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <QrCode size={80} color="#1a1a1a" strokeWidth={1.5} />
              </div>
            </div>
            <p className="text-gray-800 mb-1" style={{ fontWeight: 700, fontSize: "16px" }}>QC100240</p>
            <p className="text-gray-500" style={{ fontSize: "11px", fontFamily: "monospace" }}>HS7K2-9PLM4-QXR82</p>
          </div>
        )}

        {/* Step Content */}
        {step === "staff-scan" && (
          <div className="w-full flex flex-col items-center gap-4">
            <div className="bg-green-50 rounded-2xl p-4 w-full text-center">
              <Scan size={32} color="#00891D" className="mx-auto mb-2" />
              <p className="text-green-800" style={{ fontWeight: 600, fontSize: "14px" }}>Staff QR Verification</p>
              <p className="text-green-600" style={{ fontSize: "12px" }}>Scan the order QR with staff scanner</p>
            </div>
            <button
              onClick={() => setStep("rider-scan")}
              className="w-full flex items-center justify-center gap-2 rounded-xl py-4"
              style={{ backgroundColor: "#00891D" }}
            >
              <CheckCircle size={18} color="white" />
              <span className="text-white" style={{ fontWeight: 600, fontSize: "15px" }}>Staff Verified ✓</span>
            </button>
          </div>
        )}

        {step === "rider-scan" && (
          <div className="w-full flex flex-col items-center gap-4">
            <div className="bg-orange-50 rounded-2xl p-4 w-full text-center">
              <Bike size={32} color="#EF5A06" className="mx-auto mb-2" />
              <p className="text-orange-800" style={{ fontWeight: 600, fontSize: "14px" }}>Rider Scan Verification</p>
              <p className="text-orange-600" style={{ fontSize: "12px" }}>Rider: Arjun Kumar scans from their device</p>
            </div>
            <button
              onClick={() => setStep("complete")}
              className="w-full flex items-center justify-center gap-2 rounded-xl py-4"
              style={{ backgroundColor: "#EF5A06" }}
            >
              <CheckCircle size={18} color="white" />
              <span className="text-white" style={{ fontWeight: 600, fontSize: "15px" }}>Rider Verified ✓</span>
            </button>
          </div>
        )}

        {step === "complete" && (
          <div className="w-full flex flex-col items-center gap-4">
            {/* Success */}
            <div className="relative">
              <div className="w-28 h-28 rounded-full flex items-center justify-center" style={{ backgroundColor: "#E8F5E9" }}>
                <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ backgroundColor: "#C8E6C9" }}>
                  <CheckCircle size={48} color="#2E7D32" />
                </div>
              </div>
              <div className="absolute inset-0 rounded-full border-4 border-green-200 animate-ping opacity-30" />
            </div>

            <div className="text-center">
              <h2 className="text-gray-900 mb-1" style={{ fontWeight: 700, fontSize: "22px" }}>Handover Complete!</h2>
              <p className="text-gray-500" style={{ fontSize: "14px" }}>Order dispatched to Arjun Kumar</p>
            </div>

            <div className="bg-white rounded-2xl p-4 w-full shadow-sm">
              {[
                { label: "Order", value: "#QC100240" },
                { label: "Rider", value: "Arjun Kumar" },
                { label: "Staff Verified", value: "10:48:22 AM" },
                { label: "Rider Verified", value: "10:48:45 AM" },
                { label: "Handover Time", value: "10:48:45 AM" },
                { label: "Status", value: "Dispatched ✓" },
              ].map(row => (
                <div key={row.label} className="flex justify-between py-1.5 border-b border-gray-50 last:border-0">
                  <span className="text-gray-500" style={{ fontSize: "13px" }}>{row.label}</span>
                  <span className="text-gray-800" style={{ fontWeight: 600, fontSize: "13px" }}>{row.value}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => onNavigate("ready-orders")}
              className="w-full flex items-center justify-center gap-2 rounded-xl py-4"
              style={{ backgroundColor: "#2E7D32" }}
            >
              <span className="text-white" style={{ fontWeight: 600, fontSize: "15px" }}>Back to Ready Orders</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
