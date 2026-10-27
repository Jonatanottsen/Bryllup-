"use server";

import { redirect } from "next/navigation";
import { safeEqual } from "@/lib/auth";
import { startSession } from "@/lib/session";

export type LoginState = { error?: string };

function safeNext(next: FormDataEntryValue | null) {
  const n = typeof next === "string" ? next : "";
  return n.startsWith("/") && !n.startsWith("//") ? n : "/";
}

export async function guestLogin(_: LoginState, form: FormData): Promise<LoginState> {
  const password = String(form.get("password") ?? "").trim();
  const expected = process.env.GUEST_PASSWORD;
  if (!expected) return { error: "GUEST_PASSWORD er ikke satt på serveren." };
  if (!(await safeEqual(password.toLowerCase(), expected.toLowerCase()))) {
    return { error: "Feil passord. Du finner det på invitasjonen." };
  }
  await startSession("guest");
  redirect(safeNext(form.get("next")));
}

export async function adminLogin(_: LoginState, form: FormData): Promise<LoginState> {
  const password = String(form.get("password") ?? "");
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return { error: "ADMIN_PASSWORD er ikke satt på serveren." };
  if (!(await safeEqual(password, expected))) return { error: "Feil passord." };
  await startSession("admin");
  redirect("/admin");
}
