import type { Metadata } from "next";
import { SavedAnalysisView } from "@/components/SavedAnalysisView";

export const metadata: Metadata = {
  title: "Saved analysis",
};

export default async function SavedAnalysisPage({
  params,
}: PageProps<"/history/[id]">) {
  const { id } = await params;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <SavedAnalysisView id={id} />
    </div>
  );
}
