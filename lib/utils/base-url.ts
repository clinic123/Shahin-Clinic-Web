const getBaseUrl = (): string => {
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL;
  }

  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "http://localhost:3000";
};

export default getBaseUrl;

