"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FC } from "react";

interface ItemType {
  value: string;
  label: string;
}
interface Props {
  items?: ItemType[];
}

const SortFilter: FC<Props> = ({ items }) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const currentSort = searchParams.get("sort") || "newest";

  const handleFilter = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value === "newest") {
      params.delete("sort");
    } else {
      params.set("sort", value);
    }
    // Reset to page 1 when sort changes
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex items-center justify-end gap-2 text-sm text-gray-500">
      <span>Sort by:</span>
      <Select name="sort" value={currentSort} onValueChange={(e) => handleFilter(e)}>
        <SelectTrigger id="sort" className="w-[110px]">
          <SelectValue placeholder="Select sort" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="oldest">Oldest</SelectItem>
            <SelectItem value="title_asc">Title (A-Z)</SelectItem>
            <SelectItem value="title_desc">Title (Z-A)</SelectItem>
            {items?.map((item) => (
              <SelectItem value={item.value} key={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

export default SortFilter;
