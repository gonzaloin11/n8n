import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 p-8">
      <main className="flex max-w-2xl flex-col items-center gap-8 text-center">
        <h1 className="text-5xl font-bold tracking-tight text-slate-900">
          TutorIA
        </h1>
        <p className="text-xl text-slate-600">
          Tu problema tecnico, resuelto en video
        </p>
        <p className="text-slate-500">
          Describe tu problema con tus propias palabras y obtén un video
          tutorial personalizado generado con inteligencia artificial.
        </p>
        <div className="flex gap-4">
          <Link
            href="/dashboard"
            className="rounded-lg bg-slate-900 px-6 py-3 font-medium text-white transition-colors hover:bg-slate-800"
          >
            Crear mi tutorial
          </Link>
          <Link
            href="/login"
            className="rounded-lg border border-slate-300 bg-white px-6 py-3 font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            Iniciar sesion
          </Link>
        </div>
      </main>
    </div>
  );
}
