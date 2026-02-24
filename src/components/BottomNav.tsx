"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function DumbbellIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="9.5" width="4" height="5" rx="1.5" />
      <rect x="18" y="9.5" width="4" height="5" rx="1.5" />
      <rect x="5.5" y="7.5" width="2.5" height="9" rx="1" />
      <rect x="16" y="7.5" width="2.5" height="9" rx="1" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="9" />
      <polyline points="12 7 12 12 15.5 15.5" />
    </svg>
  );
}

function TrophyIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 21h8" />
      <path d="M12 17v4" />
      <path d="M5 4H3a1 1 0 00-1 1v2a5 5 0 005 5h1" />
      <path d="M19 4h2a1 1 0 011 1v2a5 5 0 01-5 5h-1" />
      <path d="M7 4h10v7a5 5 0 01-10 0V4z" />
    </svg>
  );
}

const items = [
  { href: "/", label: "今日", Icon: DumbbellIcon },
  { href: "/history", label: "履歴", Icon: ClockIcon },
  { href: "/pr", label: "ベスト", Icon: TrophyIcon },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-zinc-200 bg-white/95 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/95">
      <div className="mx-auto flex max-w-md items-center justify-around pb-safe">
        {items.map(({ href, label, Icon }) => {
          const isActive =
            href === "/" ? pathname === "/" : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className="flex flex-1 flex-col items-center gap-0.5 py-2.5 transition-opacity active:opacity-60"
            >
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-2xl transition-colors ${
                  isActive
                    ? "bg-emerald-50 dark:bg-emerald-900/40"
                    : "bg-transparent"
                }`}
              >
                <Icon
                  className={`h-5 w-5 transition-colors ${
                    isActive
                      ? "stroke-emerald-600 dark:stroke-emerald-400"
                      : "stroke-zinc-400 dark:stroke-zinc-500"
                  }`}
                />
              </span>
              <span
                className={`text-[0.65rem] font-medium transition-colors ${
                  isActive
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-zinc-400 dark:text-zinc-500"
                }`}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
