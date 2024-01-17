import {
  CallingState,
  StreamTheme,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";
import React, { useEffect } from "react";
import Spinner from "./Spinner";
import LocalParticipantVideo from "./LocalParticipantVideo";
import RemoteParticipantVideoList from "./RemoteParticipantVideoList";

type Props = { setParticipantCount: Function };

const VideoLayout = (props: Props) => {
  const {
    useCallCallingState,
    useParticipantCount,
    useLocalParticipant,
    useRemoteParticipants,
  } = useCallStateHooks();

  const callingState = useCallCallingState();
  const localParticipant = useLocalParticipant();
  const remoteParticipants = useRemoteParticipants();
  const participantCount = useParticipantCount();

  useEffect(() => {
    props.setParticipantCount(participantCount);
  }, [participantCount, props]);

  if (callingState !== CallingState.JOINED) {
    return (
      <div className='mt-2 h-32 flex justify-center items-center '>
        <Spinner />
      </div>
    );
  }

  return (
    <StreamTheme>
      <div className='grid grid-cols-2 xl:grid-cols-1 gap-10 xl:gap-4 text-white capitalize'>
        <LocalParticipantVideo participant={localParticipant} />
        <RemoteParticipantVideoList participants={remoteParticipants} />
      </div>
    </StreamTheme>
  );
};

export default VideoLayout;
