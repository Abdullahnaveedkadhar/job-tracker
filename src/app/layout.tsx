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

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://job-tracker-phi-one.vercel.app";

const title = "Job Tracker";
const description =
  "Find UK graduate roles, rank them against your profile, track every application, and export tailored CVs and cover letters as Word documents.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: title,
    template: "%s · Job Tracker",
  },
  description,
  applicationName: title,
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: title,
    title,
    description,
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
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
