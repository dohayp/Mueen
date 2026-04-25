import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, ClipboardList, MessageSquare, User, ShieldCheck } from "lucide-react";
import { useAuth } from "../App";
import { motion } from "motion/react";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, profile, language, setLanguage } = useAuth();
  const location = useLocation();

  const isAr = language === "ar";

  const navItems = [
    { path: "/", icon: Home, label: isAr ? "الرئيسية" : "Home" },
    { path: "/dashboard", icon: ClipboardList, label: isAr ? "طلباتي" : "Jobs" },
    { path: "/chats", icon: MessageSquare, label: isAr ? "المحادثات" : "Chats" },
    { path: "/profile", icon: User, label: isAr ? "الحساب" : "Profile" },
  ];

  if (profile?.role === 'admin') {
    navItems.push({ path: "/admin", icon: ShieldCheck, label: isAr ? "الإدارة" : "Admin" });
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 flex justify-between items-center sticky top-0 z-50">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-bold shadow-md shadow-emerald-100">م</div>
          <span className="font-black text-xl tracking-tight text-slate-800">معين اليمن</span>
        </Link>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setLanguage(isAr ? "en" : "ar")}
            className="text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-500 px-3 py-1.5 rounded-lg transition-colors hover:bg-slate-200 border border-slate-200"
          >
            {isAr ? "English" : "عربي"}
          </button>
          {user && (
            <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden">
               <div className="w-full h-full bg-slate-300" />
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-24 md:max-w-xl md:mx-auto w-full px-4 pt-4">
        {children}
      </main>

      {/* Bottom Nav */}
      <nav className="bg-white border-t border-slate-200 fixed bottom-0 left-0 right-0 h-16 flex items-center justify-around px-2 z-50 md:max-w-xl md:mx-auto md:border-x md:rounded-t-2xl">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link 
              key={item.path} 
              to={item.path} 
              className={`flex flex-col items-center justify-center w-full h-full transition-all relative ${
                isActive ? "text-emerald-600" : "text-slate-400"
              }`}
            >
              <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] mt-1 font-bold">{item.label}</span>
              {isActive && (
                <motion.div 
                  layoutId="nav-bg"
                  className="absolute -top-1 w-8 h-1 bg-emerald-600 rounded-full"
                />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
