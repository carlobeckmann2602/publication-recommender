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

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import GoogleButton from "@/components/login/GoogleButton";
import TextSeparator from "@/components/TextSeparator";
import { useRouter } from "next/navigation";
import { allowBackgroundScrolling } from "@/lib/modal-controlls";
import { AlertTriangle, Eye, EyeOff } from "lucide-react";

const FormSchema = z.object({
  email: z
    .string({
      required_error: "Name is required",
    })
    .email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be 8 or more characters long" }),
});

type Props = {
  callbackUrl?: string;
  error?: string;
};

export function LogInForm(props: Props) {
  const [errorMsg, setErrorMsg] = useState(props.error);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const [showPassword, setPasswordVisibility] = useState(false);
  const togglePasswordVisibility = () => {
    setPasswordVisibility((prev) => !prev);
  };
  const router = useRouter();

  async function onSubmit(data: z.infer<typeof FormSchema>) {
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
                <div className="relative">
                  <FormControl>
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      autoComplete="on"
                      {...field}
                    />
                  </FormControl>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 cursor-pointer">
                    {showPassword ? (
                      <EyeOff
                        className="h-6 w-6"
                        onClick={togglePasswordVisibility}
                      />
                    ) : (
                      <Eye
                        className="h-6 w-6"
                        onClick={togglePasswordVisibility}
                      />
                    )}
                  </div>
                </div>
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
      {!!errorMsg && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{errorMsg}</AlertDescription>
        </Alert>
      )}
      <TextSeparator>or</TextSeparator>
      <div className="flex flex-col gap-4">
        <GoogleButton
          onClick={() => {
            signIn("google", { callbackUrl: props.callbackUrl ?? "/" });
          }}
        />
      </div>
      <span className="text-center">
        Dont have an account?{" "}
        <Link
          href={"/signup"}
          scroll={false}
          replace={true}
          className="underline"
        >
          Create Account
        </Link>
      </span>
    </>
  );
}
