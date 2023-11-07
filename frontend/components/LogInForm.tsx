"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import {
  EyeIcon,
  EyeSlashIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import GoogleButton from "./GoogleButton";
import TextSeparator from "./TextSeparator";

const FormSchema = z.object({
  email: z
    .string({
      required_error: "Name is required",
    })
    .email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(2, { message: "Password must be 2 or more characters long" }),
});

type Props = {
  callbackUrl?: string;
  error?: string;
};

export function LogInForm(props: Props) {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const [showPassword, setPasswordVisibility] = useState(false);
  const togglePasswordVisibility = () => {
    setPasswordVisibility(!showPassword);
  };

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    await signIn("credentials", {
      username: data.email,
      password: data.password,
      redirect: true,
      callbackUrl: props.callbackUrl ?? "/",
    });
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="email" {...field} />
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
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      {...field}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 cursor-pointer">
                      {showPassword ? (
                        <EyeSlashIcon
                          className="h-6 w-6"
                          onClick={togglePasswordVisibility}
                        />
                      ) : (
                        <EyeIcon
                          className="h-6 w-6"
                          onClick={togglePasswordVisibility}
                        />
                      )}
                    </div>
                  </div>
                </FormControl>
                <FormDescription className="text-right">
                  <Link href={"/"}>Forgotten Password?</Link>
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full">
            Sign In
          </Button>
        </form>
      </Form>
      {!!props.error && (
        <Alert variant="destructive">
          <ExclamationTriangleIcon className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Authentication Failed!</AlertDescription>
        </Alert>
      )}
      <TextSeparator>or</TextSeparator>
      <GoogleButton
        onClick={() => {
          signIn("google", { callbackUrl: props.callbackUrl ?? "/" });
        }}
      />
    </>
  );
}
