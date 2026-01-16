import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Filters {
  status: string;
  search: string;
  paymentMethod: string;
  page: number;
  limit: number;
}

interface CourseOrdersFiltersProps {
  filters: Filters;
  setFilters: (filters: Filters) => void;
}

export function CourseOrdersFilters({
  filters,
  setFilters,
}: CourseOrdersFiltersProps) {
  return (
    <div className="flex gap-4 mb-6">
      <Input
        placeholder="Search by name, email, course, transaction ID..."
        value={filters.search}
        onChange={(e) =>
          setFilters({ ...filters, search: e.target.value, page: 1 })
        }
        className="max-w-sm"
      />
      <Select
        value={filters.status}
        onValueChange={(value) =>
          setFilters({ ...filters, status: value, page: 1 })
        }
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="PENDING">Pending</SelectItem>
          <SelectItem value="CONFIRMED">Confirmed</SelectItem>
          <SelectItem value="ACCESS_GRANTED">Access Granted</SelectItem>
          <SelectItem value="CANCELLED">Cancelled</SelectItem>
          <SelectItem value="COMPLETED">Completed</SelectItem>
        </SelectContent>
      </Select>
      <Select
        value={filters.paymentMethod}
        onValueChange={(value) =>
          setFilters({ ...filters, paymentMethod: value, page: 1 })
        }
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Payment Method" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Methods</SelectItem>
          <SelectItem value="BKASH">bKash</SelectItem>
          <SelectItem value="NAGAD">Nagad</SelectItem>
          <SelectItem value="ROCKET">Rocket</SelectItem>
        </SelectContent>
      </Select>
      <Button
        variant="outline"
        onClick={() =>
          setFilters({
            status: "",
            search: "",
            paymentMethod: "",
            page: 1,
            limit: 10,
          })
        }
      >
        Reset
      </Button>
    </div>
  );
}
