"use client";

import qs from "query-string";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "./ui/input";

export const SearchInput = () => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [value, setValue] = useState(searchParams.get("title") || "");

  const currentCategoryId = searchParams.get("categoryId");

  useEffect(() => {
    const timemout = setTimeout(() => {
      const url = qs.stringifyUrl(
        {
          url: pathname,
          query: {
            categoryId: currentCategoryId,
            title: value,
          },
        },
        { skipEmptyString: true, skipNull: true }
      );
      router.push(url);
    }, 500);

    return () => clearTimeout(timemout);
  }, [value]);

  return (
    <div className="relative">
      <Search className="w-4 h-4 absolute top-3 left-3 text-slate-600" />
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search for a course"
        className="w-full pl-9 rounded-full bg-slate-100 focus-visible:ring-slate-200"
      />
    </div>
  );
};
