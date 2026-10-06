"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, Lock, User, AlertCircle, Loader2, ArrowLeft, Cake } from "lucide-react";
import { api } from "@/lib/api";
import { ScallopedCardTrim } from "@/components/FrostingScallop";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password.trim()) {
      setError("Please provide both username and password.");
      return;
    }

    setLoading(true);
    try {
      await api.login(username.trim(), password.trim());
      router.push("/admin");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Invalid credentials";
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center px-4 py-12 sm:px-6 lg:px-8 bg-[#FBEEF2]">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-[#F0D5DD] shadow-xl relative overflow-hidden">
          {/* Scalloped Card Trim */}
          <div className="absolute top-0 left-0 right-0">
            <ScallopedCardTrim className="text-[#3D1436]" />
          </div>

          <div className="text-center pt-2 mb-8">
            <div className="w-16 h-16 rounded-full bg-[#3D1436] text-[#C9A227] flex items-center justify-center mx-auto mb-4 shadow-md">
              <Cake className="w-8 h-8" />
            </div>
            <span className="text-xs uppercase tracking-widest text-[#C9A227] font-semibold block mb-1">
              Bakery Administration
            </span>
            <h1 className="font-serif text-3xl font-bold text-[#3D1436]">
              Jeycyl Staff Portal
            </h1>
            <p className="text-xs text-[#3D1436]/70 mt-1 font-sans">
              Sign in to manage orders, catalog cakes, and live availability.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="block text-xs font-semibold uppercase tracking-wider text-[#3D1436] mb-1.5 flex items-center gap-1.5"
              >
                <User className="w-3.5 h-3.5 text-[#C9A227]" />
                <span>Username</span>
              </label>
              <input
                id="username"
                type="text"
                required
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. admin"
                className="w-full px-4 py-2.5 rounded-xl border border-[#F0D5DD] bg-[#FBEEF2]/30 text-[#3D1436] placeholder-[#3D1436]/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C9A227] text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold uppercase tracking-wider text-[#3D1436] mb-1.5 flex items-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5 text-[#C9A227]" />
                <span>Password</span>
              </label>
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl border border-[#F0D5DD] bg-[#FBEEF2]/30 text-[#3D1436] placeholder-[#3D1436]/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C9A227] text-sm"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="btn-gold w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-full text-sm font-bold text-[#3D1436] shadow-md hover:scale-101 active:scale-99 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#3D1436]" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-[#3D1436]" />
                    <span>Sign In to Admin Dashboard</span>
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-[#FBEEF2] text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-[#3D1436]/70 hover:text-[#3D1436] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to customer catalog</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
