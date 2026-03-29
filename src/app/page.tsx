import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold">Epicare Technical Test</h1>
        <p className="mt-2 text-sm text-slate-600">
          Base project with Next.js, TypeScript and Supabase Auth.
        </p>

        <div className="mt-6 flex flex-col gap-3">
          <Link
            href="/login"
            className="rounded-xl bg-slate-900 px-4 py-3 text-center text-sm font-medium text-white"
          >
            Ir a Login
          </Link>

          <Link
            href="/register"
            className="rounded-xl border border-slate-300 px-4 py-3 text-center text-sm font-medium text-slate-800"
          >
            Ir a Registro
          </Link>
        </div>
      </div>
    </main>
  );
}
