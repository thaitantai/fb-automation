import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "FB Automation Dashboard",
  description: "Hệ thống quản lý chiến dịch Facebook Automation",
};

import { Toaster } from "@/components/ui/Toaster";
import { ModalProvider } from "@/providers/ModalProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={cn("font-sans dark", inter.variable)} suppressHydrationWarning={true}>
      <body className={inter.className} suppressHydrationWarning={true}>
        <ModalProvider>
          {children}
          <Toaster position="bottom-right" closeButton richColors />
        </ModalProvider>
      </body>
    </html>
  );
}
