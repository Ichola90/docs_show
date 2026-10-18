import type { ReactNode } from "react";

export default function ChatLayout({ children }: { children: ReactNode }) {
  return (
    <div className="w-screen h-screen overflow-hidden bg-white text-slate-900">
      {children}
    </div>
  );
}

