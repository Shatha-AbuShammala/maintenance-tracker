"use client";

import Layout from "@/app/components/Layout";
import IssueForm from "@/app/components/IssueForm";

export default function NewIssuePage() {
  return (
    <Layout>
      <main className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Report New Issue</h1>
            <p className="mt-2 text-sm text-gray-600">
              Provide a few details so our team can address the problem quickly.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <IssueForm onSuccessRedirect="/" submitLabel="Submit Issue" />
          </div>
        </div>
      </main>
    </Layout>
  );
}

