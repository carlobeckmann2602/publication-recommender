"use client";
import { useMutation } from "@apollo/client";
import DeletButton from "../DeletButton";
import { DeleteUserDocument } from "@/graphql/mutation/DeleteUser.generated";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";

export default function DeleteAccountButton() {
  const session = useSession();
  const [deleteUser, { error }] = useMutation(DeleteUserDocument, {
    context: {
      headers: {
        Authorization: `Bearer ${session.data?.userToken.jwtToken}`,
      },
    },
  });

  const deleteAccount = async () => {
    try {
      await deleteUser();
      if (error) throw Error;
      signOut({ callbackUrl: "/" });
    } catch (error) {}
  };

  return (
    <DeletButton
      onClick={deleteAccount}
      tooltipText="Account cannot be restored after deletion"
      text="Delete Account"
      dialogTitle="Delete Account"
      dialogText="Do you really want to delete your account? The account cannot be restored after deletion."
    />
  );
}
