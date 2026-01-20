import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-outfit'
});

export const metadata: Metadata = {
  title: "Centrepoint | The Heart of your Community",
  description: "Modern church management and outreach platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={outfit.variable}>
      <body className="antialiased font-sans">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
