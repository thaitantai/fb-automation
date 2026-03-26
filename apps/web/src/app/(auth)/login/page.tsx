import { LoginForm } from "@/features/auth/components/LoginForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | FB Automation",
  description: "Sign in to access your automation dashboard.",
};

export default function LoginPage() {
  return <LoginForm />;
}
