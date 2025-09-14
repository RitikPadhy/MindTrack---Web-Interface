"use client";

import Link from 'next/link';
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from 'next/navigation';
import { getApiBase } from "@/lib/apiBase";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import Image from 'next/image';

import FormField from "@/components/formField";

const signInFormSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(3, "Password must be at least 3 characters"),
});

const SignInPage = () => {
  const router = useRouter();

  const form = useForm<z.infer<typeof signInFormSchema>>({
    resolver: zodResolver(signInFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof signInFormSchema>) => {
    try {
      const baseUrl = getApiBase();
      const response = await fetch(`${baseUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(values),
      });

      if (response.status === 401 || response.status === 403) {
        form.setError("root", {
          type: "manual",
          message: "Invalid login. Please check your details.",
        });
        return;
      }

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Something went wrong.");
      }

      form.setError("root", {
        type: "manual",
        message: "Login successful! Redirecting...",
      });

      setTimeout(() => {
        router.replace('/');
      }, 1000);
    }  catch (error: unknown) {
      if (error instanceof Error) {
        form.setError("root", {
          type: "manual",
          message: error.message,
        });
      } else {
        form.setError("root", {
          type: "manual",
          message: "Signin failed. Please try again.",
        });
      }
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen">
      <Image
        src="/sign-background.avif"
        alt="Background"
        layout="fill"
        objectFit="cover"
        quality={100}
        className="z-0"
      />
      <div className="absolute inset-0 bg-black opacity-0 z-10 backdrop-blur-sm"></div>
      <Card className="relative p-0 z-20 w-full lg:max-w-4xl 2xl:max-w-4xl lg:min-h-[250px] 2xl:min-h-[450px] transform transition-all duration-300 bg-white backdrop-blur-sm border border-gray-200 shadow-2xl rounded-2xl overflow-hidden flex flex-col md:flex-row">
        <div className="w-full md:w-2/5 p-6 flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-center text-primary-100 lg:text-[32px] 2xl:text-[30px]">MindTrack</CardTitle>
            <CardDescription className="text-center text-light-100 lg:text-[16px] mt-2">
              Sign In to Your Workspace
            </CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col justify-between mt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  label="Email"
                  placeholder="Your email address"
                  type="email"
                />

                <FormField
                  control={form.control}
                  name="password"
                  label="Password"
                  placeholder="Enter your password"
                  type="password"
                />

                {form.formState.errors.root?.message && (
                  <p className={`text-center text-sm font-medium ${
                    form.formState.errors.root.message.includes("success")
                      ? "text-green-600"
                      : "text-red-500"
                  }`}>
                    {form.formState.errors.root.message}
                  </p>
                )}

                <div className="w-full flex justify-center mt-6">
                  <Button type="submit" className="btn w-48 cursor-pointer">Login</Button>
                </div>
              </form>
            </Form>
          </CardContent>

          <CardFooter className="flex justify-center mt-6">
            <p className="text-center text-light-100">
              No account yet?
              <Link href="/sign-up" prefetch={false} className="font-bold text-user-primary ml-1">
                Sign Up
              </Link>
            </p>
          </CardFooter>
        </div>

        <div className="w-full md:w-3/5 h-[250px] md:h-auto relative">
          <Image
            src="/sign-background.avif"
            alt="Login Side"
            fill
            className="object-cover"
            priority
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-opacity-40 flex items-center justify-center px-6">
            <div className="text-center space-y-3">
              <h2 className="text-[24px] lg:text-[32px] 2xl:text-[42px] font-bold text-primary-100">
                Welcome to <span className="text-user-primary">MindTrack</span>
              </h2>
              <p className="text-sm lg:text-base leading-snug max-w-md mx-auto text-light-100">
                Empowering Therapists. Engaging Patients. Tracking Progress.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SignInPage;