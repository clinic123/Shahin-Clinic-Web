"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { addDays, format, isBefore } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import PhoneInput from "react-phone-number-input";
import { toast } from "sonner";
import * as z from "zod";

// Components
import { Button, buttonVariants } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Icons
import {
  ArrowLeft,
  ArrowRight,
  CalendarIcon,
  CheckCircle2,
  CreditCard,
  Loader2,
  User,
} from "lucide-react";

// Custom hooks and utils
import { useDoctors } from "@/hooks/useDoctors";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import type { Doctor } from "@/prisma/generated/prisma";

// Import your existing blacklist
import { blacklist } from "@/lib/blacklist-data";

// Updated form schema without symptoms
const appointmentFormSchema = z.object({
  // Step 1: Schedule
  appointmentDate: z.date(),
  appointmentTime: z.string().min(1, { message: "Please select a time." }),

  department: z.string(),
  doctorId: z.string(),
  doctorName: z.string().min(2, { message: "Doctor name is required." }),

  patientName: z
    .string()
    .min(2, { message: "Name must be at least 2 characters." }),
  patientAge: z.coerce.number().min(1).max(100),
  patientGender: z.enum(["Male", "Female", "Other"]),
  mobile: z.string().min(10, { message: "Valid mobile number is required." }),
  email: z.string().email({ message: "Valid email is required." }),

  // Step 3: Payment
  paymentMethod: z.enum(["BKASH", "NAGAD", "ROCKET"]),
  paymentMobile: z.string().min(10),
  paymentTransactionId: z
    .string()
    .regex(/^[A-Z0-9]{8,12}$/, { message: "Invalid transaction ID format." })
    .refine((val) => !blacklist.includes(val.toUpperCase()), {
      message: "This transaction ID is not allowed.",
    }),
  amountPaid: z.coerce.number().min(100),
  appointmentType: z.enum(["IN_PERSON", "VIRTUAL"]),
});

type AppointmentFormValues = z.infer<typeof appointmentFormSchema>;

// Updated steps configuration: Schedule → Personal Info → Payment
const STEPS = [
  {
    id: "schedule",
    title: "Schedule",
    icon: CalendarIcon,
    description: "Choose date & time",
    fields: ["appointmentDate", "appointmentTime", "doctorId", "doctorName"],
  },
  {
    id: "personal",
    title: "Personal Info",
    icon: User,
    description: "Tell us about yourself",
    fields: ["patientName", "patientAge", "patientGender", "mobile", "email"],
  },
  {
    id: "payment",
    title: "Payment",
    icon: CreditCard,
    description: "Complete payment",
    fields: [
      "paymentMethod",
      "paymentMobile",
      "paymentTransactionId",
      "amountPaid",
    ],
  },
];

// Time slots
const TIME_SLOTS = {
  morning: [
    "10:00",
    "11:45",
    "12:00",
    "12:45",
    "1:00",
    "1:45",
    "2:00",
    "2:45",
    "3:00",
    "3:45",
    "4:00",
    "4:45",
    "5:00",
  ],
  evening: ["7:00", "7:45", "8:00", "8:45", "9:00", "9:45", "10:00"],
};

interface AppointmentFormProps {
  params?: {
    default?: string;
    scope?: boolean;
  };
}

