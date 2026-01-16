// lib/serial-service.ts
import { PrismaClient } from "@/prisma/generated/prisma";

const prisma = new PrismaClient();

export async function getNextAppointmentSerial(): Promise<number> {
  const counter = await prisma.counter.upsert({
    where: { name: "appointment" },
    update: { value: { increment: 1 } },
    create: { name: "appointment", value: 1 },
  });
  return counter.value;
}
