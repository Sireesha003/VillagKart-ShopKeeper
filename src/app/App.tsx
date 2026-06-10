import { useState, useEffect } from "react";
import { LayoutDashboard, ShoppingBag, Package, PackageCheck, User } from "lucide-react";
import { Dashboard } from "./components/Dashboard";
import { NewOrders } from "./components/NewOrders";
import { OrderDetails } from "./components/OrderDetails";
import { PickingQueue } from "./components/PickingQueue";
import { PickingScreen } from "./components/PickingScreen";
import { BarcodeVerification } from "./components/BarcodeVerification";
import { PickingComplete } from "./components/PickingComplete";
import { PackingQueue } from "./components/PackingQueue";
import { PackingScreen } from "./components/PackingScreen";
import { ReadyOrders } from "./components/ReadyOrders";
import { HandoverVerification } from "./components/HandoverVerification";
import { SelfPickup } from "./components/SelfPickup";
import { Returns } from "./components/Returns";
import { SLAMonitoring } from "./components/SLAMonitoring";

type Screen =
  | "dashboard"
  | "new-orders"
  | "order-details"
  | "picking-queue"
  | "picking-screen"
  | "barcode-verification"
  | "picking-complete"
  | "packing-queue"
  | "packing-screen"
  | "ready-orders"
  | "handover-verification"
  | "self-pickup"
  | "returns"
  | "sla-monitoring"
  | "profile";

const navItems = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "new-orders", label: "Orders", icon: ShoppingBag },
  { key: "picking-queue", label: "Picking", icon: Package },
  { key: "packing-queue", label: "Packing", icon: PackageCheck },
  { key: "profile", label: "Profile", icon: User },
];

const screensWithoutNav: Screen[] = [
  "order-details",
  "picking-screen",
  "barcode-verification",
  "picking-complete",
  "packing-screen",
  "handover-verification",
  "self-pickup",
  "returns",
  "sla-monitoring",
];

