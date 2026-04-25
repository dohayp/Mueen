import { useState } from "react";
import { Search, MapPin, ChevronRight, Star } from "lucide-react";
import { SERVICE_CATEGORIES, YEMEN_CITIES, NEIGHBORHOODS } from "../constants";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../App";
import { motion } from "motion/react";

export default function Home() {
  const { language } = useAuth();
  const navigate = useNavigate();
  const isAr = language === "ar";

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("Sanaa");

  const filteredCategories = SERVICE_CATEGORIES.filter(cat => 
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    cat.arabic.includes(searchQuery)
  );

  return (
    <div className="space-y-6">
      {/* Hero / Search */}
      <section className="space-y-4">
        <h1 className="text-2xl font-black text-slate-800 leading-tight">
          {isAr ? "ابحث عن خبير لمساعدتك في اليمن" : "Find an expert to help you in Yemen"}
        </h1>
        
        <div className="flex flex-col gap-3">
          <div className="relative">
            <Search className={`absolute ${isAr ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-slate-400`} size={18} />
            <input 
              type="text"
              placeholder={isAr ? "ما العثور الذي تحتاجه؟" : "What help do you need?"}
              className={`w-full bg-white border border-slate-200 rounded-xl py-3 ${isAr ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4 text-left'} focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm transition-all`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <div className="flex items-center gap-1 bg-slate-100 border border-slate-200 rounded-lg px-3 py-1.5 shadow-sm shrink-0">
              <MapPin size={14} className="text-emerald-600" />
              <select 
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="text-xs font-bold bg-transparent border-none p-0 focus:ring-0 cursor-pointer text-slate-700"
              >
                {YEMEN_CITIES.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="font-black text-lg text-slate-800">
            {isAr ? "التصنيفات الأكثر طلباً" : "Top Categories"}
          </h2>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          {filteredCategories.map((cat, idx) => (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              key={cat.id}
              onClick={() => navigate(`/post-job?category=${cat.id}`)}
              className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center gap-3 text-center transition-all hover:border-emerald-200 hover:shadow-md active:scale-95 group"
            >
              <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-xl group-hover:bg-emerald-50 transition-colors">
                {/* Dynamically render emoji for placeholder effect like the theme */}
                {cat.id === 'solar' ? '☀️' : cat.id === 'plumbing' ? '🚰' : cat.id === 'electrical' ? '⚡' : '🛠️'}
              </div>
              <span className="text-xs font-bold text-slate-700">
                {isAr ? cat.arabic : cat.name}
              </span>
            </motion.button>
          ))}
        </div>
      </section>

      {/* Promoted / Recent Professionals */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="font-black text-lg text-slate-800">
            {isAr ? "خبراء موثوقون بالقرب منك" : "Trusted Experts Near You"}
          </h2>
          <Link to="/experts" className="text-sm font-bold text-emerald-600 underline">
            {isAr ? "عرض الكل" : "View All"}
          </Link>
        </div>

        <div className="space-y-3">
          {[1, 2, 3].map((_, i) => (
            <div key={i} className="bg-white p-4 rounded-2xl border border-slate-200 flex gap-4 relative">
              <div className="w-20 h-20 bg-slate-100 rounded-xl shrink-0"></div>
              <div className="flex-1 flex flex-col justify-between py-1">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-800 text-sm">
                      {isAr ? "محمد علي" : "Mohammed Ali"}
                    </h3>
                    <span className="bg-blue-50 text-blue-600 text-[9px] px-2 py-0.5 rounded-full font-black tracking-wider border border-blue-100">
                      {isAr ? "موثق ✅" : "VERIFIED ✅"}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed mt-1">
                    {isAr ? "متخصص في أنظمة الطاقة الشمسية الهجينة" : "Specialist in Hybrid Solar Systems"}
                  </p>
                </div>
                <div className="flex items-center gap-4 text-[10px] font-bold">
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star size={10} fill="currentColor" />
                    <span>4.9 (120 تقييم)</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-400">
                    <MapPin size={10} />
                    <span>حي حدة</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Low-Bandwidth Notice */}
      <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex items-center gap-4">
        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
        <div>
          <p className="text-xs font-bold text-emerald-800 mb-1">
            {isAr ? "وضع توفير البيانات" : "Low Data Mode"}
          </p>
          <p className="text-[10px] text-emerald-600 font-medium leading-tight">
            {isAr 
              ? "هذا التطبيق يعمل كـ 3G محسنة لضمان الاستمرارية." 
              : "App functioning in optimized 3G mode for reliability."}
          </p>
        </div>
      </div>
    </div>
  );
}
