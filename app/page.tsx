"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Layout from "@/app/components/Layout";
import { useAuth } from "@/app/providers/Providers";

const features = [
  { title: "Easy Reporting", body: "Submit issues in minutes with photos, details, and locations.", tone: "text-amber-500", icon: "\u{1F4F8}" },
  { title: "Track Progress", body: "Know exactly where things stand with real-time status updates.", tone: "text-sky-500", icon: "\u{1F501}" },
  { title: "Community Driven", body: "Coordinate priorities with neighbors and keep everyone informed.", tone: "text-emerald-500", icon: "\u{1F91D}" },
  { title: "Secure & Reliable", body: "Privacy-first, with dependable uptime and audit-ready records.", tone: "text-indigo-500", icon: "\u{1F512}" },
];

const steps = [
  { title: "Capture", detail: "Residents submit with photos, categories, and precise locations." },
  { title: "Route", detail: "Smart routing sends tickets to the right crew automatically." },
  { title: "Communicate", detail: "Status changes trigger respectful, timely notifications." },
  { title: "Measure", detail: "Dashboards surface trends so you can prevent repeat issues." },
];

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      router.replace("/my-issues");
    }
  }, [user, router]);

  return (
    <Layout>
      <main className="relative min-h-screen bg-gradient-to-b from-slate-50 via-sky-50/60 to-white text-slate-900 overflow-hidden">
        <div className="pointer-events-none absolute -left-32 -top-32 h-72 w-72 rounded-full bg-gradient-to-r from-sky-200 via-cyan-100 to-emerald-100 blur-3xl" />

        <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <div className="mx-auto flex max-w-5xl flex-col items-center px-6 pb-20 pt-16 text-center lg:pt-24">
            <p className="mb-4 inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-200 ring-1 ring-white/10">
              City service made simple
            </p>
            <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
              A clear, calm way to stay on top of maintenance updates.
            </h1>
            <p className="mt-6 max-w-3xl text-lg text-slate-200">
              Log in to check progress, get notified when work is complete, and know your community is cared for around the clock.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href="/auth/login"
                className="rounded-full bg-gradient-to-r from-sky-500 via-cyan-500 to-emerald-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-300/20 transition hover:-translate-y-0.5 hover:shadow-xl"
              >
                Report an issue
              </Link>
            </div>
            <div className="mt-12 grid w-full max-w-3xl gap-4 text-sm text-slate-200 sm:grid-cols-3">
              <div className="rounded-2xl bg-white/5 p-4 shadow-lg shadow-slate-900/20 ring-1 ring-white/10">
                <p className="text-3xl font-semibold text-white">24/7</p>
                <p className="mt-1">Resident-friendly submissions on any device</p>
              </div>
              <div className="rounded-2xl bg-white/5 p-4 shadow-lg shadow-slate-900/20 ring-1 ring-white/10">
                <p className="text-3xl font-semibold text-white">48h</p>
                <p className="mt-1">Average acknowledgment time for new reports</p>
              </div>
              <div className="rounded-2xl bg-white/5 p-4 shadow-lg shadow-slate-900/20 ring-1 ring-white/10">
                <p className="text-3xl font-semibold text-white">99.9%</p>
                <p className="mt-1">Uptime for status updates and notifications</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto max-w-6xl px-6">
            <div className="text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">What you get</p>
              <h3 className="mt-3 text-4xl font-semibold text-slate-900">Core Features</h3>
              <p className="mt-3 text-base text-slate-600">
                A professional toolkit built for clarity, accountability, and trusted communication.
              </p>
            </div>
            <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((item) => (
                <div
                  key={item.title}
                  className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-xl shadow-slate-200/50 ring-1 ring-slate-200 transition hover:-translate-y-2 hover:shadow-2xl hover:ring-sky-100"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white via-transparent to-sky-50 opacity-0 transition group-hover:opacity-100" />
                  <div className={`relative mb-4 text-5xl ${item.tone}`}>{item.icon}</div>
                  <h4 className="relative text-2xl font-semibold text-slate-900">{item.title}</h4>
                  <p className="relative mt-3 text-sm text-slate-600">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="mx-auto max-w-6xl px-6 py-14">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">How it works</p>
              <h2 className="mt-3 text-3xl font-semibold text-slate-900">
                From report to resolution with nothing falling through the cracks.
              </h2>
              <p className="mt-4 text-slate-600">
                Every touchpoint is designed to keep both residents and teams confident. Fewer surprises, faster closes, and a record everyone can trust.
              </p>
            </div>
            <div className="grid gap-4">
              {steps.map((step, index) => (
                <div
                  key={step.title}
                  className="flex items-start space-x-4 rounded-2xl bg-white p-5 shadow-sm shadow-slate-200 ring-1 ring-slate-200/80"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-cyan-500 text-sm font-semibold text-white shadow-inner">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <div>
                    <p className="text-base font-semibold text-slate-900">{step.title}</p>
                    <p className="text-sm text-slate-600">{step.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
