import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SiteChrome from "@/components/site-chrome";
import AuthSessionProvider from "@/components/auth/session-provider";

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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'LocalBusiness',
              name: 'MORJAL Enterprises',
              address: {
                '@type': 'PostalAddress',
                streetAddress: 'Kaprain',
                addressLocality: 'Bundi',
                addressRegion: 'Rajasthan',
                postalCode: '323301',
                addressCountry: 'IN',
              },
            }),
          }}
        />
        <AuthSessionProvider>
          <SiteChrome>{children}</SiteChrome>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
