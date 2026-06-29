import type { Metadata } from "next";
import { Manrope, Cormorant_Garamond } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { CustomerAuthProvider } from "@/contexts/CustomerAuthContext";
import ChatWidget from "@/components/chatbot/ChatWidget";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Hotel Hoang Minh",
  description: "Không gian nghỉ dưỡng tiện nghi ngay trung tâm. Phòng sạch đẹp – Giá hợp lý – Check-in nhanh",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning className={`${manrope.variable} ${cormorant.variable} h-full antialiased`}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-on-background overflow-x-hidden font-sans">
        <CustomerAuthProvider>
          {children}
          <Toaster position="top-center" />
          <ChatWidget />
        </CustomerAuthProvider>
      </body>
    </html>
  );
}
