"use client";

import React, { useEffect, useState } from "react";
import { RoomCard, RoomCardSkeleton } from "./RoomCard";
import NewRoomModal from "./NewRoomModal";
import { fetchUserDrawingRooms } from "@/app/services/drawing-room.service";
import Header from "./Header";

export type RoomType = {
  id: string;
  name: string;
  created_at: string;
  isPublic: boolean;
};

type Props = {
  session: any;
};

const DashboardBody = (props: Props) => {
  const { session } = props;
  const [rooms, setRooms] = useState<RoomType[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showCreateRoomModal, setShowCreateRoomModal] =
    useState<boolean>(false);

  // Conditions
  const hasNotCreatedARoom = !loading && rooms?.length === 0;
  const hasAtLeastOneRoom = rooms && rooms!.length >= 0;
  const shouldShowRoom = !loading && hasAtLeastOneRoom;

  const loadUserDrawingRooms = async () => {
    return fetchUserDrawingRooms(session?.user?.id).then((res) => {
      setRooms(res);
    });
  };

  useEffect(() => {
    if (session?.user?.id) {
      loadUserDrawingRooms().then((res) => {
        setLoading(false);
      });
    }
  }, [session?.user?.id]);

  return (
    <div className='max-w-5xl flex flex-col gap-10 mx-auto pt-30 p-4'>
      <Header
        session={session}
        setShowCreateRoomModal={setShowCreateRoomModal}
      />

      {hasNotCreatedARoom && (
        <p className='text-slate-600 text-center mt-3'>
          Your drawing rooms will display here when you create new rooms.
        </p>
      )}

      <section className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
        {loading && (
          <>
            {Array(5)
              .fill(5)
              .map((_, i) => (
                <RoomCardSkeleton key={i} />
              ))}
          </>
        )}

        {shouldShowRoom && (
          <>
            {rooms?.map(({ id, name, created_at, isPublic }) => (
              <RoomCard
                key={id}
                id={id}
                name={name}
                created_at={created_at}
                isPublic={isPublic}
              />
            ))}
          </>
        )}
      </section>
      <NewRoomModal
        show={showCreateRoomModal}
        setShow={setShowCreateRoomModal}
        loadUserDrawingRooms={loadUserDrawingRooms}
        session={session}
      />
    </div>
  );
};

export default DashboardBody;
