"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { 
  Settings as SettingsIcon, 
  Sun, 
  Moon, 
  Monitor, 
  Key, 
  Info,
  CheckCircle,
  Eye,
  EyeOff
} from "lucide-react";

export default function Settings() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Set mounted state to prevent hydration mismatches
  useEffect(() => {
    setMounted(true);
    // Load API Key from sessionStorage on client load
    const storedKey = sessionStorage.getItem("cargodoc_ocr_key") || "";
    setApiKey(storedKey);
  }, []);

  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    sessionStorage.setItem("cargodoc_ocr_key", apiKey.trim());
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleClearApiKey = () => {
    sessionStorage.removeItem("cargodoc_ocr_key");
    setApiKey("");
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  if (!mounted) {
    return (
      <div className="max-w-3xl mx-auto py-8 animate-pulse space-y-6">
        <div className="h-8 w-48 bg-muted rounded"></div>
        <div className="h-40 bg-muted rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-8 animate-fade-in">
      {/* Title */}
      <div className="flex items-center gap-2 text-foreground">
        <SettingsIcon className="text-primary" size={24} />
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
      </div>

      {/* Theme Section */}
      <section className="glass-panel rounded-2xl p-6 shadow-sm space-y-4">
        <h2 className="text-base font-bold flex items-center gap-2">
          Appearance
        </h2>
        <p className="text-xs text-muted-foreground">
          Select how you want CargoDoc to look on your screen. This preference will be saved locally.
        </p>

        <div className="grid grid-cols-3 gap-3 max-w-md pt-2">
          {[
            { id: "light", label: "Light", icon: Sun },
            { id: "dark", label: "Dark", icon: Moon },
            { id: "system", label: "System", icon: Monitor },
          ].map((opt) => {
            const Icon = opt.icon;
            const isSelected = theme === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setTheme(opt.id)}
                className={`flex flex-col items-center justify-center gap-2 p-3.5 border rounded-xl font-medium text-xs transition-all cursor-pointer ${
                  isSelected
                    ? "bg-primary border-primary text-primary-foreground shadow-sm scale-[1.02]"
                    : "bg-card/50 hover:bg-secondary/40 border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon size={18} />
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* OCR Space API Key Section */}
      <section className="glass-panel rounded-2xl p-6 shadow-sm space-y-4">
        <h2 className="text-base font-bold flex items-center gap-2">
          OCR Provider Configuration
        </h2>
        <p className="text-xs text-muted-foreground">
          CargoDoc uses OCR.Space to extract text from scanned PDFs. Your API key is stored 
          <strong> only in session memory </strong> and is cleared when you close the browser tab.
        </p>

        <form onSubmit={handleSaveApiKey} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <Key size={12} /> OCR.Space API Key
            </label>
            <div className="relative max-w-md">
              <input
                type={showKey ? "text" : "password"}
                placeholder="Enter API key (defaults to 'helloworld')"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full pl-3 pr-10 py-2 text-sm bg-card/50 border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary backdrop-blur-sm"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <p className="text-[10px] text-muted-foreground">
              Don't have a key? You can get a free one from <a href="https://ocr.space/OCRAPI" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">ocr.space/OCRAPI</a>.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl transition-all shadow-sm cursor-pointer"
            >
              Save Key (For Session)
            </button>
            {apiKey && (
              <button
                type="button"
                onClick={handleClearApiKey}
                className="px-4 py-2 text-xs font-semibold bg-secondary hover:bg-secondary/80 text-muted-foreground rounded-xl transition-all cursor-pointer"
              >
                Clear Key
              </button>
            )}
            
            {saveSuccess && (
              <span className="text-emerald-500 text-xs font-semibold flex items-center gap-1 animate-fade-in">
                <CheckCircle size={14} /> Saved successfully!
              </span>
            )}
          </div>
        </form>
      </section>

      {/* About Section */}
      <section className="glass-panel rounded-2xl p-6 shadow-sm space-y-4">
        <h2 className="text-base font-bold flex items-center gap-2">
          <Info size={18} className="text-primary" /> About CargoDoc
        </h2>
        <p className="text-xs text-muted-foreground leading-relaxed">
          CargoDoc is a secure, serverless document parsing assistant designed for single-user offline workflows. 
          It runs entirely inside the browser sandboxed environment.
        </p>

        <div className="grid grid-cols-2 gap-4 max-w-md pt-2 text-xs font-medium">
          <div className="flex flex-col gap-1 border-r border-border/50 pr-4">
            <span className="text-muted-foreground text-[10px] uppercase font-semibold">Application Version</span>
            <span className="text-foreground font-mono">1.0.0 (Stable)</span>
          </div>
          <div className="flex flex-col gap-1 pl-2">
            <span className="text-muted-foreground text-[10px] uppercase font-semibold">PDF Engine</span>
            <span className="text-foreground font-mono">pdf.js v4.x (Client)</span>
          </div>
          <div className="flex flex-col gap-1 border-r border-border/50 pr-4 pt-2">
            <span className="text-muted-foreground text-[10px] uppercase font-semibold">OCR Provider</span>
            <span className="text-foreground font-mono">OCR.Space (API)</span>
          </div>
          <div className="flex flex-col gap-1 pl-2 pt-2">
            <span className="text-muted-foreground text-[10px] uppercase font-semibold">Privacy Level</span>
            <span className="text-foreground text-emerald-500 flex items-center gap-1 font-semibold">
              <CheckCircle size={12} /> Local-Only
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
