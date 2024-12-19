/* eslint-disable react/no-unescaped-entities */
import { zodResolver } from "@hookform/resolvers/zod";
import { RiMailFill } from "@remixicon/react";
import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  Input,
  ArrowRight,
} from "@tegonhq/ui";
import { useRouter } from "next/router";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { AuthGuard } from "common/wrappers";

import { useIPC } from "hooks/ipc";
import { useIsElectron } from "hooks/use-is-electron";

import {
  useCreateAuthCodeMutation,
  type AuthCodeResponse,
} from "services/users";

import { AuthLayout } from "./layout";
import { getCookies, useSupertokenFunctions } from "./utils";

export const AuthSchema = z.object({
  email: z.string().email(),
  otp: z.string().optional(),
});

export function Auth() {
  const router = useRouter();
  const form = useForm<z.infer<typeof AuthSchema>>({
    resolver: zodResolver(AuthSchema),
    defaultValues: {
      email: "",
      otp: "",
    },
  });
  const [loading, setLoading] = React.useState(false);
  const { emailSent, sendOTP, handleOTPInput } = useSupertokenFunctions();
  const { mutate: createAuthCode, isLoading } = useCreateAuthCodeMutation({
    onSuccess: async (data: AuthCodeResponse) => {
      setLoading(true);
      ipc.openUrl(
        `${process.env.NEXT_PUBLIC_BASE_HOST}/authorize?code=${data.code}`
      );

      try {
        await getCookies(data.code);
        router.replace("/home");
      } catch (e) {}

      setLoading(false);
    },
  });
  const isElectron = useIsElectron();
  const ipc = useIPC();

  const onSubmit = async ({ email, otp }: { email: string; otp: string }) => {
    setLoading(true);

    if (emailSent) {
      await handleOTPInput(otp);
      return;
    }

    await sendOTP(email);

    setLoading(false);
  };

  const onLogin = () => {
    createAuthCode();
  };

  if (isElectron) {
    return (
      <AuthGuard>
        <AuthLayout>
          <div className="flex flex-col w-[360px] items-center">
            <h1 className="text-lg text-center">Welcome</h1>
            <div className="text-center text-muted-foreground mt-1 mb-8">
              Your second brain, supercharging dev life with AI.
            </div>
            <Button
              variant="secondary"
              className="w-fit"
              onClick={onLogin}
              isLoading={isLoading || loading}
            >
              Login
            </Button>
          </div>
        </AuthLayout>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <AuthLayout>
        <div className="flex flex-col w-[360px]">
          <h1 className="text-lg text-center">Welcome</h1>
          <div className="text-center text-muted-foreground mt-1 mb-8">
            Your second brain, supercharging dev life with AI.
          </div>

          <div className="flex flex-col gap-2">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-2"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder="Email address"
                          className="h-9"
                          {...field}
                        />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />

                {emailSent && (
                  <FormField
                    control={form.control}
                    name="otp"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            placeholder="OTP"
                            className="h-9"
                            type="number"
                            {...field}
                          />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <div className="flex justify-end">
                  <Button
                    className="flex gap-2"
                    size="xl"
                    full
                    type="submit"
                    isLoading={loading}
                    variant="secondary"
                  >
                    {emailSent ? (
                      <>
                        Continue <ArrowRight size={18} />
                      </>
                    ) : (
                      <>
                        <RiMailFill size={18} /> Send OTP
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>

          <div className="mt-4 text-xs text-muted-foreground">
            By clicking continue, you agree to our Terms of Service and Privacy
            Policy.
          </div>
        </div>
      </AuthLayout>
    </AuthGuard>
  );
}
