import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-bold text-slate-900">Registro</h1>
      <p className="mt-2 text-sm text-slate-600">
        Creá una cuenta para acceder al dashboard.
      </p>

      <RegisterForm />
    </div>
  );
}
