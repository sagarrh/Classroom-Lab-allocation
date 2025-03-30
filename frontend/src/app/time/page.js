"use client";
// import SlotsList from "../components/SlotsList";
import TimeSlots from "../components/TimeSlots";
import { useSearchParams } from "next/navigation";

export default function TimePage() {
  const searchParams = useSearchParams();
  const roomId = searchParams.get("roomId");
  // console.log("Room ID from URL:", roomId);
  const selectedDate = "2025-03-31";
  return (
    // <div className="p-6">
    //   <h1 className="text-2xl font-bold">Select a Time Slot</h1>
    //   <p>Room ID: {roomId}</p>
    //   <SlotsList classroom={roomId}></SlotsList>
    // </div>
    <main className="container mx-auto p-6">
    <h1 className="text-2xl font-bold mb-4">Book Time Slot</h1>
    <TimeSlots roomId={roomId} selectedDate={selectedDate} />
  </main>
  );
}
