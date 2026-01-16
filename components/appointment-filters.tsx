"use client"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Search } from "lucide-react"

interface AppointmentFiltersProps {
  onSearchChange: (value: string) => void
  onStatusChange: (value: string) => void
  onDateRangeChange: (start: string, end: string) => void
}

export function AppointmentFilters({ onSearchChange, onStatusChange, onDateRangeChange }: AppointmentFiltersProps) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      {/* Search */}
      <div className="relative flex-1 lg:max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search by patient name or email..."
          className="pl-9"
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Date Range */}
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <Input
            type="date"
            className="w-40"
            onChange={(e) => {
              const endDate = new Date()
              endDate.setDate(endDate.getDate() + 7)
              onDateRangeChange(e.target.value, endDate.toISOString().split("T")[0])
            }}
          />
          <span className="text-sm text-muted-foreground">-</span>
          <Input
            type="date"
            className="w-40"
            onChange={(e) => {
              const startDate = new Date()
              startDate.setDate(startDate.getDate() - 7)
              onDateRangeChange(startDate.toISOString().split("T")[0], e.target.value)
            }}
          />
        </div>

        {/* Status Filter */}
        <Select onValueChange={onStatusChange} defaultValue="all">
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter By" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="upcoming">Upcoming</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
