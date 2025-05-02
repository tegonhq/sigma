import {Notification} from 'electron';

export const sendTestNotification = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const payload: any = {
    title: 'acreom s',
    body: 'This is how you will be notified.',
    hasReply: true,
    silent: false,
  };

  const notification = new Notification(payload);

  notification.show();
};
