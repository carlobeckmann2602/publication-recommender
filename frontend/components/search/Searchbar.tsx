"use client";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const FormSchema = z
  .object({
    query: z.string(),
  })
  .partial();

type Props = {
  value?: string;
  className?: string;
};

export function Searchbar({ value, className }: Props) {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      query: value || "",
    },
  });

  const router = useRouter();

  function onSubmit(data: z.infer<typeof FormSchema>) {
    if (data.query) router.push(`/search?q=${data.query}`);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={`flex w-full justify-center items-center max-w-3xl relative ${className}`}
      >
        <FormField
          control={form.control}
          name="query"
          render={({ field }) => (
            <FormItem className="flex-grow">
              <FormControl>
                <Input
                  className="pr-14"
                  type="text"
                  placeholder="Search for publications"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button variant="secondary" className="absolute right-0" type="submit">
          <Search className="h-4 w-4" />
        </Button>
      </form>
    </Form>
  );
}
