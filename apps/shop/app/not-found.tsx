export const runtime = "edge";

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-6 text-center">
      <h1 className="text-6xl font-bold text-slate-900">404</h1>
      <h2 className="mt-4 text-2xl font-semibold text-slate-700">Page Not Found</h2>
      <p className="mt-2 text-slate-600">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800"
      >
        Go Home
      </Link>
    </div>
  );
}
