import { RegisterForm } from "@/features/auth/components/RegisterForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up | FB Automation",
  description: "Create an account to start your automation dashboard.",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
