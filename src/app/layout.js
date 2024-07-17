import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/auth/Hooks"
import { AppContextProvider } from "@/context/appContext"

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "INTNCTY Tree App",
  description: "A tree planting reporting tool."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <AuthProvider>
        <AppContextProvider>
          <body className={inter.className}>{children}</body>
        </AppContextProvider>
      </AuthProvider>
    </html>
  );
}
