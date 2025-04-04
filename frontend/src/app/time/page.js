"use client";
import { useSearchParams } from "next/navigation";
import TimeSlots from "../components/TimeSlots";
import { Suspense } from "react";
import { Spinner } from "@/components/ui/spinner"; 

function TimePageContent() {
  const searchParams = useSearchParams();
  const roomId = searchParams.get("roomId");
  const selectedDate = "2025-03-31";

  return (
    <main className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Book Time Slot</h1>
      {roomId ? (
        <TimeSlots roomId={roomId} selectedDate={selectedDate} />
      ) : (
        <p className="text-red-500">Invalid or missing Room ID.</p>
      )}
    </main>
  );
}

export default function TimePage() {
  return (
    <Suspense fallback={<Spinner size="large" show />}>
      <TimePageContent />
    </Suspense>
  );
}
