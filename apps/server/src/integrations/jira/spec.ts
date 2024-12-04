export function spec() {
  return {
    OAuth2: {
      token_url: 'https://auth.atlassian.com/oauth/token',
      authorization_url: 'https://auth.atlassian.com/authorize',
      scopes: ['read:jira-work', 'write:jira-work', 'read:jira-user'],
    },
  };
}
