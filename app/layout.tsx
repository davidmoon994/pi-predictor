// app/layout.tsx
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "Pi 大陆",
  description: "预测 Pi 币涨跌",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh">
      <body className="bg-gray-900 text-white min-h-screen">
        <AuthProvider>
          <Navbar />
          <div className="max-w-7xl mx-auto p-4">{children}</div>
        </AuthProvider>
      </body>
    </html>
  );
}