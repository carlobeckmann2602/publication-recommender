import { Header } from "@/components/Header";
import DeleteAccountButton from "@/components/profile/DeleteAccountButton";
import PasswordForm from "@/components/profile/PasswordForm";
import UserCredentialForm from "@/components/profile/UserCredentialForm";

export default function Profile() {
  return (
    <>
      <Header title="Profile" subtitle="your personal information" />
      <div className="flex justify-center p-8">
        <div className="flex flex-col w-full sm:w-3/4 lg:w-1/2 gap-8">
          <UserCredentialForm />
          <PasswordForm />
          <DeleteAccountButton />
        </div>
      </div>
    </>
  );
}
