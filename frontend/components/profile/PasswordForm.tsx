"use client";

import { UpdateUserDocument } from "@/graphql/mutation/UpdateUser.generated";
import { useMutation } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import PasswordFormControl from "@/components/PasswordFormControl";

const FormSchema = z
  .object({
    password: z
      .string({
        required_error: "Current password is required",
      })
      .min(1, { message: "Current password is required" })
      .min(8, { message: "Password must be 8 or more characters long" }),
    newPassword: z
      .string({
        required_error: "New password is required",
      })
      .min(1, { message: "New password is required" })
      .min(8, { message: "Password must be 8 or more characters long" }),
    confirm: z
      .string({
        required_error: "Confirm password is required",
      })
      .min(1, { message: "Confirm password is required" }),
  })
  .refine((data) => data.newPassword === data.confirm, {
    message: "Passwords don't match",
    path: ["confirm"],
  });

type Props = {
  title?: string;
};

export default function PasswordForm({ title }: Props) {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      password: "",
      newPassword: "",
      confirm: "",
    },
  });

  const [errorMsg, setErrorMsg] = useState<string>();

  const [edit, setEdit] = useState(false);

  const toogleEdit = () => {
    if (edit) form.reset();
    setEdit((prev) => !prev);
  };

  const session = useSession();
  const [updateUser, { error }] = useMutation(UpdateUserDocument, {
    context: {
      headers: {
        Authorization: `Bearer ${session.data?.userToken.jwtToken}`,
      },
    },
  });

  const { toast } = useToast();

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setErrorMsg(undefined);
    try {
      const response = await updateUser({
        variables: {
          oldPassword: data.password,
          password: data.newPassword,
        },
      });
      if (response.errors) {
        throw new Error(response.errors.toString());
      } else {
        toogleEdit();
        toast({
          title: "Password updated",
          description: "Your password was successfully updated",
        });
      }
    } catch (error: any) {
      console.error(error.message);
      setErrorMsg("Update Credantial failed!");
    }
  }

  return (
    <>
      {title && (
        <div className="text-2xl font-medium text-left w-full">{title}</div>
      )}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="password"
            disabled={!edit}
            render={({ field }) => (
              <FormItem>
                <div className="flex flex-row justify-between">
                  <FormLabel>Current Password</FormLabel>
                  <button
                    className="underline cursor-pointer font-medium text-sm leading-none "
                    onClick={toogleEdit}
                    type="button"
                  >
                    {edit ? "cancel" : "edit"}
                  </button>
                </div>
                <PasswordFormControl field={field} enableVisibleToggle={edit} />
                <FormMessage />
              </FormItem>
            )}
          />
          {edit && (
            <>
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <PasswordFormControl field={field} />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <PasswordFormControl field={field} />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full">
                Update Password
              </Button>
            </>
          )}
        </form>
      </Form>
      {!!errorMsg && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{errorMsg}</AlertDescription>
        </Alert>
      )}
    </>
  );
}
