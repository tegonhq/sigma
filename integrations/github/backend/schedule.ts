import { IntegrationAccount } from '@redplanethq/sol-sdk';
import axios from 'axios';

import { createActivity, getGithubData, ActivityCreate } from './utils';

export async function handleSchedule(integrationAccount: IntegrationAccount) {
  const integrationConfiguration = integrationAccount.integrationConfiguration as {
    access_token: string;
  };
  const settings = integrationAccount.settings as { lastSyncTime: string };
  // If lastSyncTime is not available, default to 1 day ago
  const lastSyncTime =
    settings.lastSyncTime || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const allowedReasons = [
    'assign',
    'review_requested',
    'mention',
    'state_change',
    'subscribed',
    'author',
    'approval_requested',
    'comment',
    'ci_activity',
    'invitation',
    'member_feature_requested',
    'security_alert',
    'security_advisory_credit',
    'team_mention',
  ];

  let page = 1;
  let hasMorePages = true;
  let notificationCount = 0;

  while (hasMorePages) {
    const notifications = await getGithubData(
      `https://api.github.com/notifications?page=${page}&per_page=50&all=true&since=${lastSyncTime}`,
      integrationConfiguration.access_token,
    );

    // Check if notifications exists and has data
    if (notifications.length === 0) {
      hasMorePages = false;
      break;
    }
    page++;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filteredNotifications = notifications.filter((notification: any) =>
      allowedReasons.includes(notification.reason),
    );

    notificationCount += filteredNotifications?.length || 0;

    const activity: ActivityCreate[] = [];

    await Promise.all(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      filteredNotifications.map(async (notification: any) => {
        const { reason, subject, repository } = notification;

        let title = '';
        let url = '';
        let sourceURL = '';
        let sourceId = '';
        let githubData;
        const isComment = subject.latest_comment_url?.includes('/comments/') || false;
        const isIssue = subject.type === 'Issue';
        const isPullRequest = subject.type === 'PullRequest';

        // Get data URL based on notification type
        if (subject.latest_comment_url) {
          url = subject.latest_comment_url;
        } else if (subject.url) {
          url = subject.url;
        }

        if (url) {
          // Fetch the full data from GitHub API
          githubData = await getGithubData(url, integrationConfiguration.access_token);
          sourceId = githubData.id?.toString() || '';
          sourceURL = githubData.html_url || url;

          // Create structured text based on notification reason
          switch (reason) {
            case 'approval_requested':
              title = `Deployment approval requested: ${repository.full_name}`;
              break;

            case 'assign':
              title = `${isIssue ? 'Issue' : 'PR'} assigned to you: #${githubData.number} - ${githubData.title}`;
              break;

            case 'author':
              if (isComment) {
                title = `New comment on your ${isIssue ? 'issue' : 'PR'} by ${githubData.user?.login}: ${githubData.body}`;
              } else {
                title = `You created this ${isIssue ? 'issue' : 'PR'}: #${githubData.number} - ${githubData.title}`;
              }
              break;

            case 'comment':
              title = `New comment by ${githubData.user?.login} in ${repository.full_name}: ${githubData.body}`;
              break;

            case 'manual':
              title = `You subscribed to: #${githubData.number} - ${githubData.title}`;
              break;

            case 'mention':
              title = `@mentioned by ${githubData.user?.login} in ${repository.full_name}: ${githubData.body}`;
              break;

            case 'review_requested':
              title = `PR review requested in ${repository.full_name}: #${githubData.number} - ${githubData.title}`;
              break;

            case 'state_change': {
              let stateInfo = '';
              if (githubData.state) {
                stateInfo = `to ${githubData.state}`;
              } else if (githubData.merged) {
                stateInfo = 'to merged';
              } else if (githubData.closed_at) {
                stateInfo = 'to closed';
              }
              title = `State changed ${stateInfo} in ${repository.full_name}: #${githubData.number} - ${githubData.title}`;
              break;
            }

            case 'subscribed':
              if (isComment) {
                title = `New comment on watched ${isIssue ? 'issue' : 'PR'} in ${repository.full_name} by ${githubData.user?.login}: ${githubData.body}`;
              } else if (isPullRequest) {
                title = `New PR created in watched repo ${repository.full_name}: #${githubData.number} - ${githubData.title}`;
              } else if (isIssue) {
                title = `New issue created in watched repo ${repository.full_name}: #${githubData.number} - ${githubData.title}`;
              } else {
                title = `Update in watched repo ${repository.full_name}: #${githubData.number} - ${githubData.title}`;
              }
              break;

            case 'team_mention':
              title = `Your team was mentioned in ${repository.full_name}`;
              break;

            default:
              title = `GitHub notification: ${repository.full_name}`;
              break;
          }

          activity.push({
            url,
            title,
            sourceId,
            sourceURL,
            integrationAccountId: integrationAccount.id,
          });
        }
      }),
    );

    if (activity.length > 0) {
      await createActivity(activity);
    }

    await axios.post(`/api/v1/integration_account/${integrationAccount.id}`, {
      settings: { ...settings, lastSyncTime: new Date().toISOString() },
    });
  }

  return { message: `Processed ${notificationCount} notifications from github` };
}
