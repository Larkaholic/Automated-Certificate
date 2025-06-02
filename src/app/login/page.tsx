"use client";

import { useState } from "react";
import LoginForm from "@/components/auth/login-form";

interface Credentials {
  email: string;
  password: string;
}

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (credentials: Credentials) => {
    // Implement login logic here
    // If login fails, set the error state
    // setError("Invalid credentials");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded shadow-md">
        <h1 className="text-2xl font-bold text-center">Admin Login</h1>
        {error && <p className="mt-4 text-red-500">{error}</p>}
        <LoginForm onLogin={handleLogin} />
      </div>
    </div>
  );
}