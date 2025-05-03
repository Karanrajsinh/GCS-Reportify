import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { ThemeProvider } from "@/app/components/theme-provider";
import { Toaster } from "@/app/components/ui/sonner";
import { ReactQueryProvider } from '@/lib/react-query-provider';
import { ReportConfigProvider } from '@/contexts/report-config-context';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'GSC Reportify - Custom Report Builder',
  description: 'Build custom reports with Google Search Console data and Gemini API analysis',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <ReactQueryProvider>
              <ReportConfigProvider>
                {children}
                <Toaster />
              </ReportConfigProvider>
            </ReactQueryProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}