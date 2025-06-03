import { BadRequestException } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { TypePasswordlessEmailDeliveryInput } from 'supertokens-node/lib/build/recipe/passwordless/types';
import jwt from 'supertokens-node/recipe/jwt';
import Passwordless from 'supertokens-node/recipe/passwordless';
import Session from 'supertokens-node/recipe/session';
import ThirdParty from 'supertokens-node/recipe/thirdparty';
import UserRoles from 'supertokens-node/recipe/userroles';

import { LoggerService } from 'modules/logger/logger.service';
import { UsersService } from 'modules/users/users.service';

const logger = new LoggerService('Supertokens');
const isDev = process.env.NODE_ENV === 'development';

function logOtp(email: string, otp: string) {
  const message = `##### sendEmail to ${email}, subject: Login email

Log in to heysol.ai

Click here to log in with this otp:
${otp}\n\n`;

  if (isDev) {
    logger.info({ message });
  }
}

export const recipeList = (
  usersService: UsersService,
  mailerService: MailerService,
) => {
  return [
    jwt.init(),
    UserRoles.init(),
    Session.init({
      cookieSecure: true,
      override: {
        functions(originalImplementation) {
          return {
            ...originalImplementation,
            async createNewSession(input) {
              // since frontend needs workspaces we converted usersOnWorkspaces
              // To workspaces
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const user = (await usersService.getUser(input.userId)) as any;
              const workspace = user.workspace;

              const workspaceData = workspace
                ? { workspaceId: workspace.id, role: workspace.role }
                : {};

              input.accessTokenPayload = {
                ...input.accessTokenPayload,
                ...workspaceData,
              };

              return originalImplementation.createNewSession(input);
            },
          };
        },
      },
    }), // initializes session features
    ThirdParty.init({
      signInAndUpFeature: {
        providers: [
          {
            config: {
              thirdPartyId: 'google',
              clients: [
                {
                  clientId: process.env.GOOGLE_CLIENT_ID,
                  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                },
              ],
            },
          },
        ],
      },
      override: {
        functions: (originalImplementation) => {
          return {
            ...originalImplementation,
            async signInUp(input) {
              // First we call the original implementation of signInUp.
              const response = await originalImplementation.signInUp(input);

              // Post sign up response, we check if it was successful
              if (response.status === 'OK') {
                const { id, emails } = response.user;
                const email = emails[0];

                if (input.session === undefined) {
                  if (
                    response.createdNewRecipeUser &&
                    response.user.loginMethods.length === 1
                  ) {
                    await usersService.upsertUser(
                      id,
                      email,
                      email.split('@')[0],
                    );
                  }
                }
              }
              return response;
            },
          };
        },
      },
    }), // initializes signin / sign up features

    Passwordless.init({
      contactMethod: 'EMAIL',
      flowType: 'USER_INPUT_CODE_AND_MAGIC_LINK',
      emailDelivery: {
        override: (originalImplementation) => {
          return {
            ...originalImplementation,
            async sendEmail({
              email,
              urlWithLinkCode,
              userInputCode,
              codeLifetime,
            }: TypePasswordlessEmailDeliveryInput) {
              logOtp(email, userInputCode);

              try {
                await mailerService.sendMail({
                  to: email,
                  subject: 'Login for Sol',
                  template: 'loginUser',
                  context: {
                    userName: email.split('@')[0],
                    magicLink: urlWithLinkCode,
                    userInputCode,
                    linkExpiresIn: Math.floor(codeLifetime / 60000),
                  },
                });
              } catch (error) {
                logger.error({
                  message: `Error while sending mail`,
                  where: `supertokens.config.recipeList`,
                  error,
                });
              }
            },
          };
        },
      },
      override: {
        functions: (originalImplementation) => {
          return {
            ...originalImplementation,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            consumeCode: async (input: any) => {
              // First we call the original implementation of consumeCode.
              const response = await originalImplementation.consumeCode(input);

              // Post sign up response, we check if it was successful
              if (response.status === 'OK') {
                const { id, emails } = response.user;
                const email = emails[0];

                if (input.session === undefined) {
                  if (
                    response.createdNewRecipeUser &&
                    response.user.loginMethods.length === 1
                  ) {
                    if (isDev) {
                      await usersService.upsertUser(
                        id,
                        email,
                        email.split('@')[0],
                      );
                    } else {
                      throw new BadRequestException('Only enabled in dev mode');
                    }
                  }
                }
              }
              return response;
            },
          };
        },
      },
    }),
  ];
};
