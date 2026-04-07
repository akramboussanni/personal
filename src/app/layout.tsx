import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { AmbientPointer } from "@/components/ambient-pointer";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-headline",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AKRAMB.COM | Portfolio",
  description: "Portfolio website built from the custom template aesthetic.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${inter.variable} dark h-full antialiased`}>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        />
      </head>
      <body className="min-h-full flex flex-col">
        <AmbientPointer />
        {children}
      </body>
    </html>
  );
}
