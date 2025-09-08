export default function HomePage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-3xl font-bold">Next.js 14 + TS + Tailwind</h1>
      <p className="text-neutral-600">Project: rizzchat-master</p>
      <a
        className="rounded-md bg-black px-4 py-2 text-white transition hover:opacity-80"
        href="https://nextjs.org/docs"
        target="_blank"
        rel="noreferrer"
      >
        Read the docs
      </a>
    </main>
  )
}
