"use client";

import { useState, ChangeEvent, FormEvent, ReactNode } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

interface InputProps {
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}

const Input = ({ type, placeholder, value, onChange, required }: InputProps) => (
  <input
    type={type}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    required={required}
    className="w-full p-2 border rounded"
  />
);

interface ButtonProps {
  type: "button" | "submit" | "reset";
  children: ReactNode;
}

const Button = ({ type, children }: ButtonProps) => (
  <button
    type={type}
    className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
  >
    {children}
  </button>
);

interface LoginFormProps {
  onLogin?: (credentials: { email: string; password: string }) => void;
}

const LoginForm = ({ onLogin }: LoginFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const result = await signIn("credentials", {
      redirect: false,
      username: email, // Changed to match backend expectations
      password,
    });

    if (result?.error) {
      setError("Invalid credentials");
    } else {
      router.push("/admin/dashboard");
      if (onLogin) onLogin({ email, password });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
      {error && <p className="text-red-500">{error}</p>}
      <Input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <Input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <Button type="submit">Login</Button>
    </form>
  );
};

export default LoginForm;