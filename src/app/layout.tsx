import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { DatabaseSetupBanner } from "@/components/DatabaseSetupBanner";
import { Nav } from "@/components/Nav";
import { ThemeProvider } from "@/components/ThemeProvider";
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
  title: "Job Tracker",
  description: "Track job applications, weekly targets, and tailored CVs",
};

const themeScript = `
(function() {
  try {
    var t = localStorage.getItem('job-tracker-theme');
    var d = t === 'dark' || t === 'light' ? t : (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', d);
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en-GB"
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full antialiased">
        <ThemeProvider>
          <Nav />
          <main className="mx-auto max-w-6xl flex-1 px-4 py-8 sm:px-6">
            <DatabaseSetupBanner />
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
