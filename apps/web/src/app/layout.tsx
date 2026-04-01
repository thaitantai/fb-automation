import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const mainFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700"]
});

export const metadata: Metadata = {
  title: "FB Automate Pro",
  description: "Hệ thống quản lý chiến dịch Facebook Automation cao cấp",
};

import { Toaster } from "@/components/ui/Toaster";
import { ModalProvider } from "@/providers/ModalProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={cn("dark", mainFont.variable)} suppressHydrationWarning={true}>
      <body className={cn(mainFont.className, "antialiased")} suppressHydrationWarning={true}>
        <ModalProvider>
          {children}
          <Toaster position="bottom-right" closeButton richColors />
        </ModalProvider>
      </body>
    </html>
  );
}
