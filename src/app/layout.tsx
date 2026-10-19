import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SiteChrome from "@/components/site-chrome";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MORJAL Enterprises - Electrical Safety Products",
  description: "Premium electrical safety equipment and PPE for industrial and workplace safety",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
