import {Notification} from 'electron';

export const sendTestNotification = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const payload: any = {
    title: 'SAmple',
    body: 'This is how you will be notified as.',
    hasReply: true,
    silent: false,
  };

  const notification = new Notification(payload);

  notification.show();
};
