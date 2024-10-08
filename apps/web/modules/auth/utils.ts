import { useToast } from '@sigma/ui/components/ui/use-toast';
import React from 'react';
import {
  consumeCode,
  clearLoginAttemptInfo,
} from 'supertokens-web-js/recipe/passwordless';
import { createCode } from 'supertokens-web-js/recipe/passwordless';

export function useSupertokenFunctions() {
  const [emailSent, setEmailSent] = React.useState(false);
  const { toast } = useToast();

  async function sendOTP(email: string) {
    try {
      const response = await createCode({
        email,
      });

      if (response.status === 'SIGN_IN_UP_NOT_ALLOWED') {
        // the reason string is a user friendly message
        // about what went wrong. It can also contain a support code which users
        // can tell you so you know why their sign in / up was not allowed.
        toast({
          variant: 'destructive',
          title: 'Error!',
          description: response.reason,
        });
      } else {
        setEmailSent(true);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.log(err);
      if (err.isSuperTokensGeneralError === true) {
        // this may be a custom error message sent from the API by you,
        toast({
          variant: 'destructive',
          title: 'Error!',
          description: err.message,
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Error!',
          description: 'Oops! Something went wrong.',
        });
      }
    }
  }

  async function handleOTPInput(otp: string) {
    try {
      let response = await consumeCode({
        userInputCode: otp,
      });

      if (response.status === 'OK') {
        // we clear the login attempt info that was added when the createCode function
        // was called since the login was successful.
        await clearLoginAttemptInfo();
        if (
          response.createdNewRecipeUser &&
          response.user.loginMethods.length === 1
        ) {
          // user sign up success
        } else {
          // user sign in success
        }
        window.location.assign('/');
      } else if (response.status === 'INCORRECT_USER_INPUT_CODE_ERROR') {
        // the user entered an invalid OTP
        toast({
          variant: 'destructive',
          title: 'Error!',
          description:
            'Wrong OTP! Please try again. Number of attempts left: ' +
            (response.maximumCodeInputAttempts -
              response.failedCodeInputAttemptCount),
        });
      } else if (response.status === 'EXPIRED_USER_INPUT_CODE_ERROR') {
        // it can come here if the entered OTP was correct, but has expired because
        // it was generated too long ago.

        toast({
          variant: 'destructive',
          title: 'Error!',
          description:
            'Old OTP entered. Please regenerate a new one and try again',
        });
      } else {
        // this can happen if the user tried an incorrect OTP too many times.
        // or if it was denied due to security reasons in case of automatic account linking

        // we clear the login attempt info that was added when the createCode function
        // was called - so that if the user does a page reload, they will now see the
        // enter email / phone UI again.
        await clearLoginAttemptInfo();
        toast({
          variant: 'destructive',
          title: 'Error!',
          description: 'Oops! Something went wrong.',
        });

        window.location.assign('/auth');
      }
    } catch (err: any) {
      if (err.isSuperTokensGeneralError === true) {
        // this may be a custom error message sent from the API by you.
        toast({
          variant: 'destructive',
          title: 'Error!',
          description: err.message,
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Error!',
          description: 'Oops! Something went wrong.',
        });
      }
    }
  }

  return { handleOTPInput, sendOTP, emailSent, setEmailSent };
}
