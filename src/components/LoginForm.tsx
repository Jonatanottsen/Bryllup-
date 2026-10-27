"use client";

import { useActionState } from "react";
import type { LoginState } from "@/app/login/actions";

export function LoginForm({
  action,
  next,
  label,
}: {
  action: (s: LoginState, f: FormData) => Promise<LoginState>;
  next?: string;
  label: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  return (
    <form action={formAction} className="space-y-4">
      {next && <input type="hidden" name="next" value={next} />}
      <div>
        <label htmlFor="password" className="label">{label}</label>
        <input id="password" name="password" type="password" required autoFocus className="input" autoComplete="current-password" />
      </div>
      {state.error && <p className="error">{state.error}</p>}
      <button className="btn w-full" disabled={pending}>
        {pending ? "Logger inn …" : "Gå inn"}
      </button>
    </form>
  );
}
