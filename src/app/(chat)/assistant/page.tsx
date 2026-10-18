import type { Metadata } from "next";
import { DocsChatWorkspace } from "@/components/docs-chat/docs-chat-workspace";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "DOCS SHOW — Chatbot IA & Débats d'Ingénierie",
  description:
    "Discutez avec les chatbots IA de DOCS SHOW ou lancez un débat technique entre DOCS Core et DOCS Modern.",
  path: "/assistant/",
  imageAlt: "DOCS SHOW — Chatbot IA et Débats Multi-Chatbots",
});

export default function AssistantPage() {
  return <DocsChatWorkspace />;
}

