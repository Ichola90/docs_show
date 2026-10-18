import type { ReactNode } from "react";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { FloatingChatbotButton } from "@/components/docs-chat/floating-chatbot-button";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
      <FloatingChatbotButton />
      <Footer />
    </>
  );
}
