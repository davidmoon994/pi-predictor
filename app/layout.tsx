// app/layout.tsx

import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import GlobalStateListener from "./components/GlobalStateListener";

export const metadata = {
  title: "Pi 大陆",
  description: "Pi blue sky",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh">
     <body
  className="text-black min-h-screen"
  style={{ backgroundColor: '#ffffff', backgroundImage: 'none' }}
>

        <AuthProvider>
          <GlobalStateListener />
          <main className="max-w-7xl mx-auto p-4">
            {children} {/* ✅ 渲染 page.tsx 的页面内容 */}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
