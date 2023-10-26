/* "use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";

export function Searchbar() {
  const [query, setQuery] = useState("");

  const router = useRouter();

  const handleSubmit = () => {
    console.log(query);
    router.push(`/search?q=${query}`);
  };

  return (
    <div className="flex w-full max-w-sm items-center space-x-2">
      <form>
        <Input
          type="text"
          placeholder="Search Term"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Button type="submit" onClick={handleSubmit}>
          Search
        </Button>
      </form>
    </div>
  );
} */

"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
import { Input } from "@/components/ui/input";

const FormSchema = z.object({
  query: z.string(),
});

export function Searchbar() {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      query: "",
    },
  });

  const [query, setQuery] = useState("");

  const router = useRouter();

  function onSubmit(data: z.infer<typeof FormSchema>) {
    console.log(query);
    router.push(`/search?q=${query}`);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex">
        <FormField
          control={form.control}
          name="query"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  type="text"
                  placeholder="Search Term"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Search</Button>
      </form>
    </Form>
  );
}
