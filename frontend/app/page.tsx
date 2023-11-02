import { Searchbar } from "@/components/Searchbar";
import SignInButton from "@/components/SignInButton";

export default function Home() {
  return (
    <div className="flex justify-center min-h-screen items-center flex-col">
      <Searchbar></Searchbar>
      <SignInButton></SignInButton>
    </div>
  );
}
