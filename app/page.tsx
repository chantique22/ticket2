import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  } else if (session.user.role === "ADMIN") {
    redirect("/admin");
  } else {
    // For now, redirect users to new ticket page as their "home"
    redirect("/ticket/new");
  }

  // return (
  //   <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
  //       <h1 className="text-4xl font-bold">Welcome, {session.user.name}</h1>
  //       <p className="text-muted-foreground">What can we help you with today?</p>
  //   </div>
  // );
}
