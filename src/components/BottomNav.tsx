"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  href: string;
  label: string;
};

const items: NavItem[] = [
  { href: "/", label: "今日" },
  { href: "/history", label: "履歴" },
  { href: "/pr", label: "ベスト" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 border-t border-zinc-200 bg-white/95 pb-safe pt-2 shadow-[0_-4px_12px_rgba(15,23,42,0.06)] backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/95">
      <div className="mx-auto flex max-w-md items-center justify-around px-4">
        {items.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center gap-0.5 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                isActive
                  ? "text-zinc-900 dark:text-zinc-50"
                  : "text-zinc-500 dark:text-zinc-400"
              }`}
            >
              <span
                className={`h-6 w-6 rounded-full border text-[0.6rem] leading-6 ${
                  isActive
                    ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-50 dark:bg-zinc-50 dark:text-zinc-900"
                    : "border-zinc-300 bg-zinc-100 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                }`}
              >
                {item.label[0]}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

