"use server";

import { redirect } from "next/navigation";
import { auth } from "../auth";
import { getServerSession } from "../get-session";

export const signUp = async (
  email: string,
  password: string,
  name: string,
  callbackURL?: string
) => {
  const result = await auth.api.signUpEmail({
    body: {
      email,
      password,
      name,
      callbackURL: callbackURL || "/",
    },
  });

  return result;
};

export const signIn = async (
  email: string,
  password: string,
  callbackURL?: string
) => {
  const result = await auth.api.signInEmail({
    body: {
      email,
      password,
      callbackURL: callbackURL || "/",
    },
  });

  return result;
};

export const signInSocial = async (
  provider: "github" | "google",
  callbackURL?: string
) => {
  const { url } = await auth.api.signInSocial({
    body: {
      provider,
      callbackURL: callbackURL || "/dashboard",
    },
  });

  if (url) {
    redirect(url);
  }
};

export const signOut = async () => {
  const result = await getServerSession();
  return result;
};
