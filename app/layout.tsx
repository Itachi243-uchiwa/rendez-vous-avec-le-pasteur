import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  style: ['normal', 'italic'],
});

export const metadata: Metadata = {
  title: 'Rendez-vous pastoral | La Compassion Bruxelles',
  description: 'Réservez un moment d\'échange avec le pasteur après le culte. Simple, rapide, sans inscription.',
  icons: { icon: '/logo.png' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${inter.variable} ${playfair.variable} h-full`}>
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: '#3D0870',
              color: '#fff',
              fontFamily: 'var(--font-inter)',
              borderRadius: '14px',
              padding: '12px 20px',
              boxShadow: '0 8px 30px rgba(94,15,171,0.25)',
            },
            success: { iconTheme: { primary: '#C2185B', secondary: '#fff' } },
          }}
        />
      </body>
    </html>
  );
}
