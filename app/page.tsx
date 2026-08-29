import { ScanSearch } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-zinc-50 px-6 py-24 text-center font-sans dark:bg-black">
      <ScanSearch className="h-10 w-10 text-zinc-900 dark:text-zinc-100" />
      <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
        ResumeLens
      </h1>
      <p className="max-w-md text-zinc-600 dark:text-zinc-400">
        AI-powered resume and job match analyzer. Project setup is complete —
        application features will be implemented incrementally.
      </p>
    </div>
  );
}
