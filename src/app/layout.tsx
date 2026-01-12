import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'IKP Asystent Kardiologiczny',
  description: 'Asystent wstępnej kwalifikacji kardiologicznej - przygotowanie do wizyty u specjalisty',
  keywords: ['kardiologia', 'IKP', 'pacjent', 'triaz', 'wywiad lekarski'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
