import Link from "next/link";
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  ShieldAlert, 
  Cpu, 
  FileCheck2 
} from "lucide-react";

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto flex flex-col justify-center h-full py-8 md:py-12 space-y-8 animate-fade-in">
      {/* Welcome Card - Glassmorphism */}
      <div className="glass-panel rounded-3xl p-8 md:p-12 shadow-xl flex flex-col space-y-6">
        <div className="flex items-center gap-3 text-primary">
          <div className="w-12 h-12 bg-primary/10 flex items-center justify-center rounded-2xl">
            <Cpu size={24} />
          </div>
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-primary/80">Productivity Tool</span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">CargoDoc</h2>
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight leading-tight">
            Welcome to CargoDoc
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed max-w-2xl">
            CargoDoc helps automate Import and Export PDF extraction for confidential taxation and logistics documents. 
            Eliminate manual typing and verify shipping records in a clean, interactive grid in seconds.
          </p>
        </div>

        {/* Privacy Notice Box */}
        <div className="flex items-start gap-4 p-5 bg-amber-500/[0.04] border border-amber-500/20 rounded-2xl">
          <ShieldAlert className="text-amber-500 shrink-0 mt-0.5" size={20} />
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-foreground">Strict Privacy Notice</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Uploaded documents are processed only during the current session and are never permanently stored. 
              Closing the browser tab or refreshing will purge all records from system memory immediately.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground pl-1">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Export Card Link */}
          <Link href="/export" className="group cursor-pointer">
            <div className="glass-panel h-full rounded-2xl p-6 flex flex-col justify-between border hover:border-primary/40 hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ArrowUpRight size={20} />
                </div>
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider bg-secondary/80 px-2 py-0.5 rounded-full">
                  Export Files
                </span>
              </div>
              <div className="mt-8 space-y-2">
                <h4 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors flex items-center gap-1.5">
                  Export Module <FileCheck2 size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Upload multiple Export bills of lading/declaration PDFs to extract Export No, Date, Barge, and VINs.
                </p>
              </div>
            </div>
          </Link>

          {/* Import Card Link */}
          <Link href="/import" className="group cursor-pointer">
            <div className="glass-panel h-full rounded-2xl p-6 flex flex-col justify-between border hover:border-primary/40 hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ArrowDownLeft size={20} />
                </div>
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider bg-secondary/80 px-2 py-0.5 rounded-full">
                  Import Files
                </span>
              </div>
              <div className="mt-8 space-y-2">
                <h4 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors flex items-center gap-1.5">
                  Import Module <FileCheck2 size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Upload multiple Import declarations. Extract standard fields plus an extra third-level verification column.
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
