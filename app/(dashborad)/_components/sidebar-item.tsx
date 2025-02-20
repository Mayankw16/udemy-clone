"use client";

import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

interface SidebarItemProps {
  icon: LucideIcon;
  label: string;
  href: string;
}

export const SidebarItem = ({ icon: Icon, label, href }: SidebarItemProps) => {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = pathname === href || pathname.startsWith(`${href}/`);

  const onClick = () => router.push(href);

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-x-2 text-sm text-slate-500 font-medium pl-6 transition-all hover:text-slate-600 hover:bg-slate-300/20",
        isActive &&
          "text-purple-700 bg-purple-200/20 hover:text-purple-700 hover:bg-purple-200/20"
      )}
    >
      <div className="flex items-center gap-x-2 py-4">
        <Icon
          size={22}
          className={cn("text-slate-500", isActive && "text-purple-700")}
        />
        {label}
      </div>
      <div
        className={cn(
          "ml-auto opacity-0 border-2 border-purple-700 h-full transition-all",
          isActive && "opacity-100"
        )}
      />
    </button>
  );
};
