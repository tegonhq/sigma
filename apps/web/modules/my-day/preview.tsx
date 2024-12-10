import { useRemoteComponent } from 'common/RemoteComponent';

const url = "http://localhost:8000/local/Users/harshithmullapudi/Documents/sigma-integrations/github/dist/frontend/index.js"; // prettier-ignore

export const Preview = () => {
  const [loading, err, Component] = useRemoteComponent(url, 'Preview');

  if (loading) {
    return <div>Loading...</div>;
  }

  if (err) {
    return <div>Unknown Error: {err.toString()}</div>;
  }

  return <Component />;
};
