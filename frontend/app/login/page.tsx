import { Header } from "@/components/Header";
import { LogInForm } from "@/components/login/LogInForm";

type Props = {
  searchParams?: Record<"callbackUrl" | "error", string>;
};

export default function LogIn(props: Props) {
  return (
    <>
      <Header title="Log In" subtitle="Please enter your details." />
      <div className="flex justify-center p-8">
        <div className="flex flex-col w-full md:w-3/4 xl:w-1/2 gap-8">
          <LogInForm
            error={props.searchParams?.error}
            callbackUrl={props.searchParams?.callbackUrl}
          />
        </div>
      </div>
    </>
  );
}
