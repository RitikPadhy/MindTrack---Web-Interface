"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { getApiBase } from "@/lib/apiBase";

// shadcn/ui components
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";

// ---------- Form schema ----------
const signUpFormSchema = z.object({
  uid: z.string().min(5, "UID must be at least 5 characters"), // you need to provide UID
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["Patient", "Admin"], { required_error: "Role is required" }),
});

const SignUpPage = () => {
  const router = useRouter();

  const form = useForm<z.infer<typeof signUpFormSchema>>({
    resolver: zodResolver(signUpFormSchema),
    defaultValues: {
      uid: "",
      email: "",
      password: "",
      role: "Patient",
    },
  });

  const onSubmit = async (values: z.infer<typeof signUpFormSchema>) => {
    try {
      const baseUrl = getApiBase();
      const response = await fetch(`${baseUrl}/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Signup failed");
      }

      toast.success("Account created successfully. Please sign in.");
      router.push("/sign-in");
    } catch (error: any) {
      toast.error(`Signup failed: ${error.message}`);
      console.error("Signup error:", error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen relative">
      <Image
        src="/sign-background.avif"
        alt="Background"
        fill
        className="z-0 pointer-events-none absolute object-cover"
      />
      <div className="absolute inset-0 bg-black/0 z-10 backdrop-blur-sm"></div>
      <Card className="relative z-20 w-full max-w-md lg:min-h-[250px] 2xl:min-h-[450px] bg-white backdrop-blur-xl border border-gray-300 shadow-xl rounded-2xl">
        <CardHeader>
          <CardTitle className="text-center text-primary-100 text-2xl">
            TestHive
          </CardTitle>
          <CardDescription className="text-center text-light-100 text-sm">
            Register to explore your workspace
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col space-y-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

              {/* UID */}
              <FormField
                control={form.control}
                name="uid"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>UID</FormLabel>
                    <FormControl>
                      <Input placeholder="Unique User ID" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Your email address" type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your password" type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Role */}
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-user-primary"
                      >
                        <option value="Patient">Patient</option>
                        <option value="Admin">Admin</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit */}
              <div className="flex justify-center">
                <Button type="submit" className="w-48 cursor-pointer">
                  Create an account
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>

        <CardFooter className="flex justify-center">
          <p className="text-center text-light-100">
            Already have an account?
            <Link href="/sign-in" className="font-bold text-user-primary ml-1">
              Sign In
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SignUpPage;