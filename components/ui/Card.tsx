import type { HTMLAttributes } from 'react';

interface Props extends HTMLAttributes<HTMLDivElement> {
  glass?: boolean;
}

export default function Card({ children, className = '', glass, ...props }: Props) {
  const base = glass
    ? 'bg-white/75 backdrop-blur-sm border border-white/70 shadow-lg rounded-2xl'
    : 'bg-white border border-[#EDE6FF] shadow-sm rounded-2xl';

  return (
    <div className={`${base} ${className}`} {...props}>
      {children}
    </div>
  );
}
