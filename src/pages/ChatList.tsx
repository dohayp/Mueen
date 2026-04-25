import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { useAuth } from "../App";
import { Link } from "react-router-dom";
import { MessageSquare, ChevronRight } from "lucide-react";
import { motion } from "motion/react";

export default function ChatList() {
  const { user, language } = useAuth();
  const isAr = language === "ar";
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "chats"),
      where("participants", "array-contains", user.uid),
      orderBy("updatedAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setChats(docs);
      setLoading(false);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, "chats");
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-slate-800">
        {isAr ? "المحادثات" : "Chats"}
      </h1>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : chats.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm transition-all">
          <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <MessageSquare className="text-slate-200 w-10 h-10" />
          </div>
          <h3 className="font-black text-slate-800 text-lg">{isAr ? "لا توجد محادثات" : "No chats yet"}</h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">
            {isAr ? "تواصل مع الخبراء للبدء" : "Connect with experts to start"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {chats.map((chat) => (
            <Link 
              key={chat.id} 
              to={`/chat/${chat.id}`}
              className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center gap-4 shadow-sm active:scale-[0.98] transition-all hover:border-emerald-200 group"
            >
              <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                <MessageSquare size={20} />
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="flex justify-between items-center">
                  <h4 className="font-black text-sm text-slate-800 truncate">Job Chat</h4>
                  <span className="text-[9px] font-black text-slate-400 tracking-tighter">
                    {chat.updatedAt?.toDate ? new Date(chat.updatedAt.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 truncate font-medium mt-0.5">{chat.lastMessage}</p>
              </div>
              <ChevronRight size={16} className={`text-slate-200 transition-transform group-hover:translate-x-1 ${isAr ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
