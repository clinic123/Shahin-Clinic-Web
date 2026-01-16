// components/appointments/AppointmentFilters.tsx
"use client";

import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

interface AppointmentFiltersProps {
  currentFilters?: {
    status?: string;
    sort?: string;
    search?: string;
    doctorName?: string;
    department?: string;
    dateFrom?: string;
    dateTo?: string;
  };
}

const AppointmentFilters = ({ currentFilters }: AppointmentFiltersProps) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);

  // Initialize dates from URL params
  useEffect(() => {
    const from = searchParams.get("dateFrom");
    const to = searchParams.get("dateTo");

    setDateFrom(from ? new Date(from) : undefined);
    setDateTo(to ? new Date(to) : undefined);
  }, [searchParams]);

  const handleFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleDateFromChange = (date: Date | undefined) => {
    setDateFrom(date);
    const params = new URLSearchParams(searchParams);

    if (date) {
      params.set("dateFrom", format(date, "yyyy-MM-dd"));
    } else {
      params.delete("dateFrom");
    }

    params.delete("page");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleDateToChange = (date: Date | undefined) => {
    setDateTo(date);
    const params = new URLSearchParams(searchParams);

    if (date) {
      params.set("dateTo", format(date, "yyyy-MM-dd"));
    } else {
      params.delete("dateTo");
    }

    params.delete("page");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const clearFilters = () => {
    setDateFrom(undefined);
    setDateTo(undefined);
    router.push(pathname, { scroll: false });
  };

  const hasActiveFilters = Array.from(searchParams.entries()).some(
    ([key, value]) => !["sort", "page"].includes(key) && value
  );

  return (
    <div className="space-y-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div className="space-y-2">
          <Label htmlFor="search">Search</Label>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Search patients, doctors, departments..."
              value={searchParams.get("search") || ""}
              onChange={(e) => handleFilter("search", e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        {/* Status Filter */}
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={searchParams.get("status") || "all"}
            onValueChange={(value) => handleFilter("status", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="CONFIRMED">Confirmed</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Doctor Filter */}
        <div className="space-y-2">
          <Label htmlFor="doctorName">Doctor</Label>
          <Input
            id="doctorName"
            placeholder="Filter by doctor..."
            value={searchParams.get("doctorName") || ""}
            onChange={(e) => handleFilter("doctorName", e.target.value)}
          />
        </div>

        {/* Department Filter */}
        <div className="space-y-2">
          <Label htmlFor="department">Department</Label>
          <Input
            id="department"
            placeholder="Filter by department..."
            value={searchParams.get("department") || ""}
            onChange={(e) => handleFilter("department", e.target.value)}
          />
        </div>
      </div>

      {/* Date Range and Sort */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="dateFrom">From Date</Label>
          <DatePicker
            value={dateFrom}
            onChange={handleDateFromChange}
            placeholder="Start date"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dateTo">To Date</Label>
          <DatePicker
            value={dateTo}
            onChange={handleDateToChange}
            placeholder="End date"
          />
        </div>
        <div className="space-y-2 flex items-end gap-2">
          <div className="flex-1">
            <Label htmlFor="sort">Sort By</Label>
            <Select
              value={searchParams.get("sort") || "newest"}
              onValueChange={(value) => handleFilter("sort", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="date_asc">Date: Earliest</SelectItem>
                <SelectItem value="date_desc">Date: Latest</SelectItem>
                <SelectItem value="patient_asc">Patient: A-Z</SelectItem>
                <SelectItem value="patient_desc">Patient: Z-A</SelectItem>
                <SelectItem value="doctor_asc">Doctor: A-Z</SelectItem>
                <SelectItem value="doctor_desc">Doctor: Z-A</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {hasActiveFilters && (
            <Button variant="outline" onClick={clearFilters} className="mt-6">
              Clear Filters
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppointmentFilters;
