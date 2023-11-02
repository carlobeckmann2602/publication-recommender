import { LogInForm } from "@/components/LogInForm";

type Props = {
  searchParams?: Record<"callbackUrl" | "error", string>;
};

export default function SignIn(props: Props) {
  return (
    <LogInForm
      error={props.searchParams?.error}
      callbackUrl={props.searchParams?.callbackUrl}
    />
  );
}
