"use client";

import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useAuth } from "@/app/providers/Providers";
import { toast } from "react-toastify";
import Link from "next/link";
import Layout from "@/app/components/Layout";

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
    <Layout showFooter={false}>
      <div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-blue-900 text-slate-50">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.1),transparent_32%),radial-gradient(circle_at_80%_0%,rgba(99,102,241,0.12),transparent_32%),radial-gradient(circle_at_10%_80%,rgba(14,165,233,0.08),transparent_35%)]" />
        <div className="pointer-events-none absolute -left-16 top-28 h-48 w-48 rounded-full bg-gradient-to-br from-cyan-400/20 to-indigo-500/20 blur-2xl animate-pulse" />
        <div className="pointer-events-none absolute right-4 bottom-16 h-40 w-40 rounded-full bg-gradient-to-br from-blue-500/16 to-fuchsia-500/16 blur-2xl animate-pulse" />
        <div className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-start gap-6 px-6 pt-10 pb-10">
          <div className="w-full max-w-xl space-y-3 text-center">
            <p className="inline-flex items-center justify-center rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-100 ring-1 ring-white/20">
              City Ops
            </p>
            <h1 className="text-4xl font-semibold text-white mt-1">Welcome back</h1>
          </div>

          <div className="w-full max-w-xl">
            <div className="relative overflow-hidden rounded-2xl bg-white/95 p-9 shadow-[0_34px_110px_-48px_rgba(15,23,42,0.9)] ring-1 ring-white/20 backdrop-blur">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white/70 to-blue-50" />
              <div className="relative">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">Sign in</p>
                    <h2 className="text-2xl font-semibold text-slate-900">Access your account</h2>
                  </div>
                  <Link href="/auth/register" className="text-sm font-semibold text-blue-700 hover:text-blue-800">
                    Create account
                  </Link>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">
                        Email address
                      </label>
                      <input
                        {...register("email", { required: "Email is required" })}
                        id="email"
                        type="email"
                        autoComplete="email"
                        placeholder="you@example.com"
                        className="mt-2 block w-full rounded-lg border border-slate-200 bg-white px-4 py-3.5 text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
                      />
                      {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
                    </div>

                    <div>
                      <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">
                        Password
                      </label>
                      <input
                        {...register("password", { required: "Password is required", minLength: { value: 6, message: "Password must be at least 6 characters" } })}
                        id="password"
                        type="password"
                        autoComplete="current-password"
                        placeholder="********"
                        className="mt-2 block w-full rounded-lg border border-slate-200 bg-white px-4 py-3.5 text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
                      />
                      {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loginMutation.isPending}
                    className="w-full rounded-lg bg-gradient-to-r from-blue-700 via-indigo-600 to-fuchsia-600 px-6 py-3.5 text-sm font-semibold text-white shadow-[0_22px_60px_-20px_rgba(59,130,246,0.65)] transition hover:-translate-y-0.5 hover:shadow-[0_28px_72px_-18px_rgba(129,140,248,0.55)] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loginMutation.isPending ? "Signing in..." : "Sign in"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
