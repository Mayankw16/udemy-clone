"use client";

import qs from "query-string";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { Input } from "./ui/input";

export const SearchInput = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [value, setValue] = useState(searchParams.get("title") || "");
  const debounsedValue = useDebounce(value);

  const currentCategoryId = searchParams.get("categoryId");

  useEffect(() => {
    const url = qs.stringifyUrl(
      {
        url: pathname,
        query: {
          categoryId: currentCategoryId,
          title: debounsedValue,
        },
      },
      { skipEmptyString: true, skipNull: true },
    );
    router.push(url);
  }, [debounsedValue, pathname, currentCategoryId, router]);

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
