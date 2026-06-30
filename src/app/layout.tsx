import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Sidebar } from "@/components/Sidebar";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "CargoDoc - PDF Data Extraction Tool",
  description: "Automate PDF text and OCR extraction for shipping and taxation documents.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} h-full antialiased`}>
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
          </div>

          {/* Desktop Navigation Sidebar */}
          <Sidebar />

          {/* Main workspace container */}
          <main className="flex-1 flex flex-col min-w-0 p-4 md:p-8 h-screen overflow-y-auto">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
