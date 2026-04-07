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
  title: {
    default: "Akram Boussanni",
    template: "%s | Akram Boussanni",
  },
  description: "Personal site of Akram Boussanni: projects, technical writing, and systems work.",
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const themeBootstrapScript = `(() => {
    try {
      const saved = localStorage.getItem("portfolio-theme-mode") ?? localStorage.getItem("portfolio-theme");
      const next = saved === "light" ? "light" : "dark";
      const root = document.documentElement;
      root.classList.remove("dark", "light");
      root.classList.add(next);
    } catch {
      document.documentElement.classList.remove("light");
      document.documentElement.classList.add("dark");
    }
  })();`;

  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${inter.variable} h-full antialiased`}>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        />
        <script dangerouslySetInnerHTML={{ __html: themeBootstrapScript }} />
      </head>
      <body className="min-h-full flex flex-col">
        <AmbientPointer />
        {children}
      </body>
    </html>
  );
}
