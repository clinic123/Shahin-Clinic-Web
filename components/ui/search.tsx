"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { useDebouncedCallback } from "use-debounce";
export default function Search() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const handleSearch = useDebouncedCallback((term) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set("search", term);
    } else {
      params.delete("search");
    }
    // Reset to page 1 when search changes
    params.delete("page");
    replace(`${pathname}?${params.toString()}`);
  }, 300);
  return (
    <div className="relative flex flex-1 flex-shrink-0">
      <label htmlFor="search" className="sr-only">
        Search
      </label>
      <input
        className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
        placeholder="Search"
        onChange={(e) => {
          handleSearch(e.target.value);
        }}
        defaultValue={searchParams.get("search")?.toString()}
      />
      <FaMagnifyingGlass className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
    </div>
  );
}
