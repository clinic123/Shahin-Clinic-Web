"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Appointment } from "@/lib/data";
import { Mail, Phone } from "lucide-react";

interface AppointmentCardProps {
  appointment: Appointment;
  onStartNow?: (id: string) => void;
}

export function AppointmentCard({
  appointment,
  onStartNow,
}: AppointmentCardProps) {
  const formatDate = (dateStr: string, timeStr: string) => {
    const date = new Date(dateStr);
    const day = date.getDate().toString().padStart(2, "0");
    const month = date.toLocaleString("en-US", { month: "short" });
    const year = date.getFullYear();
    return `${day} ${month} ${year} ${timeStr}`;
  };

  return (
    <Card className="p-4 transition-shadow hover:shadow-md">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 space-y-2">
          {/* Appointment ID */}
          <div className="text-sm font-semibold text-primary">
            #{appointment.id}
          </div>

          {/* Patient Name */}
          <h3 className="text-lg font-semibold text-foreground">
            {appointment.patientName}
          </h3>

          {/* Date and Time */}
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <span className="text-primary">•</span>
            <span>
              {formatDate(
                appointment.appointmentDate,
                appointment.appointmentTime
              )}
            </span>
          </div>

          {/* Contact Info */}
          <div className="flex flex-col gap-1 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Mail className="h-3.5 w-3.5" />
              <span>{appointment.patientEmail}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-3.5 w-3.5" />
              <span>{appointment.patientPhone}</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center">
          <Button
            onClick={() => onStartNow?.(appointment.id)}
            className="w-full sm:w-auto"
            variant={appointment.status === "completed" ? "outline" : "default"}
          >
            {appointment.status === "completed" ? "View Details" : "Start Now"}
          </Button>
        </div>
      </div>
    </Card>
  );
}
