import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, getDoc, setDoc } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { useAuth } from "../App";
import { Send, ChevronLeft, Phone, MoreVertical, Paperclip } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function ChatRoom() {
  const { chatId } = useParams(); // Using jobId as chatId
  const { user, profile, language } = useAuth();
  const navigate = useNavigate();
  const isAr = language === "ar";
  const scrollRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!chatId) return;

    // Fetch job details for header
    const fetchJob = async () => {
      const snap = await getDoc(doc(db, "jobs", chatId!));
      if (snap.exists()) {
        setJob({ id: snap.id, ...snap.data() });
      }
    };
    fetchJob();

    // Fetch messages
    const q = query(
      collection(db, "chats", chatId!, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
      setLoading(false);
      // Scroll to bottom
      setTimeout(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, `chats/${chatId}/messages`);
    });

    return () => unsubscribe();
  }, [chatId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !user || !chatId) return;

    const text = inputText;
    setInputText("");

    try {
      await addDoc(collection(db, "chats", chatId, "messages"), {
        senderId: user.uid,
        text,
        createdAt: serverTimestamp(),
      });

      // Update chat metadata
      await setDoc(doc(db, "chats", chatId), {
        jobId: chatId,
        lastMessage: text,
        updatedAt: serverTimestamp(),
        participants: [job.clientId, job.providerId]
      }, { merge: true });
      
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `chats/${chatId}/messages`);
    }
  };

  if (loading) return (
    <div className="flex justify-center py-12">
      <div className="w-8 h-8 border-2 border-[#48A9A6] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] -mx-4 -mt-4 bg-gray-50 overflow-hidden">
      {/* Header */}
      <div className="bg-white px-4 py-3 border-b border-gray-100 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1 hover:bg-gray-100 rounded-full">
            <ChevronLeft size={20} className={isAr ? "rotate-180" : ""} />
          </button>
          <div>
            <h3 className="font-bold text-sm text-[#2E282A]">{job?.title}</h3>
            <p className="text-[10px] text-[#48A9A6] font-bold">
               {isAr ? "نشط الآن" : "Active Now"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
            <button className="p-2 text-gray-400 hover:text-[#48A9A6] hover:bg-[#48A9A6]/5 rounded-full">
               <Phone size={18} />
            </button>
            <button className="p-2 text-gray-400 hover:bg-gray-50 rounded-full">
               <MoreVertical size={18} />
            </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.map((msg, i) => {
          const isMe = msg.senderId === user?.uid;
          const showTime = i === messages.length - 1 || 
                           (messages[i+1] && msg.createdAt?.seconds - messages[i+1].createdAt?.seconds > 300);

          return (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              key={msg.id} 
              className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                isMe 
                ? 'bg-[#48A9A6] text-white rounded-tr-none' 
                : 'bg-white text-[#2E282A] rounded-tl-none border border-gray-100'
              }`}>
                {msg.text}
                {msg.createdAt && (
                  <span className={`block text-[9px] mt-1 ${isMe ? 'text-white/70 text-right' : 'text-gray-400 text-left'}`}>
                    {new Date(msg.createdAt.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
        <div ref={scrollRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white p-4 border-t border-gray-100 sticky bottom-0">
         <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <button type="button" className="p-2 text-gray-400 hover:text-[#48A9A6] transition-colors">
               <Paperclip size={20} />
            </button>
            <input 
               type="text"
               value={inputText}
               onChange={(e) => setInputText(e.target.value)}
               placeholder={isAr ? "اكتب رسالتك..." : "Type a message..."}
               className={`flex-1 bg-gray-50 border border-gray-200 rounded-2xl py-2.5 px-4 outline-none focus:ring-2 focus:ring-[#48A9A6]/30 transition-all text-sm ${isAr ? 'text-right' : 'text-left'}`}
            />
            <button 
               type="submit"
               disabled={!inputText.trim()}
               className="p-2.5 bg-[#48A9A6] text-white rounded-full shadow-md active:scale-95 transition-all disabled:opacity-50"
            >
               <Send size={18} className={isAr ? "rotate-180" : ""} />
            </button>
         </form>
      </div>
    </div>
  );
}
