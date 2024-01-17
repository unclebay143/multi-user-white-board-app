import { NextRequest, NextResponse } from "next/server";
import { StreamChat } from "stream-chat";

const STREAM_CHAT_API_KEY = process.env.NEXT_PUBLIC_STREAM_CHAT_API_KEY!;
const STREAM_CHAT_SECRET_KEY = process.env.NEXT_PUBLIC_STREAM_CHAT_SECRET_KEY!;

export const config = {
  api: {
    bodyParser: true,
  },
};

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ message: "user id is required" });
    }

    // Creating an instance of StreamChat
    const streamChat = new StreamChat(
      STREAM_CHAT_API_KEY,
      STREAM_CHAT_SECRET_KEY
    );

    // Creating a token for the user
    const token = streamChat.createToken(userId);

    return NextResponse.json({
      message: "Token generated successfully",
      token: token,
      username: userId,
    });
  } catch (error) {
    return NextResponse.json({
      status: 500,
      body: "An error occurred while processing the request." + error,
    });
  }
}