export default function AppointmentForm({ params }: AppointmentFormProps) {
  const { data: session } = useSession();
  const [currentStep, setCurrentStep] = useState(0);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const { data: doctorData } = useDoctors();

  const isScopeAppointment = params?.scope === true;

  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentFormSchema as any),
    defaultValues: {
      patientName: "",
      patientAge: 0,
      patientGender: "Male",
      mobile: "",
      email: session?.user?.email || "",
      appointmentDate: addDays(new Date(), 1),
      appointmentTime: "",
      department: "",
      doctorId: "",
      paymentMethod: "BKASH",
      doctorName: selectedDoctor?.name || "",
      paymentMobile: "",
      paymentTransactionId: "",
      amountPaid: 2500,
      appointmentType: params?.scope ? "VIRTUAL" : "IN_PERSON",
    },
    mode: "onChange",
  });

  const appointmentDate = form.watch("appointmentDate");
  const doctorId = form.watch("doctorId");

  // Update doctor details when selected
  useEffect(() => {
    if (doctorData) {
      setFilteredDoctors(doctorData?.doctors);
    }
    if (doctorId && doctorData?.doctors) {
      const doctor = doctorData.doctors.find((d: Doctor) => d.id === doctorId);
      if (doctor) {
        setSelectedDoctor(doctor);
        form.setValue("doctorName", doctor.name);
        form.setValue("department", doctor.specialization);
        form.setValue("amountPaid", doctor.consultationFee);
      }
    }
  }, [doctorId, doctorData, form]);

  // Helper function to format time with leading zero
  const formatTime = (time: string): string => {
    const [hours, minutes] = time.split(":");
    const formattedHours = hours.padStart(2, "0");
    return `${formattedHours}:${minutes || "00"}`;
  };

  // Helper function to format time with AM/PM
  const formatTimeWithAmPm = (time: string): string => {
    if (!time) return "";
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const min = minutes || "00";

    if (hour === 0) {
      return `12:${min} AM`;
    } else if (hour < 12) {
      return `${hour}:${min} AM`;
    } else if (hour === 12) {
      return `12:${min} PM`;
    } else {
      return `${hour - 12}:${min} PM`;
    }
  };

  const createAppointmentMutation = useMutation({
    mutationFn: async (data: AppointmentFormValues) => {
      // Format time to ensure two-digit hours (e.g., "1:00" -> "01:00")
      const formattedTime = formatTime(data.appointmentTime);
      const appointmentDateString = `${format(
        data.appointmentDate,
        "yyyy-MM-dd"
      )}T${formattedTime}:00`;

      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          email: data.email || session?.user?.email || "", // Ensure email is included
          doctorName: data.doctorName || selectedDoctor?.name || "",
          appointmentDate: appointmentDateString,
          appointmentType: data.appointmentType,
          isScope: isScopeAppointment, // Add scope flag
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to create appointment");
      }
      return response.json();
    },
    onSuccess: () => {
      setShowConfirmation(true);
      form.reset();
      setCurrentStep(0);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to book appointment");
    },
  });

  const nextStep = async () => {
    const currentStepConfig = STEPS[currentStep];
    const fields = currentStepConfig.fields;

    const isValid = await form.trigger(fields as any);

    if (isValid) {
      setCurrentStep((prev) => prev + 1);
    } else {
      toast.error("Please fill in all required fields correctly");
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const onSubmit = (data: AppointmentFormValues) => {
    createAppointmentMutation.mutate(data);
    console.log("Appointment Data:", data);
  };

  // Updated date disabled function for scope appointments
  const isDateDisabled = (date: Date) => {
    if (isScopeAppointment) {
      // For scope appointments, only disable past dates
      return isBefore(date, new Date());
    } else {
      // For regular appointments, disable Fridays (5), Saturdays (6) and past dates
      const day = date.getDay();
      return day === 5 || day === 6 || isBefore(date, new Date());
    }
  };

  useEffect(() => {
    if (isScopeAppointment) {
      form.setValue("appointmentTime", "10:00");
    } else {
      form.setValue("appointmentTime", "");
    }
  }, [isScopeAppointment, form]);

  return (
    <div>
      <div>
        {/* Progress Steps */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form Area */}
          <Card className="w-full lg:col-span-3">
            <CardContent className="p-6">
              <div className="flex justify-center mb-8">
                <div className="flex items-center space-x-4">
                  {STEPS.map((step, index) => (
                    <div key={step.id} className="flex items-center">
                      <div
                        className={cn(
                          "flex items-center justify-center w-10 h-10 rounded-full border-2",
                          currentStep >= index
                            ? "bg-primary border-primary text-white"
                            : "border-gray-300 text-gray-500",
                          currentStep === index &&
                            "ring-2 ring-blue-300 ring-offset-2"
                        )}
                      >
                        {currentStep > index ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          <step.icon className="w-5 h-5" />
                        )}
                      </div>
                      {index < STEPS.length - 1 && (
                        <div
                          className={cn(
                            "w-16 h-1",
                            currentStep > index ? "bg-primary" : "bg-gray-300"
                          )}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <AnimatePresence mode="wait">
                    {/* Step 1: Schedule */}
                    {currentStep === 0 && (
                      <motion.div
                        key="schedule"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                      >
                        {isScopeAppointment && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h4 className="font-semibold text-blue-900 mb-2">
                              Scope Appointment
                            </h4>
                            <p className="text-blue-800 text-sm">
                              You are booking a scope appointment. All days are
                              available including weekends.
                            </p>
                          </div>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Date Picker */}
                          <div className="space-y-4">
                            <h3 className="font-semibold">Select Date</h3>
                            <FormField
                              control={form.control}
                              name="appointmentDate"
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Calendar
                                      mode="single"
                                      selected={field.value}
                                      onSelect={field.onChange}
                                      disabled={isDateDisabled}
                                      className="rounded-md border w-full p-3"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 gap-4">
                              <FormField
                                control={form.control}
                                name="doctorId"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Select Doctor *</FormLabel>
                                    <Select
                                      onValueChange={field.onChange}
                                      value={field.value}
                                    >
                                      <FormControl>
                                        <SelectTrigger className="w-full h-14">
                                          <SelectValue placeholder="Choose a doctor" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        {filteredDoctors.map(
                                          (doctor: Doctor) => (
                                            <SelectItem
                                              key={doctor.id}
                                              value={doctor.id}
                                            >
                                              <div className="flex flex-col">
                                                <span>Dr. {doctor.name}</span>
                                                <span className="text-sm text-muted-foreground">
                                                  {doctor.specialization} • ৳
                                                  {doctor.consultationFee}
                                                </span>
                                              </div>
                                            </SelectItem>
                                          )
                                        )}
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            {/* Time Picker - Only show for non-scope appointments */}
                            {!isScopeAppointment && (
                              <div className="space-y-4">
                                <h3 className="font-semibold">
                                  Available Time Slots
                                </h3>
                                <div className="space-y-4 max-h-96 overflow-y-auto">
                                  {/* Morning Session */}
                                  <div>
                                    <h4 className="font-medium text-sm text-muted-foreground mb-2">
                                      Morning (11:00 AM - 5:00 PM)
                                    </h4>
                                    <div className="grid grid-cols-2 gap-2">
                                      {TIME_SLOTS.morning.map((time) => (
                                        <Button
                                          key={time}
                                          type="button"
                                          variant={
                                            form.watch("appointmentTime") ===
                                            time
                                              ? "default"
                                              : "outline"
                                          }
                                          onClick={() =>
                                            form.setValue(
                                              "appointmentTime",
                                              time
                                            )
                                          }
                                          className={cn("justify-start")}
                                        >
                                          {time}{" "}
                                          {parseInt(time) < 12 ? "AM" : "PM"}
                                        </Button>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Evening Session */}
                                  <div>
                                    <h4 className="font-medium text-sm text-muted-foreground mb-2">
                                      Evening (7:00 PM - 10:00 PM)
                                    </h4>
                                    <div className="grid grid-cols-2 gap-2">
                                      {TIME_SLOTS.evening.map((time) => (
                                        <Button
                                          key={time}
                                          type="button"
                                          variant={
                                            form.watch("appointmentTime") ===
                                            time
                                              ? "default"
                                              : "outline"
                                          }
                                          onClick={() =>
                                            form.setValue(
                                              "appointmentTime",
                                              time
                                            )
                                          }
                                          className={cn("justify-start")}
                                        >
                                          {time} PM
                                        </Button>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {isScopeAppointment && (
                              <a
                                href="https://docs.google.com/forms/d/e/1FAIpQLScYr8fH3uAd1cGpDaNLx-O4MKLbvoO9VQFbse_neNQWaa8UAw/viewform"
                                target="_blank"
                                rel="noopener noreferrer"
                                className={buttonVariants()}
                              >
                                Case teking form for scop page
                              </a>
                            )}

                            {/* For scope appointments, set a default time */}
                            {isScopeAppointment && (
                              <FormField
                                control={form.control}
                                name="appointmentTime"
                                render={({ field }) => (
                                  <FormItem className="hidden">
                                    <FormControl>
                                      <Input
                                        {...field}
                                        value="10:00" // Default time for scope appointments
                                      />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                            )}
                          </div>
                        </div>

                        {selectedDoctor && (
                          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                            <h4 className="font-semibold text-primary mb-2">
                              Selected Doctor
                            </h4>
                            <p className="text-primary text-sm">
                              Dr. {selectedDoctor.name} -{" "}
                              {selectedDoctor.specialization}
                            </p>
                            <p className="text-primary text-sm">
                              Consultation Fee: ৳
                              {selectedDoctor.consultationFee}
                            </p>
                          </div>
                        )}
                      </motion.div>
                    )}

                    {/* Step 2: Personal Information */}
                    {currentStep === 1 && (
                      <motion.div
                        key="personal"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="patientName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Full Name *</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Enter your full name"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="patientAge"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Age *</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    placeholder="Your age"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="patientGender"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Gender *</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  value={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger className="w-full">
                                      <SelectValue placeholder="Select gender" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="Male">Male</SelectItem>
                                    <SelectItem value="Female">
                                      Female
                                    </SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="mobile"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Mobile Number *</FormLabel>
                                <FormControl>
                                  <PhoneInput
                                    international
                                    defaultCountry="BD"
                                    placeholder="Enter phone number"
                                    value={field.value}
                                    onChange={field.onChange}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="appointmentType"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Appointment Place *</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  value={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger className="w-full">
                                      <SelectValue placeholder="Select appointment type" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {!params?.scope && (
                                      <SelectItem value="IN_PERSON">
                                        Offline
                                      </SelectItem>
                                    )}
                                    <SelectItem value="VIRTUAL">
                                      Online
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email *</FormLabel>
                                <FormControl>
                                  <Input
                                    type="email"
                                    placeholder="your@email.com"
                                    {...field}
                                    required
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </motion.div>
                    )}

                    {/* Step 3: Payment */}
                    {currentStep === 2 && (
                      <motion.div
                        key="payment"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                      >
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                          <h4 className="font-semibold text-amber-900 mb-2">
                            Payment Instructions
                          </h4>
                          <p className="text-amber-800 text-sm mb-2">
                            Please complete the payment using your preferred
                            method and enter the transaction details below.
                          </p>
                          <p className="text-amber-900 text-sm font-medium">
                            Send payment to <strong>01741540117</strong> via
                            Bkash or Nagad or Rocket
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="paymentMethod"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Payment Method *</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  value={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select payment method" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="BKASH">bKash</SelectItem>
                                    <SelectItem value="NAGAD">Nagad</SelectItem>
                                    <SelectItem value="ROCKET">
                                      Rocket
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="amountPaid"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Consultation Fee</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    disabled
                                    className="bg-muted"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="paymentMobile"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Payment Mobile Number *</FormLabel>
                                <FormControl>
                                  <Input placeholder="01XXXXXXXXX" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="paymentTransactionId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Transaction ID *</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="e.g., B6F9N5T3K8"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        {/* Appointment Summary */}
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <h4 className="font-semibold text-green-900 mb-2">
                            Appointment Summary
                          </h4>
                          <div className="grid grid-cols-2 gap-2 text-sm text-green-800">
                            <div>
                              <span className="font-medium">Date:</span>{" "}
                              {form.watch("appointmentDate") &&
                                format(form.watch("appointmentDate"), "PPP")}
                            </div>
                            <div>
                              <span className="font-medium">Time:</span>{" "}
                              {isScopeAppointment
                                ? "To be assigned"
                                : formatTimeWithAmPm(
                                    form.watch("appointmentTime")
                                  )}
                            </div>
                            <div>
                              <span className="font-medium">Doctor:</span> Dr.{" "}
                              {form.watch("doctorName")}
                            </div>
                            <div>
                              <span className="font-medium">Fee:</span> ৳
                              {form.watch("amountPaid")}
                            </div>
                            {isScopeAppointment && (
                              <div className="col-span-2">
                                <span className="font-medium">Type:</span> Scope
                                Appointment
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Navigation Buttons */}
                  <div className="flex justify-between pt-6 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={prevStep}
                      disabled={currentStep === 0}
                      className="flex items-center gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Previous
                    </Button>

                    {currentStep < STEPS.length - 1 ? (
                      <Button
                        type="button"
                        onClick={nextStep}
                        className="flex items-center gap-2"
                      >
                        Next
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        disabled={createAppointmentMutation.isPending}
                        className="flex items-center gap-2"
                      >
                        {createAppointmentMutation.isPending && (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        )}
                        Confirm Appointment
                      </Button>
                    )}
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="w-6 h-6" />
              Appointment Confirmed!
            </DialogTitle>
            <DialogDescription>
              {isScopeAppointment
                ? "Your scope appointment has been successfully booked. You will receive a confirmation with the assigned time shortly."
                : "Your appointment has been successfully booked. You will receive a confirmation email shortly."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Button
              onClick={() => setShowConfirmation(false)}
              className="w-full"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
