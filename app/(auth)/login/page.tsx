"use client";
import React, { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../../../components/ui/button";
import { loginWithStaticCredentials } from "../../../lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const onSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setError("");
      const user = loginWithStaticCredentials(email.trim(), password);
      if (!user) {
        setError("Invalid credentials");
        return;
      }
      if (user.role === "admin") {
        router.replace("/admin");
      } else {
        router.replace("/employee");
      }
    },
    [email, password, router]
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-neutral-900">
      <div className="w-full max-w-md bg-white dark:bg-neutral-800 p-8 rounded-xl shadow-md flex flex-col gap-6">
        <div className="text-center text-3xl font-bold text-blue-700">Attendance System</div>
        <form className="flex flex-col gap-4" onSubmit={onSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300 bg-neutral-50 dark:bg-neutral-700 text-neutral-900 dark:text-white"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300 bg-neutral-50 dark:bg-neutral-700 text-neutral-900 dark:text-white"
          />
          {error ? (
            <div className="text-red-600 text-sm" role="alert">{error}</div>
          ) : null}
          <Button type="submit" className="w-full mt-2">Login</Button>
        </form>
        <div className="flex flex-col gap-1 items-center text-sm">
          <a href="/forgot-password" className="text-blue-600 hover:underline">Forgot Password?</a>
        </div>
        <div className="text-xs text-neutral-500 text-center mt-2">
          Admin: admin@example.com / Admin@123 · Employee: employee@example.com / Employee@123
        </div>
      </div>
    </div>
  );
}
