"use client";

import {
  FormControl,
  FormDescription,
  FormField as HookFormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input"; // Assuming this is your Input component

interface FormFieldProps {
  control: any; // You might want to refine this type based on your react-hook-form setup
  name: string;
  label: string;
  placeholder: string;
  type?: string;
  description?: string; // Optional: if you want to use FormDescription
}

const FormField = ({ control, name, label, placeholder, type = "text", description }: FormFieldProps) => {
  return (
    <HookFormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              placeholder={placeholder}
              {...field}
              type={type}
              className="bg-white" // This ensures the input background is white
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default FormField;