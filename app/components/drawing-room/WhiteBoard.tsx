import React, { useEffect, useRef, useState } from "react";
import { RealtimeChannel } from "@supabase/supabase-js";
import { updateRoomDrawing } from "@/app/services/drawing-room.service";
import { supabase } from "@/app/lib/initSupabase";
import { fetchUserById, getUserSession } from "@/app/services/user.service";
import { DrawingPen } from "./BoardContainer";

interface BoardProps {
  room: any;
  drawingPen: DrawingPen;
}

function WhiteBoard(props: BoardProps) {
  const { room, drawingPen } = props;
  const MOUSE_EVENT = "cursor";

  const [session, setSession] = useState<any>();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const [drawingData, setDrawingData] = useState<string | null>(null);

  const boardAreaRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const createdCursorsRef = useRef<string[]>([]);

  const createUserMouseCursor = async (_userId: string) => {
    // Check if the cursor for this user has already been created
    if (createdCursorsRef.current.includes(_userId)) {
      return;
    }

    // Check if the cursor div for this user already exists
    const existingCursorDiv = document.getElementById(_userId + "-cursor");
    if (existingCursorDiv) {
      return;
    }

    const cursorDiv = document.createElement("div");
    const svgElem = document.createElement("svg");
    svgElem.innerHTML = `
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-cursor-fill" viewBox="0 0 16 16">  
  <path d="M14.082 2.182a.5.5 0 0 1 .103.557L8.528 15.467a.5.5 0 0 1-.917-.007L5.57 10.694.803 8.652a.5.5 0 0 1-.006-.916l12.728-5.657a.5.5 0 0 1 .556.103z"/>
</svg>
`;

    cursorDiv.id = _userId + "-cursor";
    cursorDiv.classList.add("h-4", "w-4", "absolute", "z-50", "-scale-x-100");
    const { user } = await fetchUserById(_userId);
    cursorDiv.style.color = user?.user_metadata?.userColor;

    cursorDiv.appendChild(svgElem);
    if (boardAreaRef.current) {
      boardAreaRef.current.appendChild(cursorDiv);
    }

    // Add the user to the list of created cursors
    createdCursorsRef.current.push(_userId);
  };

  const receivedCursorPosition = ({
    payload,
  }: {
    [key: string]: any;
    type: "broadcast";
    event: string;
  }) => {
    // console.log("Receiving cursor position: " + payload);
    const { userId: _userId, x, y } = payload || {};
    const cursorDiv = document.getElementById(_userId + "-cursor");
    if (cursorDiv) {
      cursorDiv.style.left = x + "px";
      cursorDiv.style.top = y + "px";
    } else {
      createUserMouseCursor(_userId);
    }
  };

  const sendMousePosition = (
    channel: RealtimeChannel,
    userId: string,
    x: number,
    y: number
  ) => {
    // console.log("Sending cursor position: ", { userId, x, y });
    return channel.send({
      type: "broadcast",
      event: MOUSE_EVENT,
      payload: { userId, x, y },
    });
  };

  useEffect(() => {
    boardAreaRef?.current?.addEventListener("mousemove", (e) => {
      if (isAuthenticated && channel) {
        const container = document.querySelector("#container"); // Get the container
        const containerOffset = container!.getBoundingClientRect();

        // Calculate relative mouse position within the container
        const relativeX = e.clientX - containerOffset.left;
        const relativeY = e.clientY - containerOffset.top;

        sendMousePosition(channel, session?.user?.id, relativeX, relativeY);
      }
    });
  }, [isAuthenticated, channel, session?.user?.id]);

  useEffect(() => {
    if (channel) {
      // Subscribe to mouse events.
      channel
        .on("broadcast", { event: MOUSE_EVENT }, (payload) => {
          receivedCursorPosition(payload);
        })
        .subscribe();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channel]);

  useEffect(() => {
    if (isAuthenticated && room.id) {
      const client = supabase;
      const channel = client.channel(room.id);
      setChannel(channel);

      // Get updates from db changes
      client
        .channel("any")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "drawing-rooms" },
          (payload: any) => {
            setDrawingData(payload.new.drawing);
          }
        )
        .subscribe();
    }
  }, [isAuthenticated, room.id]);

  useEffect(() => {
    getUserSession().then((session) => {
      if (session?.user?.id) {
        setSession(session);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    });
  }, [session?.user?.id, session?.user?.user_metadata?.userColor]);

  useEffect(() => {
    // Setting the initial image data from supabase
    if (room.drawing) setDrawingData(room.drawing);
  }, [room.drawing]);

  useEffect(() => {
    const canvas = document.querySelector<HTMLCanvasElement>("#board");

    if (!canvas) return;
    const sketch = document.querySelector("#sketch")!;
    const sketchStyle = getComputedStyle(sketch);
    canvas.width = parseInt(sketchStyle.getPropertyValue("width"));
    canvas.height = parseInt(sketchStyle.getPropertyValue("height"));

    const mouse = { x: 0, y: 0 };
    const lastMouse = { x: 0, y: 0 };

    const getCanvasOffset = () => {
      const rect = canvas.getBoundingClientRect();
      return {
        left: rect.left,
        top: rect.top,
      };
    };

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    /* Drawing on Whiteboard */
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.lineWidth = drawingPen.size;
    ctx.strokeStyle = drawingPen.color;

    // Displaying the initial image data from supabase
    if (drawingData) {
      const image = new Image();
      image.onload = () => {
        ctx.drawImage(image, 0, 0);
      };
      image.src = drawingData;
    }

    const onPaint = () => {
      ctx.beginPath();
      ctx.moveTo(lastMouse.x, lastMouse.y);
      ctx.lineTo(mouse.x, mouse.y);
      ctx.closePath();
      ctx.stroke();

      if (timeoutRef.current !== null) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        const base64ImageData = canvas.toDataURL("image/png");
        updateRoomDrawing(room?.id, base64ImageData);
      }, 1000);
    };

    /* Mouse Capturing Events */
    canvas.addEventListener("mousemove", (e) => {
      const canvasOffset = getCanvasOffset();
      lastMouse.x = mouse.x;
      lastMouse.y = mouse.y;

      mouse.x = e.clientX - canvasOffset.left;
      mouse.y = e.clientY - canvasOffset.top;
    });

    canvas.addEventListener("mousedown", () => {
      canvas.addEventListener("mousemove", onPaint);
    });

    canvas.addEventListener("mouseup", () => {
      canvas.removeEventListener("mousemove", onPaint);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room?.id, drawingData, room.drawing]);

  useEffect(() => {
    const canvas = document.querySelector<HTMLCanvasElement>("#board");

    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.lineWidth = drawingPen.size;
    ctx.strokeStyle = drawingPen.color;
  }, [drawingPen.size, drawingPen.color]);

  return (
    <div className='my-auto w-full h-full border p-2'>
      <div className='w-full h-full relative' id='sketch' ref={boardAreaRef}>
        <div id='container' className='w-full h-full'>
          <canvas className='w-full h-full' id='board'></canvas>
        </div>
      </div>
    </div>
  );
}

export default WhiteBoard;
