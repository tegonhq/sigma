import { CacheModule } from '@nestjs/cache-manager';
import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { PrismaModule } from 'nestjs-prisma';

import config from 'common/configs/config';
import { loggingMiddleware } from 'common/middleware/logging.middleware';

import { ActivityModule } from 'modules/activity/activity.module';
import { AIRequestsModule } from 'modules/ai-requests/ai-requests.module';
import { ALSModule } from 'modules/als/als.module';
import { AuthModule } from 'modules/auth/auth.module';
import { ContentModule } from 'modules/content/content.module';
import { ConversationModule } from 'modules/conversation/conversation.module';
import { ConversationHistoryModule } from 'modules/conversation-history/conversation-history.module';
import { IntegrationAccountModule } from 'modules/integration-account/integration-account.module';
import { IntegrationDefinitionModule } from 'modules/integration-definition/integration-definition.module';
import { IntegrationsModule } from 'modules/integrations/integrations.module';
import { OAuthCallbackModule } from 'modules/oauth-callback/oauth-callback.module';
import { PagesModule } from 'modules/pages/pages.module';
import { PromptsModule } from 'modules/prompts/prompts.module';
import { ReplicationModule } from 'modules/replication/replication.module';
import { SyncActionsModule } from 'modules/sync-actions/sync-actions.module';
import { TaskOccurenceModule } from 'modules/task-occurence/task-occurence.model';
import { TasksModule } from 'modules/tasks/tasks.module';
import { TriggerdevModule } from 'modules/triggerdev/triggerdev.module';
import { UsersModule } from 'modules/users/users.module';
import { WebhookModule } from 'modules/webhook/webhook.module';
import { WorkspacesModule } from 'modules/workspaces/workspaces.module';

import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    CacheModule.register({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
    ConfigModule.forRoot({ isGlobal: true, load: [config] }),
    ConfigModule.forRoot({ envFilePath: '.env' }),
    PrismaModule.forRoot({
      isGlobal: true,
      prismaServiceOptions: {
        middlewares: [loggingMiddleware(new Logger('PrismaMiddleware'))], // configure your prisma middleware
      },
    }),

    MailerModule.forRoot({
      transport: {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: true,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      },
      defaults: {
        from: `${process.env.SMTP_DEFAULT_FROM}`,
      },
      template: {
        dir: `${process.cwd()}/templates`,
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
    AuthModule.forRoot(),
    ALSModule,
    UsersModule,
    WorkspacesModule,
    SyncActionsModule,
    ReplicationModule,
    PagesModule,
    ContentModule,
    IntegrationAccountModule,
    IntegrationDefinitionModule,
    OAuthCallbackModule,
    ConversationModule,
    ConversationHistoryModule,
    WebhookModule,
    ActivityModule,
    TasksModule,
    IntegrationsModule,
    TaskOccurenceModule,
    AIRequestsModule,
    PromptsModule,
<<<<<<< HEAD
    TriggerdevModule,
=======
>>>>>>> 94a679f (Feat: task scheduling, AI requests and task occurence trigger)
  ],
  controllers: [AppController],
  providers: [
    AppService,

    // { provide: APP_INTERCEPTOR, useClass: SyncActionsInterceptor },
  ],
})
export class AppModule {}
