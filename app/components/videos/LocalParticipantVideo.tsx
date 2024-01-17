import {
  ParticipantView,
  StreamVideoParticipant,
} from "@stream-io/video-react-sdk";
import Spinner from "./Spinner";

const LocalParticipantVideo = (props: {
  participant?: StreamVideoParticipant;
}) => {
  const { participant } = props;
  return (
    <div className='relative h-32 w-32 xl:h-full xl:w-full'>
      <ParticipantView
        participant={participant!}
        VideoPlaceholder={VideoPlaceholder}
      />
    </div>
  );
};

const VideoPlaceholder = () => {
  return (
    <div className='absolute inset-0 bg-slate-700 z-[1] text-center text-slate-300 flex items-center justify-center'>
      <Spinner />
    </div>
  );
};

export default LocalParticipantVideo;
