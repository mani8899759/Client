import { AuthShell } from "../AuthShell";
import { ForgotPasswordForm } from "../AuthForms";

export const dynamic = "force-dynamic";
export const metadata = { title: "Reset password" };

export default async function ForgotPasswordPage({ searchParams }: { searchParams: Promise<{ expired?: string }> }) {
  const { expired } = await searchParams;
  return (
    <AuthShell title="Forgot password" intro="Enter your administrator email and we will send you a secure reset link.">
      <ForgotPasswordForm expired={!!expired} />
    </AuthShell>
  );
}
