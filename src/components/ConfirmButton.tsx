"use client";

import { useTransition } from "react";

export function ConfirmButton({
  action,
  confirm: question,
  children,
  className = "btn-danger",
}: {
  action: () => Promise<void>;
  confirm: string;
  children: React.ReactNode;
  className?: string;
}) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      className={className}
      disabled={pending}
      onClick={() => window.confirm(question) && start(action)}
    >
      {pending ? "…" : children}
    </button>
  );
}
