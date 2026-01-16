// hooks/use-auth.ts

import { createAuthClient } from "better-auth/react";

export const { signIn, signUp, signOut } = createAuthClient();

export const authClient = createAuthClient();
