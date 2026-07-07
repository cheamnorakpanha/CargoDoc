import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Sidebar } from "@/components/Sidebar";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

import type { Metadata, Viewport } from "next";

export const viewport: Viewport = {
  themeColor: "#000000",
};

export const metadata: Metadata = {
  title: "CargoDoc - PDF Data Extraction Tool",
  description:
    "Automate PDF text and OCR extraction for shipping and taxation documents.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "CargoDoc",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-screen bg-background font-sans text-foreground flex md:flex-row flex-col overflow-x-hidden">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* Ambient background decoration blobs */}
          <div className="bg-gradient-blobs">
            <div className="blob blob-1"></div>
            <div className="blob blob-2"></div>
            <div className="blob blob-3"></div>
          </div>

          {/* Desktop Navigation Sidebar */}
          <Sidebar />

          {/* Main workspace container */}
          <main className="flex-1 flex flex-col min-w-0 p-4 md:p-8 h-screen overflow-y-auto">
            {children}
          </main>

          {/* Toast notifications */}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: "hsl(var(--background))",
                color: "hsl(var(--foreground))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "0.75rem",
              },
              error: {
                style: {
                  background: "hsl(var(--destructive) / 0.1)",
                  color: "hsl(var(--destructive))",
                  border: "1px solid hsl(var(--destructive) / 0.2)",
                },
                iconTheme: {
                  primary: "hsl(var(--destructive))",
                  secondary: "hsl(var(--background))",
                },
              },
              success: {
                style: {
                  background: "hsl(142.1 76.2% 36.3% / 0.1)",
                  color: "hsl(142.1 76.2% 36.3%)",
                  border: "1px solid hsl(142.1 76.2% 36.3% / 0.2)",
                },
                iconTheme: {
                  primary: "hsl(142.1 76.2% 36.3%)",
                  secondary: "hsl(var(--background))",
                },
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
