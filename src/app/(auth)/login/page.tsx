"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginInput } from "@/schema/loginSchema";
import { useAuthContext } from "@/context/AuthContext";


export default function LoginPage() {
  const { login } = useAuthContext();
  const { register, handleSubmit, formState: { errors, isValid, isSubmitting } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const [serverError, setServerError] = useState("");
  const router = useRouter();

  const onSubmit:SubmitHandler<LoginInput> = async (data)=>{
    setServerError("");
    const success = await login(data);
    if (!success) {
      setServerError("Invalid credentials. Please try again.");
    }
  }


  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] flex flex-col items-center justify-center p-6 font-sans">
      <div className="w-full max-w-[400px]">
        <div className="flex items-center gap-2 justify-center mb-8">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">T</div>
          <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Task Manager</span>
        </div>

        <div className="bg-white dark:bg-[#0c0c0e] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-8">
          <div className="mb-8">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Sign In</h1>
            <p className="text-sm text-slate-500">Enter your credentials to access your account.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {serverError && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs font-medium text-center">
                {serverError}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 ml-0.5">
                Email Address
              </label>
              <input
                type="email"
                {...register("email")}
                placeholder="name@example.com"
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
              {errors.email && <span className="text-red-500 text-[10px] font-medium ml-0.5">{errors.email.message}</span>}
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center px-0.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <Link href="#" className="text-xs text-indigo-600 hover:text-indigo-500 font-medium">
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                {...register("password")}
                placeholder="••••••••"
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
              {errors.password && <span className="text-red-500 text-[10px] font-medium ml-0.5">{errors.password.message}</span>}
            </div>

            <button
              type="submit"
              disabled={!isValid || isSubmitting}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors shadow-sm disabled:opacity-50 mt-2"
            >
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-slate-500">
              Don't have an account?{" "}
              <Link href="/register" className="text-indigo-600 hover:text-indigo-500 font-semibold transition-colors">
                Sign Up
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center mt-12 text-slate-400 text-xs uppercase tracking-widest">
          &copy; 2026 Task Manager Inc.
        </p>
      </div>
    </div>
  );
}
