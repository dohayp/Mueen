import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect, createContext, useContext } from "react";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { auth, db } from "./lib/firebase";

// Components
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import JobPost from "./pages/JobPost";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import ChatList from "./pages/ChatList";
import ChatRoom from "./pages/ChatRoom";
import AdminDashboard from "./pages/AdminDashboard";

// Context
interface AuthContextType {
  user: FirebaseUser | null;
  profile: any | null;
  loading: boolean;
  language: "ar" | "en";
  setLanguage: (lang: "ar" | "en") => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  language: "ar",
  setLanguage: () => {},
});

export const useAuth = () => useContext(AuthContext);

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState<"ar" | "en">("ar");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        // Fetch profile
        const docRef = doc(db, "users", u.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(docSnap.data());
        } else {
          // If no profile, we'll force them to create one in Profile page or similar
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Real-time profile updates if needed
  useEffect(() => {
    if (user) {
      const unsubscribe = onSnapshot(doc(db, "users", user.uid), (doc) => {
        if (doc.exists()) {
          setProfile(doc.data());
        }
      });
      return () => unsubscribe();
    }
  }, [user]);

  useEffect(() => {
    document.dir = language === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = language;
  }, [language]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#F1F0EA]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#48A9A6]"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, language, setLanguage }}>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={!user ? <Auth /> : <Navigate to="/" />} />
            <Route path="/post-job" element={user ? <JobPost /> : <Navigate to="/auth" />} />
            <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/auth" />} />
            <Route path="/profile" element={user ? <Profile /> : <Navigate to="/auth" />} />
            <Route path="/chats" element={user ? <ChatList /> : <Navigate to="/auth" />} />
            <Route path="/chat/:chatId" element={user ? <ChatRoom /> : <Navigate to="/auth" />} />
            <Route path="/admin" element={profile?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/" />} />
          </Routes>
        </Layout>
      </Router>
    </AuthContext.Provider>
  );
}
