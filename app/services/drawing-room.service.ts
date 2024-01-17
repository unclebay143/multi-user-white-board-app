import { supabase } from "../lib/initSupabase";

const DRAWING_ROOM_TABLE = "drawing-rooms"; // supabase table name

export const createDrawingRoom = async (
  name: string,
  userId: string,
  isPublic: boolean
) => {
  const { data } = await supabase
    .from(DRAWING_ROOM_TABLE)
    .insert({
      name,
      owner: userId,
      isPublic,
      isPasswordProtected: false,
      password: null,
    })
    .select();

  return data;
};

export const fetchUserDrawingRooms = async (userId: string) => {
  const { data, error } = await supabase
    .from(DRAWING_ROOM_TABLE)
    .select()
    .eq("owner", userId)
    .order("created_at", { ascending: false });
  console.log(error);

  return data;
};

export const fetchDrawingRoomById = async (id: string) => {
  const { data } = await supabase
    .from(DRAWING_ROOM_TABLE)
    .select()
    .eq("id", id);
  return data;
};

export const updateRoomDrawing = async (roomId: string, drawing: any) => {
  const { data } = await supabase
    .from(DRAWING_ROOM_TABLE)
    .update({
      drawing,
    })
    .eq("id", roomId)
    .select();

  return data;
};
