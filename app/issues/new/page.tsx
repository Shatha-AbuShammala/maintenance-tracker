"use client";

import Layout from "@/app/components/Layout";
import IssueForm from "@/app/components/IssueForm";

export default function NewIssuePage() {
  return (
    <Layout>
      <main className="relative min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-slate-50">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(59,130,246,0.12),transparent_30%),radial-gradient(circle_at_80%_10%,rgba(14,165,233,0.1),transparent_32%),radial-gradient(circle_at_15%_80%,rgba(99,102,241,0.08),transparent_35%)]" />
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-10">
            <div className="space-y-4 lg:w-2/5">
              <p className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-100 ring-1 ring-white/10">
                Submit issue
              </p>
              <h1 className="text-3xl font-semibold text-white sm:text-4xl">Report a new issue</h1>
              <p className="text-sm text-slate-200">
                Share clear details so crews can act fast. Photos and precise locations help prioritize the work.
              </p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
                  <p className="text-sm font-semibold text-white">Status updates</p>
                  <p className="text-xs text-slate-200">Stay notified at each step.</p>
                </div>
                <div className="rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
                  <p className="text-sm font-semibold text-white">Smart routing</p>
                  <p className="text-xs text-slate-200">Sent to the right crew quickly.</p>
                </div>
              </div>
            </div>

            <div className="flex-1 rounded-2xl border border-white/10 bg-white/95 p-8 text-slate-900 shadow-[0_30px_90px_-48px_rgba(0,0,0,0.6)] backdrop-blur">
              <IssueForm onSuccessRedirect="/" submitLabel="Submit Issue" />
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}
