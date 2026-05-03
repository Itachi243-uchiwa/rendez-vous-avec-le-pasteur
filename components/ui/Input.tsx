import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-semibold text-[#3D0870]">{label}</label>}
      <input
        className={`w-full px-4 py-3 rounded-xl border border-[#EDE6FF] bg-white text-[#2D1B5E]
          placeholder:text-[#B8A8D0] focus:border-[#8B31D4] focus:ring-2 focus:ring-[#8B31D4]/15
          transition-all outline-none text-sm ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

export function Textarea({ label, error, className = '', ...props }: TextareaProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-semibold text-[#3D0870]">{label}</label>}
      <textarea
        className={`w-full px-4 py-3 rounded-xl border border-[#EDE6FF] bg-white text-[#2D1B5E]
          placeholder:text-[#B8A8D0] focus:border-[#8B31D4] focus:ring-2 focus:ring-[#8B31D4]/15
          transition-all outline-none text-sm resize-none ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
