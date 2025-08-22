import { create } from "zustand";
import {
  Sun,
  Moon,
  Zap,
  Sparkles,
  Leaf,
  CircleSlash,
  Rocket,
} from "lucide-react";

export interface Theme {
  backgroundColor: string;
  cardBackground: string;
  primaryColor: string;
  textColor: string;
  taglistTextColor: string;
  buttonStyle: string;
  fontFamily: string;
  borderRadius: string;
}

interface ThemeStore {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeStore>((set) => ({
  theme: {
    backgroundColor: "#ffffff",
    cardBackground: "#f8f9fa",
    primaryColor: "#000000",
    textColor: "#374151",
    buttonStyle: "default",
    fontFamily: "Inter, sans-serif",
    borderRadius: "8px",
    taglistTextColor: "",
  },
  setTheme: (theme) => set(() => ({ theme })),
}));

// List of prebuilt themes
export const prebuiltThemes: {
  id: string;
  name: string;
  description: string;
  icon: unknown;
  config: Theme;
  preview: {
    background: string;
    cardBg: string;
    borderRadius: string;
    buttonStyle: string;
    fontFamily: string;
  };
}[] = [
  // Original Themes
  {
    id: "default",
    name: "Default",
    description: "Simple and clean design",
    icon: Sun,
    preview: {
      background: "bg-background",
      cardBg: "bg-card",
      buttonStyle: "default",
      fontFamily: "font-sans",
      borderRadius: "rounded-lg",
    },
    config: {
      backgroundColor: "#ffffff",
      cardBackground: "#f8f9fa",
      primaryColor: "#000000",
      textColor: "#374151",
      taglistTextColor: "#9aaecdff",
      buttonStyle: "default",
      fontFamily: "Inter, sans-serif",
      borderRadius: "8px",
    },
  },
  {
    id: "neon",
    name: "Neon",
    description: "Vibrant cyberpunk aesthetic",
    icon: Zap,
    preview: {
      background: "bg-slate-900",
      cardBg: "bg-slate-800/50",
      buttonStyle: "neon",
      fontFamily: "font-mono",
      borderRadius: "rounded-xl",
    },
    config: {
      backgroundColor: "#0f172a",
      cardBackground: "#1e293b80",
      primaryColor: "#00ff88",
      textColor: "#e2e8f0",
      taglistTextColor: "#606265ff",
      buttonStyle: "neon",
      fontFamily: "Fira Code",
      borderRadius: "12px",
    },
  },
  {
    id: "dark",
    name: "Dark",
    description: "Professional dark theme",
    icon: Moon,
    preview: {
      background: "bg-slate-900",
      cardBg: "bg-slate-800",
      buttonStyle: "dark",
      fontFamily: "font-sans",
      borderRadius: "rounded-lg",
    },
    config: {
      backgroundColor: "#1a1a1a",
      cardBackground: "#262626",
      primaryColor: "#3b82f6",
      textColor: "#f5f5f5",
      taglistTextColor: "#f5f5f5",
      buttonStyle: "dark",
      fontFamily: "Inter",
      borderRadius: "8px",
    },
  },
  {
    id: "bold",
    name: "Bold",
    description: "Eye-catching gradients",
    icon: Sparkles,
    preview: {
      background: "bg-gradient-to-br from-purple-600 to-blue-600",
      cardBg: "bg-white/90",
      buttonStyle: "gradient",
      fontFamily: "font-bold",
      borderRadius: "rounded-2xl",
    },
    config: {
      backgroundColor: "linear-gradient(135deg, #7c3aed, #2563eb)",
      cardBackground: "#ffffffE6",
      primaryColor: "#100425ff",
      textColor: "#1f2937",
      taglistTextColor: "#ebeff4ff",
      buttonStyle: "gradient",
      fontFamily: "Inter",
      borderRadius: "16px",
    },
  },
  // --- New & Exciting Themes ---
  {
    id: "retro-wave",
    name: "Retro Wave",
    description: "A vibrant, nostalgic aesthetic with a synthwave vibe.",
    icon: Rocket,
    preview: {
      background: "bg-[#120a32]",
      cardBg: "bg-[#1d0e4a]",
      buttonStyle: "gradient",
      fontFamily: "font-mono",
      borderRadius: "rounded-md",
    },
    config: {
      backgroundColor: "#120a32",
      cardBackground: "#1d0e4a",
      primaryColor: "#ff3864",
      textColor: "#ffffff",
      taglistTextColor: "#66ffff",
      buttonStyle: "neon",
      fontFamily: "VT323, monospace",
      borderRadius: "6px",
    },
  },
  {
    id: "ethereal-forest",
    name: "Ethereal Forest",
    description: "Calm and natural with a soft, organic feel.",
    icon: Leaf,
    preview: {
      background: "bg-[#f5f5f4]",
      cardBg: "bg-[#ebf0e6]",
      buttonStyle: "ghost",
      fontFamily: "font-serif",
      borderRadius: "rounded-xl",
    },
    config: {
      backgroundColor: "#f5f5f4",
      cardBackground: "#ebf0e6",
      primaryColor: "#527453",
      textColor: "#2e432f",
      taglistTextColor: "#7f8c7e",
      buttonStyle: "subtle",
      fontFamily: "Lora, serif",
      borderRadius: "16px",
    },
  },
  {
    id: "high-contrast",
    name: "High Contrast",
    description: "Bold, clean, and highly readable design.",
    icon: CircleSlash,
    preview: {
      background: "bg-black",
      cardBg: "bg-white",
      buttonStyle: "default",
      fontFamily: "font-mono",
      borderRadius: "rounded-none",
    },
    config: {
      backgroundColor: "#000000",
      cardBackground: "#ffffff",
      primaryColor: "#facc15",
      textColor: "#000000",
      taglistTextColor: "#555555",
      buttonStyle: "solid",
      fontFamily: "IBM Plex Mono, monospace",
      borderRadius: "0px",
    },
  },
];
