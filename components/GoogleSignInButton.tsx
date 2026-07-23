"use client";

import { signIn } from "next-auth/react";

type GoogleSignInButtonProps = {
  callbackUrl: string;
  label: string;
};

export default function GoogleSignInButton({ callbackUrl, label }: GoogleSignInButtonProps) {
  return (
    <button
      type="button"
      onClick={() => void signIn("google", { callbackUrl })}
      className="flex w-full items-center justify-center gap-3 rounded-2xl bg-[#0F172A] px-5 py-4 text-sm font-semibold text-white shadow-lg shadow-[#0F172A]/15 transition hover:bg-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#C5A059] focus:ring-offset-2 dark:bg-[#E2B857] dark:text-[#0F172A] dark:hover:bg-[#D4AF37]"
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5">
        <path fill="currentColor" d="M21.35 12.27c0-.72-.06-1.42-.18-2.09H12v3.96h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.91-4.18 2.91-7.26Z" />
        <path fill="currentColor" d="M12 21.75c2.63 0 4.84-.87 6.45-2.37l-3.14-2.45c-.87.58-1.98.93-3.31.93-2.54 0-4.7-1.72-5.47-4.03H3.28v2.53A9.74 9.74 0 0 0 12 21.75Z" opacity=".85" />
        <path fill="currentColor" d="M6.53 13.83a5.86 5.86 0 0 1 0-3.66V7.64H3.28a9.75 9.75 0 0 0 0 8.72l3.25-2.53Z" opacity=".7" />
        <path fill="currentColor" d="M12 6.14c1.43 0 2.71.49 3.73 1.46l2.8-2.8C16.84 3.23 14.63 2.25 12 2.25a9.74 9.74 0 0 0-8.72 5.39l3.25 2.53C7.3 7.86 9.46 6.14 12 6.14Z" opacity=".55" />
      </svg>
      {label}
    </button>
  );
}
