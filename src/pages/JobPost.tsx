import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { MapPin, Camera, Mic, Sparkles, Send, ChevronLeft } from "lucide-react";
import { SERVICE_CATEGORIES, YEMEN_CITIES, NEIGHBORHOODS } from "../constants";
import { useAuth } from "../App";
import { estimatePrice } from "../lib/gemini";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { motion, AnimatePresence } from "motion/react";

export default function JobPost() {
  const { user, profile, language } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isAr = language === "ar";

  const [category, setCategory] = useState(searchParams.get("category") || "solar");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [city, setCity] = useState(profile?.city || "Sanaa");
  const [neighborhood, setNeighborhood] = useState(profile?.neighborhood || "");
  
  const [isEstimating, setIsEstimating] = useState(false);
  const [estimation, setEstimation] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const neighborhoods = NEIGHBORHOODS[city] || [];

  const handleEstimate = async () => {
    if (!description || description.length < 10) return;
    setIsEstimating(true);
    const serviceName = SERVICE_CATEGORIES.find(c => c.id === category)?.name || category;
    const res = await estimatePrice(serviceName, description);
    setEstimation(res);
    setIsEstimating(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      const jobData = {
        clientId: user.uid,
        title,
        description,
        category,
        city,
        neighborhood,
        status: 'pending',
        estimatedPrice: estimation?.range_yer || "Contact for price",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        photoUrls: [],
        voiceNoteUrl: null
      };

      await addDoc(collection(db, "jobs"), jobData);
      navigate("/dashboard");
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "jobs");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
          <ChevronLeft size={20} className={isAr ? "rotate-180" : ""} />
        </button>
        <h1 className="text-xl font-black text-slate-800">
          {isAr ? "نشر طلب خدمة جديد" : "Post a New Service Request"}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Category Selection */}
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-500 uppercase tracking-widest">
            {isAr ? "فئة الخدمة" : "Service Category"}
          </label>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {SERVICE_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id)}
                className={`shrink-0 px-5 py-2.5 rounded-xl text-xs font-black border transition-all ${
                  category === cat.id 
                  ? "bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-100" 
                  : "bg-white border-slate-200 text-slate-600 hover:border-emerald-300"
                }`}
              >
                {isAr ? cat.arabic : cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-500 uppercase tracking-widest">
            {isAr ? "عنوان الطلب" : "Job Title"}
          </label>
          <input 
            type="text"
            required
            placeholder={isAr ? "مثال: صيانة منظومة طاقة شمسية" : "e.g. Solar panel maintenance"}
            className={`w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 px-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm transition-all focus:bg-white ${isAr ? 'text-right' : 'text-left'}`}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-500 uppercase tracking-widest">
            {isAr ? "تفاصيل المشكلة" : "Describe the Problem"}
          </label>
          <div className="relative">
            <textarea 
              required
              rows={4}
              placeholder={isAr ? "اشرح ما الذي تحتاجه بالضبط هنا..." : "Explain exactly what you need help with here..."}
              className={`w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 px-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm transition-all focus:bg-white ${isAr ? 'text-right' : 'text-left'}`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        {/* Multimedia Patterns */}
        <div className="flex gap-3">
          <button className="flex-1 bg-emerald-600 text-white px-4 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-95">
             <Mic size={20} />
             <span className="text-xs">{isAr ? "سجل صوتك" : "Record Voice"}</span>
          </button>
          <button className="bg-slate-100 text-slate-600 p-3.5 rounded-xl border border-slate-200 hover:bg-slate-200 transition-all">
             <Camera size={20} />
          </button>
        </div>

        {/* Location Dropdowns */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest">{isAr ? "المدينة" : "City"}</label>
            <div className="relative">
              <MapPin size={14} className={`absolute ${isAr ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-emerald-600`} />
              <select 
                value={city}
                onChange={(e) => {
                  setCity(e.target.value);
                  setNeighborhood(NEIGHBORHOODS[e.target.value]?.[0] || "");
                }}
                className={`w-full bg-white border border-slate-200 rounded-xl py-3 ${isAr ? 'pr-9 pl-3 text-right' : 'pl-9 pr-3 text-left'} text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm appearance-none cursor-pointer`}
              >
                {YEMEN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest">{isAr ? "مديرية / حي" : "District"}</label>
            <select 
              value={neighborhood}
              onChange={(e) => setNeighborhood(e.target.value)}
              className={`w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm appearance-none cursor-pointer ${isAr ? 'text-right' : 'text-left'}`}
            >
              {neighborhoods.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        </div>

        {/* AI Estimation */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-amber-500" />
              <span className="text-sm font-black text-slate-800">{isAr ? "تقدير السعر الذكي" : "Smart AI Estimation"}</span>
            </div>
            {!estimation && (
              <button 
                type="button"
                disabled={isEstimating || description.length < 10}
                onClick={handleEstimate}
                className="text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg border border-emerald-100 disabled:opacity-50"
              >
                {isEstimating ? (isAr ? "جاري..." : "RUNNING...") : (isAr ? "تقدير" : "RUN")}
              </button>
            )}
          </div>
          
          <AnimatePresence>
            {estimation && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="space-y-2 bg-slate-50 p-4 rounded-xl border border-dashed border-slate-300"
              >
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-slate-500">{isAr ? "السعر المتوقع (ريال):" : "Expected (YER):"}</span>
                  <span className="font-black text-emerald-600">{estimation.range_yer}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-slate-500">{isAr ? "السعر المتوقع (دولار):" : "Expected (USD):"}</span>
                  <span className="font-black text-emerald-600">{estimation.range_usd}</span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium leading-tight mt-2">
                  * {estimation.notes}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-emerald-100 flex items-center justify-center gap-3 hover:bg-emerald-700 transition-all disabled:opacity-70 active:scale-[0.98]"
        >
          {isSubmitting ? (
            <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <>
              <Send size={20} />
              {isAr ? "نشر الطلب الآن" : "Post Request Now"}
            </>
          )}
        </button>
      </form>
    </div>
  );
}
