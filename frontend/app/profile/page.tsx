import { Header } from "@/components/Header";
import DeleteAccountButton from "@/components/profile/DeleteAccountButton";
import PasswordForm from "@/components/profile/PasswordForm";
import UserCredentialForm from "@/components/profile/UserCredentialForm";

export default function Profile() {
  return (
    <>
      <Header title="Profile" subtitle="your personal information" />
      <div className="flex justify-center p-8">
        <div className="flex flex-col w-full md:w-3/4 xl:w-1/2 gap-8">
          <UserCredentialForm title="Account information" />
          <PasswordForm title="Log in and security" />
          <div className="text-2xl font-medium text-left w-full">
            Delete Publicationrecmd account
          </div>
          <DeleteAccountButton />
        </div>
      </div>
    </>
  );
}
