"use client";

import React, { useEffect, useState } from "react";
import { fetchUserById, getUserSession } from "../../services/user.service";
import { useParams } from "next/navigation";
import { fetchDrawingRoomById } from "../../services/drawing-room.service";
import Navbar from "../../components/Navbar";
import BoardContainer from "@/app/components/drawing-room/BoardContainer";
import VideoWrapper from "@/app/components/videos/VideoWrapper";
import VideoLayout from "@/app/components/videos/VideoLayout";

const DrawingRoomPage = () => {
  const { roomId } = useParams();
  const [owner, setOwner] = useState<any | null>(null);
  const [room, setRoom] = useState<any>([]);
  const [user, setUser] = useState<any>({});
  const [session, setSession] = useState<any>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [participantCount, setParticipantCount] = useState<number>(0);

  useEffect(() => {
    getUserSession().then((session) => {
      setSession(session);
      setUser(session?.user);

      fetchDrawingRoomById(roomId as string).then((room) => {
        const canEnterRoom =
          room![0].isPublic || room![0].owner === session?.user?.id;

        if (!canEnterRoom) {
          return (window.location.href = "/");
        }
        setRoom(room![0]);
        setIsLoading(false);
        fetchUserById(room![0].owner).then((res) => {
          setOwner(res.user);
        });
      });
    });
  }, []);

  useEffect(() => {
    const invalidCursor = document.getElementById("undefined-cursor")!;
    if (invalidCursor) {
      invalidCursor.style.display = "none";
    }
  }, []);

  return (
    <main>
      <Navbar
        session={session}
        owner={owner}
        room={room}
        isRoom
        isLoadingRoom={isLoading}
        participantCount={participantCount}
      />
      <div
        className='relative w-full h-full'
        style={{
          background: "linear-gradient(45deg, #03A9F4, #4CAF50)",
        }}
      >
        {isLoading ? (
          <div className='flex justify-center items-center h-screen text-white'>
            <p>One moment. Please...</p>
          </div>
        ) : (
          <div className='w-full flex flex-col-reverse xl:flex-row'>
            <BoardContainer room={room} />
            <section className='min-w-[15rem] max-w-[15rem] xl:min-h-0 relative mx-auto flex items-center xl:flex-col gap-3 text-white'>
              <VideoWrapper userData={user} callId={room?.id}>
                <VideoLayout setParticipantCount={setParticipantCount} />
              </VideoWrapper>
            </section>
          </div>
        )}
      </div>
    </main>
  );
};

export default DrawingRoomPage;
