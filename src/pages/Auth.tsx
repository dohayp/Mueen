import { useState } from "react";
import { auth } from "../lib/firebase";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useAuth } from "../App";
import { LogIn, ShieldCheck, Zap } from "lucide-react";
import { motion } from "motion/react";

export default function Auth() {
  const { language } = useAuth();
  const isAr = language === "ar";
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error(error);
      alert("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-8 px-4">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center space-y-4"
      >
        <div className="w-24 h-24 bg-emerald-600 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-xl shadow-emerald-100">
          <Zap size={48} className="text-white" fill="white" />
        </div>
        <h1 className="text-3xl font-black text-slate-800 tracking-tighter">معين اليمن</h1>
        <p className="text-sm text-slate-400 font-bold max-w-[240px] leading-relaxed mx-auto uppercase tracking-wider">
          {isAr 
            ? "المنصة الأولى في اليمن للخبراء الموثوقين" 
            : "Yemen's #1 Platform for Trusted Experts"}
        </p>
      </motion.div>

      <div className="w-full space-y-4">
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full bg-white border border-slate-200 text-slate-800 py-4 rounded-2xl font-black flex items-center justify-center gap-3 shadow-sm hover:border-emerald-600 transition-all active:scale-[0.98] disabled:opacity-50"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-slate-200 border-t-emerald-600 rounded-full animate-spin"></div>
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              {isAr ? "الدخول عبر جوجل" : "Sign in with Google"}
            </>
          )}
        </button>

        <div className="flex items-center gap-2 justify-center text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none">
           <ShieldCheck size={12} className="text-emerald-500" />
           <span>{isAr ? "دخول آمن وموثوق" : "Secure Verified Access"}</span>
        </div>
      </div>

      <div className="absolute bottom-10 left-0 right-0 px-8">
         <p className="text-[10px] text-center text-gray-400 leading-relaxed">
            {isAr 
              ? "من خلال المتابعة، أنت توافق على شروط الخدمة وسياسة الخصوصية الخاصة بمعين اليمن." 
              : "By continuing, you agree to Mueen Yemen's Terms of Service and Privacy Policy."}
         </p>
      </div>
    </div>
  );
}
