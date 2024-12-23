"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";

import { useRouter } from "next/navigation";
import { useState } from "react";
import TextSeparator from "@/components/TextSeparator";
import GoogleButton from "@/components/login/GoogleButton";
import { signIn } from "next-auth/react";
import Link from "next/link";

import { useMutation } from "@apollo/client";
import { RegisterDocument } from "@/graphql/mutation/RegisterUser.generated";
import { allowBackgroundScrolling } from "@/lib/modal-controls";
import { AlertTriangle, Eye, EyeOff } from "lucide-react";
import PasswordFormControl from "@/components/PasswordFormControl";

const FormSchema = z
  .object({
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
    password: z
      .string({
        required_error: "Password is required",
      })
      .min(1, { message: "Password is required" })
      .min(8, { message: "Password must be 8 or more characters long" }),
    confirm: z.string().min(1, { message: "Confirm password is required" }),
  })
  .refine((data) => data.password === data.confirm, {
    message: "Passwords don't match",
    path: ["confirm"],
  });

type Props = {
  callbackUrl?: string;
  error?: string;
};

export function SignUpForm(props: Props) {
  const [errorMsg, setErrorMsg] = useState(props.error);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirm: "",
    },
  });

  const router = useRouter();

  const [registerFunction, { loading, error }] = useMutation(RegisterDocument);

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setErrorMsg(undefined);
    try {
      const response = await registerFunction({
        variables: {
          email: data.email,
          name: data.name,
          password: data.password,
        },
      });
      if (response.errors) {
        console.error(response.errors);
        setErrorMsg("Authentication failed!");
      } else {
        const res = await signIn("credentials", {
          username: data.email,
          password: data.password,
          redirect: false,
          callbackUrl: props.callbackUrl ?? "/",
        });
        if (res?.ok) {
          allowBackgroundScrolling();
          router.back();
        } else if (res?.error) {
          setErrorMsg(res?.error);
        } else {
          setErrorMsg("Login failed!");
        }
      }
    } catch (error: any) {
      console.error(error.message);
      setErrorMsg("Login failed!");
    }
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
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
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
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
            Create Account
          </Button>
        </form>
      </Form>
      {!!errorMsg && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{errorMsg}</AlertDescription>
        </Alert>
      )}
      {/* <TextSeparator>or</TextSeparator>
      <div className="flex flex-col gap-4">
        <GoogleButton
          onClick={() => {
            signIn("google", { callbackUrl: props.callbackUrl ?? "/" });
          }}
        />
      </div> */}
      <span className="text-center">
        Already have an account?{" "}
        <Link
          href={"/login"}
          scroll={false}
          replace={true}
          className="underline"
        >
          Log In
        </Link>
      </span>
    </>
  );
}
