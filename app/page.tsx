"use client";

import Navbar from "./components/Navbar";
import { useEffect, useState } from "react";
import { getUserSession } from "./services/user.service";
import { supabase } from "./lib/initSupabase";
import DashboardBody from "./components/dashboard/DashboardBody";
import { Audio, ThreeDots } from "react-loader-spinner";

export default function Home() {
  const [session, setSession] = useState<any>();
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(true);

  function generateUserColor() {
    const colors = [
      "#3b82f6",
      "#14b8a6",
      "#f87171",
      "#eab308",
      "#a855f7",
      "#6366f1",
    ];
    const index = Math.floor(Math.random() * colors.length);
    return colors[index];
  }

  function createUsernameFromEmail(email: string) {
    try {
      let username = email?.split("@")[0];
      return username;
    } catch (error) {
      throw new Error("Error occurred while creating username: " + error);
    }
  }

  useEffect(() => {
    getUserSession()
      .then((session) => {
        if (session) {
          // First time user (don't have username and color )
          const isNewUser =
            !session?.user?.user_metadata?.userName &&
            !session?.user?.user_metadata?.userColor;

          if (isNewUser) {
            const userName = createUsernameFromEmail(
              session?.user?.email as string
            );
            const userColor = generateUserColor();
            supabase.auth.updateUser({
              data: { userName, userColor },
            });

            const sessionWithUsername = {
              ...session?.user,
              user_metadata: {
                userName,
                userColor,
              },
            };

            setSession(sessionWithUsername);
            setIsAuthenticating(false);
          }

          // Returning user
          setSession(session);
          setIsAuthenticating(false);
        } else {
          window.location.href = "/login";
        }
      })
      .catch((error) => {
        throw new Error("Error occurred while fetching user session: " + error);
      });
  }, []);

  if (isAuthenticating) {
    return (
      <div className='min-h-screen flex justify-center items-center'>
        <p>Validating session. please waiting...</p>
      </div>
    );
  }

  // console.log(session); // currently logged in user object

  return (
    <main>
      <Audio />
      <ThreeDots />
      <Navbar session={session} />
      <DashboardBody session={session} />
    </main>
  );
}
