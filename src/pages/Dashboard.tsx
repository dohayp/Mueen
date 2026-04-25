import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, orderBy, updateDoc, doc, serverTimestamp } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { useAuth } from "../App";
import { MapPin, Clock, Tag, MessageCircle, CheckCircle2, ChevronRight, Filter } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";

export default function Dashboard() {
  const { user, profile, language } = useAuth();
  const isAr = language === "ar";
  const navigate = Link;

  const [activeTab, setActiveTab] = useState<'my_jobs' | 'available_leads'>('my_jobs');
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const isProvider = profile?.role === 'provider';

  useEffect(() => {
    if (!user) return;

    let q;
    if (activeTab === 'my_jobs') {
      const field = isProvider ? 'providerId' : 'clientId';
      q = query(
        collection(db, "jobs"),
        where(field, "==", user.uid),
        orderBy("updatedAt", "desc")
      );
    } else {
      // Available leads for providers in their city
      q = query(
        collection(db, "jobs"),
        where("status", "==", "pending"),
        where("city", "==", profile?.city || "Sanaa"),
        orderBy("createdAt", "desc")
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setJobs(docs);
      setLoading(false);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, "jobs");
    });

    return () => unsubscribe();
  }, [user, activeTab, isProvider, profile?.city]);

  const handleAcceptJob = async (jobId: string) => {
    if (!user || !isProvider) return;
    try {
      await updateDoc(doc(db, "jobs", jobId), {
        providerId: user.uid,
        status: 'active',
        updatedAt: serverTimestamp()
      });
      setActiveTab('my_jobs');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `jobs/${jobId}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <h1 className="text-2xl font-black text-slate-800">
          {isAr ? "لوحة التحكم" : "Dashboard"}
        </h1>
        {isProvider && (
           <div className="flex bg-slate-100 border border-slate-200 rounded-xl p-1 shadow-sm">
            <button 
              onClick={() => setActiveTab('my_jobs')}
              className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${activeTab === 'my_jobs' ? 'bg-white text-emerald-600 shadow-sm border border-slate-200' : 'text-slate-400'}`}
            >
              {isAr ? "مهامي" : "My Jobs"}
            </button>
            <button 
              onClick={() => setActiveTab('available_leads')}
              className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${activeTab === 'available_leads' ? 'bg-white text-emerald-600 shadow-sm border border-slate-200' : 'text-slate-400'}`}
            >
              {isAr ? "طلبات متاحة" : "Available"}
            </button>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm">
            <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <ClipboardList className="text-slate-200 w-10 h-10" />
            </div>
            <h3 className="font-black text-slate-800 text-lg">{isAr ? "لا توجد طلبات حالياً" : "No jobs found"}</h3>
            <p className="text-xs text-slate-500 mt-2 font-medium">
              {activeTab === 'my_jobs' 
                ? (isAr ? "ابدأ بنشر طلب جديد لمساعدة مجتمعك." : "Start by posting a new request.")
                : (isAr ? "تحقق لاحقاً من وجود طلبات في منطقتك." : "Check back later for leads in your area.")}
            </p>
            {!isProvider && (
              <Link 
                to="/post-job" 
                className="mt-8 inline-flex items-center gap-2 bg-emerald-600 text-white px-8 py-3 rounded-2xl font-black shadow-lg shadow-emerald-100 transition-all hover:bg-emerald-700"
              >
                {isAr ? "تحتاج مساعدة؟" : "Need help?"}
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                key={job.id} 
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 relative overflow-hidden group hover:border-emerald-200 transition-all"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-1.5 px-1">
                    <div className="flex items-center gap-2">
                      <span className="bg-slate-100 text-slate-500 text-[10px] font-black px-2 py-0.5 rounded-lg border border-slate-200 uppercase tracking-widest leading-none">
                        {job.category}
                      </span>
                      <div className={`w-2 h-2 rounded-full ${
                        job.status === 'pending' ? 'bg-amber-400' : 
                        job.status === 'active' ? 'bg-blue-400' : 'bg-emerald-400'
                      }`}></div>
                    </div>
                    <h3 className="font-black text-slate-800 text-lg leading-tight">{job.title}</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-emerald-600 font-mono tracking-tight">{job.estimatedPrice}</p>
                    <p className="text-[10px] text-slate-400 mt-1 font-bold">
                      {job.createdAt?.toDate ? new Date(job.createdAt.toDate()).toLocaleDateString(isAr ? 'ar-YE' : 'en-US') : ''}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-medium">
                  {job.description}
                </p>

                <div className="flex items-center gap-5 text-[10px] text-slate-400 font-black uppercase tracking-wider border-t border-slate-50 pt-4">
                  <div className="flex items-center gap-1.5">
                    <MapPin size={12} className="text-slate-300" />
                    <span>{job.city} • {job.neighborhood}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock size={12} className="text-slate-300" />
                    <span className={job.status === 'pending' ? 'text-amber-500' : 'text-slate-400'}>
                      {job.status === 'pending' ? (isAr ? 'في الانتظار' : 'PENDING') : job.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex gap-3">
                  {activeTab === 'available_leads' ? (
                    <button 
                      onClick={() => handleAcceptJob(job.id)}
                      className="flex-1 bg-emerald-600 text-white py-3.5 rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-100 active:scale-[0.98] transition-all hover:bg-emerald-700 uppercase tracking-widest"
                    >
                      <CheckCircle2 size={16} />
                      {isAr ? "قبول هذا الطلب" : "Accept Lead"}
                    </button>
                  ) : (
                    <Link 
                      to={`/chat/${job.id}`} 
                      className="flex-1 bg-slate-50 border border-slate-200 text-slate-800 py-3.5 rounded-xl font-black text-xs flex items-center justify-center gap-2 hover:bg-slate-100 transition-all uppercase tracking-widest"
                    >
                      <MessageCircle size={16} className="text-emerald-600" />
                      {isAr ? "محادثة" : "Chat"}
                    </Link>
                  )}
                  <Link 
                    to={`/job/${job.id}`}
                    className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-300 hover:text-slate-800 hover:border-slate-300 transition-all flex items-center justify-center"
                  >
                    <ChevronRight size={18} className={isAr ? "rotate-180" : ""} />
                  </Link>
                </div>
                {/* Decorative Status Bar at top */}
                <div className={`absolute top-0 left-0 right-0 h-1 ${
                  job.status === 'pending' ? 'bg-amber-100' : 
                  job.status === 'active' ? 'bg-blue-100' : 'bg-emerald-100'
                }`} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
function ClipboardList(props: any) {
  return (
    <svg 
      {...props}
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <rect width="8" height="4" x="8" y="2" rx="1" ry="1"/>
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
      <path d="M12 11h4"/>
      <path d="M12 16h4"/>
      <path d="M8 11h.01"/>
      <path d="M8 16h.01"/>
    </svg>
  );
}
