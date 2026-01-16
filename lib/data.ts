export interface Appointment {
  id: string
  patientName: string
  patientEmail: string
  patientPhone: string
  appointmentDate: string
  appointmentTime: string
  status: "upcoming" | "cancelled" | "completed"
  doctorId: string
}

export interface Doctor {
  id: string
  name: string
  credentials: string
  specialty: string
  email: string
  phone: string
  availability: boolean
}

export interface Patient {
  id: string
  name: string
  email: string
  phone: string
  dateOfBirth?: string
  address?: string
}

// Mock data
export const doctors: Doctor[] = [
  {
    id: "doc-1",
    name: "Dr Edalin Hendry",
    credentials: "BDS, MDS - Oral & Maxillofacial Surgery",
    specialty: "Dentist",
    email: "edalin.hendry@doccure.com",
    phone: "+1 555 123 4567",
    availability: true,
  },
]

export const appointments: Appointment[] = [
  {
    id: "APT0001",
    patientName: "Adrian",
    patientEmail: "adrian@example.com",
    patientPhone: "+1504 368 6874",
    appointmentDate: "2025-11-11",
    appointmentTime: "10:45 AM",
    status: "upcoming",
    doctorId: "doc-1",
  },
  {
    id: "APT0002",
    patientName: "Kelly New",
    patientEmail: "kelly@example.com",
    patientPhone: "+1 832 891 8403",
    appointmentDate: "2025-11-05",
    appointmentTime: "11:50 AM",
    status: "upcoming",
    doctorId: "doc-1",
  },
  {
    id: "APT0003",
    patientName: "Samuel",
    patientEmail: "samuel@example.com",
    patientPhone: "+1 749 104 6291",
    appointmentDate: "2025-10-27",
    appointmentTime: "09:30 AM",
    status: "upcoming",
    doctorId: "doc-1",
  },
  {
    id: "APT0004",
    patientName: "Catherine",
    patientEmail: "catherine@example.com",
    patientPhone: "+1 584 920 7183",
    appointmentDate: "2025-10-18",
    appointmentTime: "12:20 PM",
    status: "upcoming",
    doctorId: "doc-1",
  },
  {
    id: "APT0005",
    patientName: "Robert",
    patientEmail: "robert@example.com",
    patientPhone: "+1059 327 6729",
    appointmentDate: "2025-10-10",
    appointmentTime: "11:30 AM",
    status: "completed",
    doctorId: "doc-1",
  },
  {
    id: "APT0006",
    patientName: "Anderea",
    patientEmail: "anderea@example.com",
    patientPhone: "+1 278 402 7103",
    appointmentDate: "2025-09-26",
    appointmentTime: "10:20 AM",
    status: "completed",
    doctorId: "doc-1",
  },
  {
    id: "APT0007",
    patientName: "Peter",
    patientEmail: "peter@example.com",
    patientPhone: "+1 638 278 0249",
    appointmentDate: "2025-09-14",
    appointmentTime: "08:10 AM",
    status: "completed",
    doctorId: "doc-1",
  },
  {
    id: "APT0008",
    patientName: "Emily",
    patientEmail: "emily@example.com",
    patientPhone: "+1 261 039 1873",
    appointmentDate: "2025-09-03",
    appointmentTime: "06:00 PM",
    status: "completed",
    doctorId: "doc-1",
  },
]

export const patients: Patient[] = [
  {
    id: "pat-1",
    name: "Adrian",
    email: "adrian@example.com",
    phone: "+1504 368 6874",
  },
  {
    id: "pat-2",
    name: "Kelly New",
    email: "kelly@example.com",
    phone: "+1 832 891 8403",
  },
  {
    id: "pat-3",
    name: "Samuel",
    email: "samuel@example.com",
    phone: "+1 749 104 6291",
  },
  {
    id: "pat-4",
    name: "Catherine",
    email: "catherine@example.com",
    phone: "+1 584 920 7183",
  },
  {
    id: "pat-5",
    name: "Robert",
    email: "robert@example.com",
    phone: "+1059 327 6729",
  },
  {
    id: "pat-6",
    name: "Anderea",
    email: "anderea@example.com",
    phone: "+1 278 402 7103",
  },
  {
    id: "pat-7",
    name: "Peter",
    email: "peter@example.com",
    phone: "+1 638 278 0249",
  },
  {
    id: "pat-8",
    name: "Emily",
    email: "emily@example.com",
    phone: "+1 261 039 1873",
  },
]
