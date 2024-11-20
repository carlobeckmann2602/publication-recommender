"use client";

import { UpdateUserDocument } from "@/graphql/mutation/UpdateUser.generated";
import { useMutation } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

const FormSchema = z.object({
  name: z
    .string({
      required_error: "Name is required",
    })
    .min(1, { message: "Name is required" })
    .min(2, {
      message: "Name must be at least 2 characters.",
    }),
  email: z
    .string({
      required_error: "Email is required",
    })
    .min(1, { message: "Email is required" })
    .email({ message: "Invalid email address" }),
});

type Props = {
  title?: string;
};

export default function UserCredentialForm({ title }: Props) {
  const session = useSession();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: session.data?.user.name,
      email: session.data?.user.email,
    },
  });

  const [edit, setEdit] = useState(false);

  const toogleEdit = () => {
    if (edit) form.clearErrors();
    setEdit((prev) => !prev);
  };

  useEffect(() => {
    if (!edit) {
      form.setValue("name", session.data?.user.name || "");
      form.setValue("email", session.data?.user.email || "");
    }
  }, [form, session, edit]);

  const [errorMsg, setErrorMsg] = useState<string>();

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
          email: data.email,
          name: data.name,
        },
      });
      if (response.errors) {
        throw new Error(response.errors.toString());
      } else {
        session.update({
          user: {
            name: response.data?.updateProfile.name,
            email: response.data?.updateProfile.email,
          },
        });
        toogleEdit();

        toast({
          title: "Credentials updated",
          description: (
            <>
              {`Name: ${response.data?.updateProfile.name}`} <br />
              {`Email: ${response.data?.updateProfile.email}`}
            </>
          ),
        });
      }
    } catch (error: any) {
      console.error(error.message);
      setErrorMsg(error.message);
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
            name="name"
            disabled={!edit}
            render={({ field }) => (
              <FormItem>
                <div className="flex flex-row justify-between">
                  <FormLabel>Name</FormLabel>
                  <button
                    className="underline cursor-pointer font-medium text-sm leading-none "
                    onClick={toogleEdit}
                    type="button"
                  >
                    {edit ? "cancel" : "edit"}
                  </button>
                </div>
                <FormControl>
                  <Input
                    placeholder="Name"
                    type="text"
                    autoComplete="on"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            disabled={!edit}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Email"
                    type="email"
                    autoComplete="on"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {edit && (
            <Button type="submit" className="w-full">
              Update
            </Button>
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
