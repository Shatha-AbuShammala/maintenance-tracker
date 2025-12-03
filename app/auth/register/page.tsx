"use client";

import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useAuth } from "@/app/providers/Providers";
import { toast } from "react-toastify";
import Link from "next/link";
import Layout from "@/app/components/Layout";

type RegisterFormData = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role?: "admin" | "citizen";
};

type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  role?: "admin";
};

type RegisterResponse = {
  user: {
    _id: string;
    name?: string;
    email: string;
    role?: string;
  };
  token: string;
};

export default function RegisterPage() {
  const router = useRouter();
  const { setUser, setToken, user: currentUser } = useAuth();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    defaultValues: {
      role: "citizen",
    },
  });

  const password = watch("password");

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterFormData): Promise<RegisterResponse> => {
      const { confirmPassword, ...submitData } = data;
      const payload: RegisterPayload = {
        name: submitData.name,
        email: submitData.email,
        password: submitData.password,
        ...(submitData.role === "admin" && { role: "admin" }),
      };
      const response = await axios.post<{ success: boolean; data: RegisterResponse }>(
        "/api/auth/register",
        payload
      );
      if (!response.data.success || !response.data.data) {
        throw new Error("Invalid response from server");
      }
      return response.data.data;
    },
    onSuccess: (data) => {
      if (!data.user || !data.user._id) {
        toast.error("Invalid response from server");
        return;
      }
      setUser({
        id: data.user._id,
        email: data.user.email,
        name: data.user.name,
        role: data.user.role,
      });
      setToken(data.token);
      toast.success("Registration successful!");
      router.push("/");
    },
    onError: (error: unknown) => {
      let errorMessage = "Registration failed. Please try again.";
      if (axios.isAxiosError(error)) {
        errorMessage =
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
    },
  });

  const onSubmit = (data: RegisterFormData) => {
    registerMutation.mutate(data);
  };

  const canSetAdminRole = currentUser?.role === "admin";

  return (
    <Layout>
      <div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-blue-900 text-slate-50">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.1),transparent_32%),radial-gradient(circle_at_80%_0%,rgba(99,102,241,0.12),transparent_32%),radial-gradient(circle_at_10%_80%,rgba(14,165,233,0.08),transparent_35%)]" />
        <div className="pointer-events-none absolute -left-16 top-28 h-48 w-48 rounded-full bg-gradient-to-br from-cyan-400/20 to-indigo-500/20 blur-2xl animate-pulse" />
        <div className="pointer-events-none absolute right-4 bottom-16 h-40 w-40 rounded-full bg-gradient-to-br from-blue-500/16 to-fuchsia-500/16 blur-2xl animate-pulse" />
        <div className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-start gap-6 px-6 pt-10 pb-10">
          <div className="w-full max-w-xl space-y-3 text-center">
            <p className="inline-flex items-center justify-center rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-100 ring-1 ring-white/20">
              City Ops
            </p>
            <h1 className="text-4xl font-semibold text-white mt-1">Create your account</h1>
            <p className="text-base text-slate-200">Join to start reporting and tracking.</p>
          </div>

          <div className="w-full max-w-xl">
            <div className="relative overflow-hidden rounded-2xl bg-white/95 p-8 shadow-[0_34px_110px_-48px_rgba(15,23,42,0.9)] ring-1 ring-white/20 backdrop-blur">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white/70 to-blue-50" />
              <div className="relative">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">Register</p>
                    <h2 className="text-2xl font-semibold text-slate-900">Create your account</h2>
                  </div>
                  <Link href="/auth/login" className="text-sm font-semibold text-blue-700 hover:text-blue-800">
                    Sign in
                  </Link>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">
                        Full Name
                      </label>
                      <input
                        {...register("name", {
                          required: "Name is required",
                          minLength: {
                            value: 2,
                            message: "Name must be at least 2 characters",
                          },
                        })}
                        id="name"
                        name="name"
                        type="text"
                        autoComplete="name"
                        className="mt-2 block w-full rounded-lg border border-slate-200 bg-white px-4 py-3.5 text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
                        placeholder="John Doe"
                        aria-invalid={errors.name ? "true" : "false"}
                        aria-describedby={errors.name ? "name-error" : undefined}
                      />
                      {errors.name && (
                        <p id="name-error" className="mt-1 text-sm text-red-600" role="alert">
                          {errors.name.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">
                        Email address
                      </label>
                      <input
                        {...register("email", {
                          required: "Email is required",
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: "Invalid email address",
                          },
                        })}
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        className="mt-2 block w-full rounded-lg border border-slate-200 bg-white px-4 py-3.5 text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
                        placeholder="you@example.com"
                        aria-invalid={errors.email ? "true" : "false"}
                        aria-describedby={errors.email ? "email-error" : undefined}
                      />
                      {errors.email && (
                        <p id="email-error" className="mt-1 text-sm text-red-600" role="alert">
                          {errors.email.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">
                        Password
                      </label>
                      <input
                        {...register("password", {
                          required: "Password is required",
                          minLength: {
                            value: 6,
                            message: "Password must be at least 6 characters",
                          },
                        })}
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="new-password"
                        className="mt-2 block w-full rounded-lg border border-slate-200 bg-white px-4 py-3.5 text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
                        placeholder="********"
                        aria-invalid={errors.password ? "true" : "false"}
                        aria-describedby={errors.password ? "password-error" : undefined}
                      />
                      {errors.password && (
                        <p id="password-error" className="mt-1 text-sm text-red-600" role="alert">
                          {errors.password.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="confirmPassword"
                        className="block text-xs font-semibold uppercase tracking-[0.12em] text-slate-600"
                      >
                        Confirm Password
                      </label>
                      <input
                        {...register("confirmPassword", {
                          required: "Please confirm your password",
                          validate: (value) => value === password || "Passwords do not match",
                        })}
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        autoComplete="new-password"
                        className="mt-2 block w-full rounded-lg border border-slate-200 bg-white px-4 py-3.5 text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
                        placeholder="********"
                        aria-invalid={errors.confirmPassword ? "true" : "false"}
                        aria-describedby={errors.confirmPassword ? "confirmPassword-error" : undefined}
                      />
                      {errors.confirmPassword && (
                        <p
                          id="confirmPassword-error"
                          className="mt-1 text-sm text-red-600"
                          role="alert"
                        >
                          {errors.confirmPassword.message}
                        </p>
                      )}
                    </div>

                    {canSetAdminRole && (
                      <div>
                        <label htmlFor="role" className="block text-sm font-medium text-slate-700">
                          Role
                        </label>
                        <select
                          {...register("role")}
                          id="role"
                          name="role"
                          className="mt-2 block w-full rounded-lg border border-slate-200 bg-white px-4 py-3.5 text-slate-900 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 sm:text-sm"
                          aria-invalid={errors.role ? "true" : "false"}
                          aria-describedby={errors.role ? "role-error" : undefined}
                        >
                          <option value="citizen">Citizen</option>
                          <option value="admin">Admin</option>
                        </select>
                        {errors.role && (
                          <p id="role-error" className="mt-1 text-sm text-red-600" role="alert">
                            {errors.role.message}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={registerMutation.isPending}
                    className="w-full rounded-lg bg-gradient-to-r from-blue-700 via-indigo-600 to-fuchsia-600 px-6 py-3.5 text-sm font-semibold text-white shadow-[0_22px_60px_-20px_rgba(59,130,246,0.65)] transition hover:-translate-y-0.5 hover:shadow-[0_28px_72px_-18px_rgba(129,140,248,0.55)] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {registerMutation.isPending ? (
                      <span className="flex items-center justify-center">
                        <svg
                          className="mr-3 h-5 w-5 animate-spin text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Creating account...
                      </span>
                    ) : (
                      "Create account"
                    )}
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