function ProfileScreen({ onNavigate }: { onNavigate: (screen: string) => void }) {
  const profileSections = [
    {
      title: "Store Operations",
      items: [
        { label: "Self Pickup Orders", icon: "🏪", screen: "self-pickup" },
        { label: "Returns Management", icon: "↩️", screen: "returns" },
        { label: "SLA Monitoring", icon: "📊", screen: "sla-monitoring" },
      ],
    },
    {
      title: "Store Info",
      items: [
        { label: "Hyderabad Store 01", icon: "🏬", desc: "Store Manager: Rohit Singh" },
        { label: "Operating Hours", icon: "🕐", desc: "6:00 AM – 11:00 PM" },
        { label: "Store Performance", icon: "⭐", desc: "4.8 / 5.0 Rating" },
      ],
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F7FA]">
      <div style={{ background: "linear-gradient(135deg, #00891D 0%, #006614 100%)" }} className="px-4 pt-14 pb-8 flex flex-col items-center">
        <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mb-3">
          <span className="text-white" style={{ fontWeight: 700, fontSize: "28px" }}>RS</span>
        </div>
        <h1 className="text-white" style={{ fontWeight: 700, fontSize: "20px" }}>Rohit Singh</h1>
        <p className="text-white/70" style={{ fontSize: "13px" }}>Store Manager · Hyderabad Store 01</p>
        <div className="flex gap-3 mt-3">
          {[
            { label: "Orders", value: "67" },
            { label: "Completed", value: "57" },
            { label: "SLA %", value: "85%" },
          ].map(s => (
            <div key={s.label} className="bg-white/10 rounded-xl px-4 py-2 text-center">
              <p className="text-white" style={{ fontWeight: 700, fontSize: "16px" }}>{s.value}</p>
              <p className="text-white/60" style={{ fontSize: "10px" }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4 p-4 max-w-3xl mx-auto w-full">
        {profileSections.map((section) => (
          <div key={section.title} className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100">
              <span className="text-gray-500" style={{ fontWeight: 600, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                {section.title}
              </span>
            </div>
            {section.items.map((item) => (
              <button
                key={item.label}
                onClick={() => "screen" in item ? onNavigate((item as { screen: string }).screen) : undefined}
                className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-gray-50 last:border-0 text-left hover:bg-gray-50 transition-colors"
              >
                <span style={{ fontSize: "20px" }}>{item.icon}</span>
                <div className="flex-1">
                  <p className="text-gray-800" style={{ fontWeight: 500, fontSize: "13px" }}>{item.label}</p>
                  {"desc" in item && <p className="text-gray-400" style={{ fontSize: "11px" }}>{(item as { desc: string }).desc}</p>}
                </div>
                {"screen" in item && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#BDBDBD" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        ))}
        <button className="bg-white rounded-2xl shadow-sm p-4 flex items-center justify-center gap-2 border border-red-100 hover:bg-red-50 transition-colors">
          <span style={{ color: "#D32F2F", fontWeight: 600, fontSize: "14px" }}>Sign Out</span>
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("dashboard");
  const [orderData, setOrderData] = useState<unknown>(null);
  const [history, setHistory] = useState<Screen[]>([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const navigate = (dest: string, data?: unknown) => {
    setHistory(prev => [...prev, screen]);
    setScreen(dest as Screen);
    if (data !== undefined) setOrderData(data);
  };

  const goBack = () => {
    const prev = history[history.length - 1];
    if (prev) {
      setHistory(h => h.slice(0, -1));
      setScreen(prev);
    } else {
      setScreen("dashboard");
    }
  };

  const navNavigate = (dest: string) => {
    setHistory([]);
    setScreen(dest as Screen);
  };

  const showNav = !screensWithoutNav.includes(screen) || !isMobile;

  const activeNavKey = (() => {
    if (screen === "dashboard") return "dashboard";
    if (screen === "new-orders" || screen === "order-details") return "new-orders";
    if (["picking-queue", "picking-screen", "barcode-verification", "picking-complete"].includes(screen)) return "picking-queue";
    if (["packing-queue", "packing-screen"].includes(screen)) return "packing-queue";
    if (screen === "profile") return "profile";
    return "";
  })();

  const renderScreen = () => {
    return (
      <>
        {screen === "dashboard" && <Dashboard onNavigate={navigate} />}
        {screen === "new-orders" && <NewOrders onNavigate={navigate} onBack={goBack} />}
        {screen === "order-details" && <OrderDetails onBack={goBack} onNavigate={navigate} order={orderData as any} />}
        {screen === "picking-queue" && <PickingQueue onNavigate={navigate} onBack={goBack} />}
        {screen === "picking-screen" && <PickingScreen onNavigate={navigate} onBack={goBack} order={orderData as any} />}
        {screen === "barcode-verification" && <BarcodeVerification onBack={goBack} onNavigate={navigate} />}
        {screen === "picking-complete" && <PickingComplete onNavigate={navigate} />}
        {screen === "packing-queue" && <PackingQueue onNavigate={navigate} onBack={goBack} />}
        {screen === "packing-screen" && <PackingScreen onNavigate={navigate} onBack={goBack} order={orderData as any} />}
        {screen === "ready-orders" && <ReadyOrders onNavigate={navigate} onBack={goBack} />}
        {screen === "handover-verification" && <HandoverVerification onBack={goBack} onNavigate={navigate} />}
        {screen === "self-pickup" && <SelfPickup onBack={goBack} />}
        {screen === "returns" && <Returns onBack={goBack} />}
        {screen === "sla-monitoring" && <SLAMonitoring onBack={goBack} />}
        {screen === "profile" && <ProfileScreen onNavigate={navigate} />}
      </>
    );
  };

  if (!isMobile) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex" style={{ fontFamily: "'Roboto', system-ui, sans-serif" }}>
        {/* Desktop Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col flex-shrink-0 shadow-sm sticky top-0 h-screen">
          <div className="p-6 border-b border-gray-100 flex flex-col items-center">
            <div className="w-12 h-12 rounded-xl bg-[#00891D] flex items-center justify-center mb-3">
              <span className="text-white font-bold text-xl">VK</span>
            </div>
            <h2 className="font-bold text-gray-800 text-lg">VillagKart</h2>
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mt-1">Shopkeeper</p>
          </div>
          
          <div className="flex-1 py-6 flex flex-col gap-2 px-4">
            {navItems.map((item) => {
              const isActive = activeNavKey === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => navNavigate(item.key)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive ? "bg-[#E8F5E9] text-[#00891D]" : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} color={isActive ? "#00891D" : "#9E9E9E"} />
                  <span className={`text-sm ${isActive ? "font-bold" : "font-medium"}`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
          
          <div className="p-4 border-t border-gray-100">
             <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl">
               <div className="w-10 h-10 rounded-full bg-[#00891D] flex items-center justify-center text-white font-bold">
                 RS
               </div>
               <div className="flex-1 overflow-hidden">
                 <p className="text-sm font-bold text-gray-800 truncate">Rohit Singh</p>
                 <p className="text-xs text-gray-500 truncate">Hyderabad Store</p>
               </div>
             </div>
          </div>
        </div>

        {/* Main Desktop Content */}
        <div className="flex-1 overflow-y-auto w-full h-screen">
          <div className="max-w-6xl mx-auto w-full h-full relative">
            {renderScreen()}
          </div>
        </div>
      </div>
    );
  }

  // Mobile Layout
  return (
    <div className="min-h-screen bg-gray-200 flex items-center justify-center p-4" style={{ fontFamily: "'Roboto', system-ui, sans-serif" }}>
      {/* Mobile Device Frame */}
      <div
        className="relative bg-white overflow-hidden"
        style={{
          width: "390px",
          height: "844px",
          borderRadius: "44px",
          border: "10px solid #1a1a1a",
          boxShadow: "0 0 0 2px #444, 0 40px 80px rgba(0,0,0,0.35), inset 0 0 0 1px #555",
          flexShrink: 0,
        }}
      >
        {/* Status Bar */}
        <div className="absolute top-0 left-0 right-0 z-50 h-10 flex items-center px-7">
          <span className="text-xs font-bold drop-shadow" style={{ color: "white", mixBlendMode: "difference" }}>9:41</span>
          <div className="flex-1 flex justify-center">
            <div className="w-24 h-5 bg-black rounded-full" />
          </div>
          <div className="flex items-center gap-1.5">
            <div className="flex gap-0.5 items-end h-3.5">
              {[1, 2, 3, 4].map(b => (
                <div key={b} className="w-1 rounded-sm" style={{ height: `${b * 3 + 2}px`, backgroundColor: "white", opacity: b <= 3 ? 0.9 : 0.4 }} />
              ))}
            </div>
            <div className="w-6 h-3 rounded-sm border border-white/80 p-0.5 flex items-center">
              <div className="h-full rounded-sm bg-green-400" style={{ width: "70%" }} />
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div
          className="absolute inset-0 overflow-y-auto"
          style={{ paddingBottom: showNav ? "72px" : "0px", scrollbarWidth: "none" }}
        >
          {renderScreen()}
        </div>

        {/* Bottom Navigation Bar */}
        {showNav && (
          <div
            className="absolute bottom-0 left-0 right-0 bg-white"
            style={{
              height: "72px",
              borderTop: "1px solid rgba(0,0,0,0.08)",
              display: "flex",
              alignItems: "center",
            }}
          >
            {navItems.map((item) => {
              const isActive = activeNavKey === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => navNavigate(item.key)}
                  className="flex-1 flex flex-col items-center justify-center gap-1 py-1 relative"
                >
                  {isActive && (
                    <div
                      className="absolute top-0 left-1/2 -translate-x-1/2 rounded-full"
                      style={{ width: "40px", height: "3px", backgroundColor: "#00891D" }}
                    />
                  )}
                  <div
                    className="flex items-center justify-center rounded-full transition-all"
                    style={{
                      width: "40px",
                      height: "28px",
                      backgroundColor: isActive ? "#E8F5E9" : "transparent",
                    }}
                  >
                    <item.icon
                      size={20}
                      color={isActive ? "#00891D" : "#9E9E9E"}
                      strokeWidth={isActive ? 2.5 : 1.5}
                    />
                  </div>
                  <span style={{
                    fontSize: "10px",
                    fontWeight: isActive ? 700 : 400,
                    color: isActive ? "#00891D" : "#9E9E9E",
                    lineHeight: 1,
                  }}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Screen indicator below frame */}
      <div
        className="absolute bottom-6 text-gray-400 text-center hidden md:block"
        style={{ fontSize: "11px", letterSpacing: "0.5px" }}
      >
        SHOPKEEPER APP · {screen.replace(/-/g, " ").toUpperCase()}
      </div>
    </div>
  );
}
