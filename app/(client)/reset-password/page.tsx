"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { AlertCircle, CheckCircle, Key } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!token) {
      setError("Invalid or missing reset token");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    try {
      const result = await authClient.resetPassword({
        token: token,
        newPassword: password,
      });

      if (result.error) {
        setError(result.error.message as any);
      } else {
        setMessage(
          "Password reset successfully! You can now login with your new password."
        );
        setPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h2 className="text-2xl font-bold text-gray-900">
            Invalid Reset Link
          </h2>
          <p className="text-gray-600">
            This password reset link is invalid or has expired. Please request a
            new one.
          </p>
          <Link
            href="/forgot-password"
            className="text-blue-600 hover:text-blue-500"
          >
            Request new reset link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Key className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Reset your password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your new password below.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                New Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                minLength={6}
                className="mt-1 relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <Label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Confirm New Password
              </Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                minLength={6}
                className="mt-1 relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {message && (
            <div className="rounded-md bg-green-50 p-4">
              <div className="flex">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">
                    Success
                  </h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>{message}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div>
            <Button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? "Resetting password..." : "Reset password"}
            </Button>
          </div>

          <div className="text-center">
            <Link
              href="/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Back to login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
