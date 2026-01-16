import { adminClient, inferAdditionalFields } from "better-auth/client/plugins";
import { nextCookies } from "better-auth/next-js";
import { createAuthClient } from "better-auth/react";
import { toast } from "sonner";
import { auth } from "./auth";

export const authClient = createAuthClient({
  plugins: [inferAdditionalFields<typeof auth>(), adminClient(), nextCookies()],
  fetchOptions: {
    onError(e) {
      if (e.error.status === 429) {
        toast.error("Too many requests. Please try again later.");
      }
    },
  },
});

export const {
  signUp,
  signIn,
  signOut,
  useSession,
  forgetPassword,
  updateUser,
} = authClient;
