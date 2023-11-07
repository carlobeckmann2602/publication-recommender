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
import { toast } from "@/components/ui/use-toast";
import {
  ExclamationTriangleIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";

import { useRouter } from "next/navigation";
import { useState } from "react";
import TextSeparator from "@/components/TextSeparator";
import GoogleButton from "@/components/login/GoogleButton";
import { signIn } from "next-auth/react";
import Link from "next/link";

const FormSchema = z
  .object({
    name: z
      .string({
        required_error: "Name is required",
      })
      .min(2, {
        message: "Name must be at least 2 characters.",
      }),
    email: z
      .string({
        required_error: "Name is required",
      })
      .email({ message: "Invalid email address" }),
    password: z
      .string()
      .min(2, { message: "Password must be 2 or more characters long" }),
    confirm: z.string(),
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
  const [showPassword, setPasswordVisibility] = useState(false);
  const togglePasswordVisibility = () => {
    setPasswordVisibility(!showPassword);
  };
  const [showConfirmPassword, setConfirmPasswordVisibility] = useState(false);
  const toggleConfirmPasswordVisibility = () => {
    setConfirmPasswordVisibility(!showConfirmPassword);
  };

  function onSubmit(data: z.infer<typeof FormSchema>) {
    router.push("/");
    toast({
      title: "You submitted the following values:",
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    });
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
                  <Input placeholder="Name" {...field} />
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
                  <Input placeholder="Email" {...field} />
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
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm Password"
                      {...field}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 cursor-pointer">
                      {showConfirmPassword ? (
                        <EyeSlashIcon
                          className="h-6 w-6"
                          onClick={toggleConfirmPasswordVisibility}
                        />
                      ) : (
                        <EyeIcon
                          className="h-6 w-6"
                          onClick={toggleConfirmPasswordVisibility}
                        />
                      )}
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full">
            Create Account
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
      <div className="flex flex-col gap-4">
        <GoogleButton
          onClick={() => {
            signIn("google", { callbackUrl: props.callbackUrl ?? "/" });
          }}
        />
      </div>
      <span className="text-center">
        Already have an account?{" "}
        <Link href={"/signup"} className="underline">
          Sign In
        </Link>
      </span>
    </>
  );
}
