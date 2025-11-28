"use client";

import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useAuth } from "@/app/providers/Providers";
import { toast } from "react-toastify";
import Link from "next/link";

type LoginFormData = {
  email: string;
  password: string;
};

type LoginResponse = {
  user: {
    _id: string;
    name?: string;
    email: string;
    role?: string;
  };
  token: string;
};

export default function LoginPage() {
  const router = useRouter();
  const { setUser, setToken } = useAuth();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>();

  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormData): Promise<LoginResponse> => {
      const response = await axios.post<{ success: boolean; data: LoginResponse }>("/api/auth/login", data);
      if (!response.data.success || !response.data.data) throw new Error("Invalid response from server");
      return response.data.data;
    },
    onSuccess: (data) => {
      if (!data.user?._id) return toast.error("Invalid response from server");
      setUser({
        id: data.user._id,
        email: data.user.email,
        name: data.user.name,
        role: data.user.role,
      });
      setToken(data.token);
      toast.success("Login successful!");
      router.push("/");
    },
    onError: (error: unknown) => {
      let errorMessage = "Login failed. Please check your credentials.";
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
    },
  });

  const onSubmit = (data: LoginFormData) => loginMutation.mutate(data);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg space-y-10 p-10 bg-white rounded-2xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{" "}
            <Link href="/auth/register" className="font-medium text-blue-600 hover:text-blue-500">
              create a new account
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-6">
            <div>
              <label htmlFor="email" className="sr-only">Email address</label>
              <input
                {...register("email", { required: "Email is required" })}
                id="email"
                type="email"
                autoComplete="email"
                placeholder="Email address"
                className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
            </div>

            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                {...register("password", { required: "Password is required", minLength: { value: 6, message: "Password must be at least 6 characters" } })}
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="Password"
                className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loginMutation.isPending ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
