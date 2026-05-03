'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface Props {
  showAdminLink?: boolean;
  dark?: boolean;
}

export default function Header({ showAdminLink = true, dark = false }: Props) {
  return (
    <motion.header
      initial={{ y: -8, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={`relative z-50 border-b ${
        dark
          ? 'bg-white/10 backdrop-blur-xl border-white/15'
          : 'bg-white/90 backdrop-blur-xl border-black/[0.06] shadow-sm'
      }`}
    >
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo — affiché en rectangle pour respecter le format paysage */}
        <Link href="/" className="flex items-center group">
          <div className="relative h-10 w-44 overflow-hidden">
            <Image
              src="/logo.png"
              alt="La Compassion Bruxelles"
              fill
              sizes="176px"
              loading="eager"
              priority
              className="object-contain object-left"
            />
          </div>
        </Link>

        {showAdminLink && (
          <Link
            href="/admin/login"
            className={`flex items-center gap-1.5 text-xs font-medium transition-colors px-3 py-2 rounded-lg
              ${dark
                ? 'text-white/70 hover:text-white hover:bg-white/10'
                : 'text-[#8B7AAF] hover:text-[#5E0FAB] hover:bg-[#F0EAFF]'
              }`}
          >
            <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth={2}>
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
            </svg>
            Espace pasteur
          </Link>
        )}
      </div>
    </motion.header>
  );
}
