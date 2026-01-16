"use client"

import { Card } from "@/components/ui/card"
import { useEffect, useState } from "react"

interface Stats {
  upcoming: number
  cancelled: number
  completed: number
}

export function AppointmentStats() {
  const [stats, setStats] = useState<Stats>({ upcoming: 0, cancelled: 0, completed: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/stats")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStats(data.data)
        }
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-4">
            <div className="h-16 animate-pulse rounded bg-muted" />
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Upcoming</p>
            <p className="text-3xl font-bold text-foreground">{stats.upcoming}</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <span className="text-xl font-bold text-blue-600">{stats.upcoming}</span>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Cancelled</p>
            <p className="text-3xl font-bold text-foreground">{stats.cancelled}</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <span className="text-xl font-bold text-red-600">{stats.cancelled}</span>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Completed</p>
            <p className="text-3xl font-bold text-foreground">{stats.completed}</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <span className="text-xl font-bold text-green-600">{stats.completed}</span>
          </div>
        </div>
      </Card>
    </div>
  )
}
