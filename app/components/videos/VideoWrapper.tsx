import React, { useEffect, useState } from "react";
import {
  StreamCall,
  StreamVideo,
  StreamVideoClient,
  User,
} from "@stream-io/video-react-sdk";
import { generateUserVideoToken } from "@/app/services/user.service";
import Spinner from "./Spinner";

type Props = { children: any; userData: any; callId: string };

const VideoWrapper = (props: Props) => {
  const { children, userData, callId } = props;
  const [client, setClient] = useState<any>(null);
  const [call, setCall] = useState<any>(null);

  useEffect(() => {
    const initVideoCall = async () => {
      console.count("initVideoCall");
      try {
        const { token } = await generateUserVideoToken(userData?.id);
        console.log(token);

        // Set up the user object
        const user: User = {
          id: userData?.id,
          name: userData?.user_metadata?.userName,
          image: `https://getstream.io/random_svg/?id=${userData?.user_metadata?.userName}&name=${userData?.user_metadata?.userName}`,
        };

        console.log(user);

        const video_client = new StreamVideoClient({
          apiKey: process.env.NEXT_PUBLIC_STREAM_CHAT_API_KEY!,
          user,
          token,
        });

        setClient(video_client);
        const callType = "development";
        const call = video_client.call(callType, callId);
        call.join({ create: true });

        setCall(call);
      } catch (error) {
        console.log(error);
      }
    };
    if (userData) {
      initVideoCall();
    }
  }, []);

  if (!client || !call) {
    return (
      <div className='mt-2 h-32 flex justify-center items-center'>
        <Spinner />
      </div>
    );
  }

  return (
    <StreamVideo client={client}>
      <StreamCall call={call}>{children}</StreamCall>
    </StreamVideo>
  );
};

export default VideoWrapper;
