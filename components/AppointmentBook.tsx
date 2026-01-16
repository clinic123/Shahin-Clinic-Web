"use client";

import { redirect } from "next/navigation";
import React from "react";
import AppointmentForm from "./AppointmentForm";

type WorkingHour = {
  day: string;
  hours: string[];
};
interface AppointmentFormProps {
  params?: {
    default?: string;
    scope?: boolean;
  };
}

const Appointment: React.FC<AppointmentFormProps> = ({ params }) => {
  const workingHours: WorkingHour[] = [
    { day: "Monday", hours: ["10:00 AM to 5:00 PM", "7:00 PM to 10:00 PM"] },
    { day: "Tuesday", hours: ["10:00 AM to 5:00 PM", "7:00 PM to 10:00 PM"] },
    { day: "Wednesday", hours: ["10:00 AM to 5:00 PM", "7:00 PM to 10:00 PM"] },
    { day: "Saturday", hours: ["10:00 AM to 5:00 PM", "7:00 PM to 10:00 PM"] },
    { day: "Sunday", hours: ["10:00 AM to 5:00 PM", "7:00 PM to 10:00 PM"] },
    { day: "Thursday", hours: ["Close"] },
    { day: "Friday", hours: ["Close"] },
  ];
  const workingHoursScope: WorkingHour[] = [
    { day: "Monday", hours: ["10:00 AM to 5:00 PM", "7:00 PM to 10:00 PM"] },
    { day: "Tuesday", hours: ["10:00 AM to 5:00 PM", "7:00 PM to 10:00 PM"] },
    { day: "Wednesday", hours: ["10:00 AM to 5:00 PM", "7:00 PM to 10:00 PM"] },
    { day: "Saturday", hours: ["10:00 AM to 5:00 PM", "7:00 PM to 10:00 PM"] },
    { day: "Sunday", hours: ["10:00 AM to 5:00 PM", "7:00 PM to 10:00 PM"] },
    { day: "Thursday", hours: ["10:00 AM to 5:00 PM", "7:00 PM to 10:00 PM"] },
    { day: "Friday", hours: ["10:00 AM to 5:00 PM", "7:00 PM to 10:00 PM"] },
  ];

  const show = true;

  if (show) {
    return (
      <section className="container mx-auto">
        <div className="max-w-2xl justify-center mx-auto text-center">
          <div className="text-center mb-5 text-black text-3xl md:text-4xl uppercase font-bold">
            <h1>Book Your Appointment</h1>
            <div className="w-24 h-0.5 bg-primary justify-center mx-auto mt-3"></div>
          </div>
          <p className="text-gray-600 mb-10 text-[16px] md:text-[19px]">
            Schedule your appointment easily by filling out the form. Share your
            details and preferred time, and we’ll confirm your booking right
            away.
          </p>
        </div>

        {/* Responsive 70/30 layout */}
        <div className=" lg:gap-6 gap-6 grid grid-cols-1 lg:grid-cols-12">
          {/* Form Section - 70% on large screens */}
          <div className="lg:col-span-8">
            <AppointmentForm params={params} />
          </div>
          {/* Working Hours - 30% on large screens */}
          <div className="w-full lg:col-span-4 h-[755px] bg-[#EDEDED] text-black p-6 rounded-[10px] shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Working Hours</h2>
            <p className="text-gray-700 mb-3">
              Duis scelerisque faucibus nisi sed lacinia. Curabitur ipsum elit.
            </p>
            <ul>
              {!params?.scope
                ? workingHours.map((day, index) => (
                    <li
                      key={index}
                      className="py-1 space-y-9 border-b border-gray-300 last:border-none flex justify-between text-sm"
                    >
                      <span className="font-medium">{day.day}</span>
                      <span className="text-[12px]">
                        {day.hours.join(", ")}
                      </span>
                    </li>
                  ))
                : workingHoursScope.map((day, index) => (
                    <li
                      key={index}
                      className="py-1 space-y-9 border-b border-gray-300 last:border-none flex justify-between text-sm"
                    >
                      <span className="font-medium">{day.day}</span>
                      <span className="text-[12px]">
                        {day.hours.join(", ")}
                      </span>
                    </li>
                  ))}
            </ul>
          </div>
        </div>
      </section>
    );
  }
  return redirect("/dashboard");
};

export default Appointment;
