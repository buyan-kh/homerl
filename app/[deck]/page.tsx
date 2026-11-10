import { notFound } from "next/navigation";
import { Drill } from "@/components/Drill";
import { getDeck } from "@/lib/decks";

type PageProps = {
  params: Promise<{ deck: string }>;
};

export function generateStaticParams() {
  return [{ deck: "cs166" }];
}

export default async function DeckPage({ params }: PageProps) {
  const { deck: deckSlug } = await params;
  const deck = getDeck(deckSlug);
  if (!deck) notFound();

  return (
    <main className="flex flex-1 flex-col items-center px-4 py-10 sm:px-8">
      <Drill deckSlug={deckSlug} />
    </main>
  );
}
