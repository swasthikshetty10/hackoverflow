import Pusher from "pusher";

export const pusher = new Pusher({
  appId: process.env.app_id as string,
  key: process.env.key as string,
  secret: process.env.secret as string,
  cluster: process.env.cluster as string,
  useTLS: true,
});
