import { NextApiRequest, NextApiResponse } from "next";
import { pusher } from "../../utils/pusher";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { message, sender } = req.body;
  console.log("here", message, sender);
  const response = await pusher.trigger("chat", "chat-event", {
    message,
    sender,
  });

  res.json({ message: "completed" });
}
