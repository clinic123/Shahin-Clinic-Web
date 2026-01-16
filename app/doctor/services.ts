import { User } from "@/lib/auth";

export const fetchDoctorsService = async () => {
  const response = await fetch("/api/doctors/get-all");

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `HTTP error! status: ${response.status}`;
    try {
      const errorData = JSON.parse(errorText);
      errorMessage = errorData.error || errorData.message || errorMessage;
    } catch {
      errorMessage = errorText || errorMessage;
    }

    throw new Error(errorMessage);
  }
  try {
    return await response.json();
  } catch (error) {
    throw new Error("Invalid JSON response from server");
  }
};

const fetchDoctor = async (): Promise<{
  user: User;
}> => {
  const response = await fetch(`/api/doctors/get-all`);

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `HTTP error! status: ${response.status}`;
    try {
      const errorData = JSON.parse(errorText);
      errorMessage = errorData.error || errorData.message || errorMessage;
    } catch {
      errorMessage = errorText || errorMessage;
    }

    throw new Error(errorMessage);
  }

  try {
    return await response.json();
  } catch (error) {
    throw new Error("Invalid JSON response from server");
  }
};
