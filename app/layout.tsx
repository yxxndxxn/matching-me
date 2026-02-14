import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Toaster } from "@/components/ui/sonner";

import { AppShell } from "@/components/common/AppShell";
import dogLogo from "@/app/assets/dog_Logo.png";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "매칭미?",
  description: "남도학숙생을 위한 룸메이트 매칭 플랫폼. 나와 맞는 룸메이트를 찾아보세요.",
  icons: {
    icon: dogLogo.src,
  },
  verification: {
    google: "TdpLrpGXs_0TcjehcR24Y8tTC5-FZRgS92Rq5OPAA-4",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AppShell>{children}</AppShell>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            classNames: { title: "!text-center", description: "!text-center" },
          }}
        />
        <SpeedInsights />
      </body>
    </html>
  );
}
