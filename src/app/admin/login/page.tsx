import { LoginForm } from "@/components/LoginForm";
import { adminLogin } from "@/app/login/actions";

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-4">
      <div className="card w-full max-w-sm">
        <h1 className="mb-6 text-center text-4xl">Admin</h1>
        <LoginForm action={adminLogin} label="Adminpassord" />
      </div>
    </main>
  );
}
