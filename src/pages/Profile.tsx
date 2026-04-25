import { useState } from "react";
import { useAuth } from "../App";
import { auth, db, handleFirestoreError, OperationType } from "../lib/firebase";
import { signOut } from "firebase/auth";
import { doc, updateDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { User, ShieldCheck, MapPin, Briefcase, Camera, LogOut, ChevronRight, CheckCircle } from "lucide-react";
import { YEMEN_CITIES, NEIGHBORHOODS } from "../constants";
import { motion } from "motion/react";

export default function Profile() {
  const { user, profile, language } = useAuth();
  const isAr = language === "ar";

  const [isEditing, setIsEditing] = useState(!profile);
  const [role, setRole] = useState(profile?.role || "client");
  const [fullName, setFullName] = useState(profile?.fullName || "");
  const [city, setCity] = useState(profile?.city || "Sanaa");
  const [neighborhood, setNeighborhood] = useState(profile?.neighborhood || "");
  
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    
    try {
      const data = {
        uid: user.uid,
        email: user.email,
        fullName,
        role,
        city,
        neighborhood,
        isVerified: profile?.isVerified || false,
        updatedAt: serverTimestamp(),
      };

      if (!profile) {
        // First time setup
        (data as any).createdAt = serverTimestamp();
        await setDoc(doc(db, "users", user.uid), data);
      } else {
        await updateDoc(doc(db, "users", user.uid), data);
      }
      setIsEditing(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
    } finally {
      setIsSaving(false);
    }
  };

  const neighborhoods = NEIGHBORHOODS[city] || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-black text-slate-800">
          {isAr ? "الملف الشخصي" : "Profile"}
        </h1>
        <button 
          onClick={() => signOut(auth)}
          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
        >
          <LogOut size={20} />
        </button>
      </div>

      {isEditing ? (
        <form onSubmit={handleSave} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
          <div className="flex flex-col items-center gap-2 mb-4">
            <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 border-2 border-dashed border-slate-200">
              <Camera size={24} />
            </div>
            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{isAr ? "تغيير الصورة" : "Change Photo"}</p>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{isAr ? "نوع الحساب" : "Account Type"}</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('client')}
                className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 font-black ${role === 'client' ? 'border-emerald-600 bg-emerald-50 text-emerald-600' : 'border-slate-100 text-slate-400'}`}
              >
                <User size={20} />
                <span className="text-[10px] uppercase tracking-wider">{isAr ? "عميل" : "Client"}</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('provider')}
                className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 font-black ${role === 'provider' ? 'border-emerald-600 bg-emerald-50 text-emerald-600' : 'border-slate-100 text-slate-400'}`}
              >
                <Briefcase size={20} />
                <span className="text-[10px] uppercase tracking-wider">{isAr ? "مزود خدمة" : "Provider"}</span>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{isAr ? "الاسم الكامل" : "Full Name"}</label>
            <input 
              type="text"
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-emerald-500/20 font-bold outline-none transition-all focus:bg-white"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{isAr ? "المدينة" : "City"}</label>
              <select 
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl py-3 px-3 text-xs font-black outline-none appearance-none cursor-pointer"
              >
                {YEMEN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{isAr ? "الحي" : "District"}</label>
              <select 
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl py-3 px-3 text-xs font-black outline-none appearance-none cursor-pointer"
              >
                <option value="">{isAr ? "اختر الحي" : "Select"}</option>
                {neighborhoods.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-emerald-100 transition-all active:scale-95"
          >
            {isSaving ? "..." : (isAr ? "حفظ التغييرات" : "Save Profile")}
          </button>
        </form>
      ) : (
        <div className="space-y-6">
          {/* User Header Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col items-center text-center space-y-4">
            <div className="w-24 h-24 bg-slate-100 rounded-3xl flex items-center justify-center text-slate-300 relative border-2 border-white shadow-sm shrink-0">
              <User size={48} />
              {profile?.isVerified && (
                <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white p-1 rounded-lg border-2 border-white">
                  <ShieldCheck size={18} />
                </div>
              )}
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800">{profile.fullName}</h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">@{profile.role}</p>
            </div>
            <button 
              onClick={() => setIsEditing(true)}
              className="text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-8 py-2.5 rounded-full uppercase tracking-widest hover:bg-emerald-100 transition-all"
            >
              {isAr ? "تعديل البيانات" : "Edit Profile"}
            </button>
          </div>

          {/* Stats / Info */}
          <div className="grid grid-cols-2 gap-4">
             <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm text-center">
                <span className="block text-2xl font-black text-[#48A9A6]">0</span>
                <span className="text-[10px] font-bold text-gray-400 uppercase">{isAr ? "المهام المنجزة" : "Jobs Done"}</span>
             </div>
             <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm text-center">
                <span className="block text-2xl font-black text-[#D4B483]">5.0</span>
                <span className="text-[10px] font-bold text-gray-400 uppercase">{isAr ? "التقييم" : "Rating"}</span>
             </div>
          </div>

          {/* Verification (KYC) Section for Providers */}
          {profile.role === 'provider' && !profile.isVerified && (
            <div className="bg-white p-5 rounded-3xl border-2 border-dashed border-[#D4B483]/40 space-y-4">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-[#D4B483]/10 rounded-xl flex items-center justify-center text-[#D4B483]">
                    <ShieldCheck size={20} />
                 </div>
                 <div>
                    <h3 className="text-sm font-bold text-[#2E282A]">{isAr ? "وثق حسابك" : "Verify Your Account"}</h3>
                    <p className="text-[10px] text-gray-500 leading-tight">
                      {isAr ? "يجب رفع صورة البطاقة الشخصية لضمان ثقة العملاء." : "Upload your National ID to build trust with clients."}
                    </p>
                 </div>
               </div>
               <button className="w-full bg-[#D4B483] text-white py-3 rounded-xl font-bold text-sm shadow-md transition-all active:scale-95">
                  {isAr ? "رفع صورة الهوية" : "Upload ID"}
               </button>
            </div>
          )}

          {/* Profile Sections */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm divide-y divide-gray-100">
             <div className="p-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-gray-50 rounded-lg text-gray-400">
                      <MapPin size={18} />
                   </div>
                   <span className="text-sm font-bold text-[#2E282A]">{profile.city}, {profile.neighborhood}</span>
                </div>
                <ChevronRight size={18} className={`text-gray-300 ${isAr ? 'rotate-180' : ''}`} />
             </div>
             <div className="p-4 flex justify-between items-center text-red-500" onClick={() => signOut(auth)}>
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-red-50 rounded-lg">
                      <LogOut size={18} />
                   </div>
                   <span className="text-sm font-bold">{isAr ? "تسجيل الخروج" : "Logout"}</span>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
