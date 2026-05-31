import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/hooks/useAuth';
import './globals.css';

export const metadata: Metadata = {
  title: 'LoanSphere — Loan Management System',
  description: 'Modern lending platform for borrowers and executives',
  icons: {
    icon: '/loansphere_logo.svg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&family=Lora:wght@500;600&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans bg-slate-950 text-slate-100 antialiased">
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: { background: '#1e293b', color: '#f1f5f9', border: '1px solid #334155' },
              success: { iconTheme: { primary: '#6470f3', secondary: '#fff' } },
              error: { iconTheme: { primary: '#f43f5e', secondary: '#fff' } },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
