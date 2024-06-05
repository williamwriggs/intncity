import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/auth/Hooks"

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "INTNCTY Tree App",
  description: "A tree planting reporting tool."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <AuthProvider>
        <body className={inter.className}>{children}</body>
      </AuthProvider>
    </html>
  );
}
