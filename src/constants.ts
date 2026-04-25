export const YEMEN_CITIES = [
  "Sanaa",
  "Aden",
  "Taiz",
  "Al-Mukalla",
  "Hodeidah",
  "Ibb",
  "Dhamar",
  "Amran",
  "Sayun",
  "Marib",
];

export const NEIGHBORHOODS: Record<string, string[]> = {
  "Sanaa": ["Al-Sabeen", "Al-Wahdah", "Ma'ain", "Az'zal", "Al-Tahrir", "Sho'ub"],
  "Aden": ["Crater", "Ma'alla", "Tawahi", "Khormaksar", "Sheikh Othman", "Mansoura", "Dar Sad"],
  "Taiz": ["Al-Qahirah", "Sallah", "Al-Mudhaffar"],
};

export const SERVICE_CATEGORIES = [
  { id: "solar", name: "Solar Energy", icon: "Sun", arabic: "الطاقة الشمسية" },
  { id: "plumbing", name: "Plumbing", icon: "Droplets", arabic: "السباكة" },
  { id: "electrical", name: "Electrical", icon: "Zap", arabic: "الكهرباء" },
  { id: "general_maint", name: "General Maintenance", icon: "Wrench", arabic: "الصيانة العامة" },
  { id: "it_programming", name: "IT & Programming", icon: "Code", arabic: "تقنية المعلومات والبرمجة" },
  { id: "graphics_design", name: "Graphics & Design", icon: "Palette", arabic: "الجرافيكس والتصميم" },
  { id: "teaching", name: "Teaching & Tutoring", icon: "GraduationCap", arabic: "التعليم والتدريس" },
  { id: "cleaning", name: "Cleaning Services", icon: "Sparkles", arabic: "خدمات التنظيف" },
];

export const APP_THEME = {
  primary: "#059669", // Emerald 600
  secondary: "#64748b", // Slate 500
  accent: "#0ea5e9", // Sky 500
  background: "#f1f5f9", // Slate 100
  text: "#1e293b", // Slate 800
  border: "#e2e8f0", // Slate 200
};
