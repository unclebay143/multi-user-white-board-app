import {
  ParticipantView,
  StreamVideoParticipant,
} from "@stream-io/video-react-sdk";
import React from "react";
import Spinner from "./Spinner";

type Props = {
  participants: StreamVideoParticipant[];
};

const RemoteParticipantVideoList = (props: Props) => {
  const { participants } = props;

  return (
    <div className='relative h-32 w-32 xl:h-full xl:w-full'>
      {participants.map((participant) => (
        <ParticipantView
          participant={participant}
          key={participant.sessionId}
          VideoPlaceholder={VideoPlaceholder}
        />
      ))}
    </div>
  );
};

export const VideoPlaceholder = ({
  participant,
}: {
  participant: StreamVideoParticipant;
}) => {
  return (
    <div className='absolute inset-0 bg-slate-700 z-[1] text-center text-slate-300 flex items-center justify-center'>
      <div className='hidden xl:flex items-center justify-center'>
        <span className='capitalize'>{participant.name}</span>
        <p className='lowercase ml-1'> is joining</p>
      </div>
      <div className='xl:hidden'>
        <Spinner />
      </div>
    </div>
  );
};

export default RemoteParticipantVideoList;
