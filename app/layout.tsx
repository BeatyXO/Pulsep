import type { Metadata } from 'next';
import { Sora } from 'next/font/google';
import './globals.css';

const sora = Sora({ subsets: ['latin'], variable: '--font-sora' });

export const metadata: Metadata = {
  title: 'Pulsep — Evidence-bound reliability pacts',
  description: 'Recurring GenLayer SLA settlement from independently evaluated public evidence.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={sora.variable}>{children}</body>
    </html>
  );
}
