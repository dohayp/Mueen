import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, updateDoc, doc } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { useAuth } from "../App";
import { ShieldCheck, CheckCircle, XCircle } from "lucide-react";

export default function AdminDashboard() {
  const { language } = useAuth();
  const isAr = language === "ar";
  const [usersToVerify, setUsersToVerify] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only fetch providers who are not verified
    const q = query(
      collection(db, "users"),
      where("role", "==", "provider"),
      where("isVerified", "==", false)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsersToVerify(docs);
      setLoading(false);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, "users");
    });

    return () => unsubscribe();
  }, []);

  const handleVerify = async (userId: string, approve: boolean) => {
    try {
      await updateDoc(doc(db, "users", userId), {
        isVerified: approve
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <ShieldCheck size={24} className="text-emerald-600" />
        <h1 className="text-2xl font-black text-slate-800">
          {isAr ? "لوحة الإدارة" : "Admin Dashboard"}
        </h1>
      </div>

      <div className="space-y-4">
        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">
          {isAr ? "تحقق من الهوية" : "Verification Requests"}
        </h2>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : usersToVerify.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl text-center border border-slate-100 shadow-sm">
             <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{isAr ? "لا توجد طلبات معلقة" : "No pending requests"}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {usersToVerify.map(u => (
              <div key={u.id} className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between shadow-sm hover:border-emerald-200 transition-all">
                <div className="px-1">
                  <h4 className="font-black text-slate-800 text-sm leading-tight">{u.fullName}</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{u.city} • {u.neighborhood}</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleVerify(u.id, true)}
                    className="p-2.5 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-all shadow-sm active:scale-90"
                  >
                    <CheckCircle size={20} />
                  </button>
                  <button 
                    onClick={() => handleVerify(u.id, false)}
                    className="p-2.5 text-red-500 bg-red-50 hover:bg-red-100 rounded-xl transition-all shadow-sm active:scale-90"
                  >
                    <XCircle size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
