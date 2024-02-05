"use client";
import React, { useState } from "react";
import { FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import { ControllerRenderProps } from "react-hook-form";

type Props = {
  field: ControllerRenderProps<any, any>;
  enableVisibleToggle?: boolean;
};

export default function PasswordFormControl({
  field,
  enableVisibleToggle = true,
}: Props) {
  const [showPassword, setPasswordVisibility] = useState(false);
  const togglePasswordVisibility = () => setPasswordVisibility((prev) => !prev);

  return (
    <div className="relative">
      <FormControl className="pr-12">
        <Input
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          autoComplete="on"
          {...field}
        />
      </FormControl>
      {enableVisibleToggle && (
        <div
          className={`absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 ${
            enableVisibleToggle ? "cursor-pointer" : "cursor-not-allowed"
          }`}
        >
          {showPassword ? (
            <EyeOff className="h-6 w-6" onClick={togglePasswordVisibility} />
          ) : (
            <Eye className="h-6 w-6" onClick={togglePasswordVisibility} />
          )}
        </div>
      )}
    </div>
  );
}
