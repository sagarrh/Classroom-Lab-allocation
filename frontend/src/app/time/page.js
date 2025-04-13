"use client";
import { useSearchParams } from "next/navigation";
import TimeSlots from "../components/TimeSlots";
import { Suspense } from "react";
import { Spinner  } from "@/components/ui/spinner";

function TimePageContent() {
  const   searchParams = useSearchParams();
  const roomId = searchParams.get("roomId");
  const dateParam = searchParams.get("date");

  // Function to validate and format the date from URL
  const getValidDate = (dateString) => {
    if (!dateString) return null;
    
    try {
      // Parse the date string (YYYY-MM-DD format)
      const [year, month, day] = dateString.split('-').map(Number);
      
      // Validate the date components
      if (isNaN(year) || isNaN(month) || isNaN(day) || 
          month < 1 || month > 12 || day < 1 || day > 31) {
        console.error("Invalid date components:", dateString);
        return null;
      }
      
      // Create date object (local timezone)
      const date = new Date(year, month - 1, day);
      
      // Verify the date is valid
      if (isNaN(date.getTime())) {
        console.error("Invalid date:", dateString);
        return null;
      }
      
      // Format as "25th April, 2025"
      const dayWithSuffix = day + (day % 10 === 1 && day !== 11 ? 'st' : 
                                 day % 10 === 2 && day !== 12 ? 'nd' : 
                                 day % 10 === 3 && day !== 13 ? 'rd' : 'th');
      const monthNames = ["January", "February", "March", "April", "May", "June",
                         "July", "August", "September", "October", "November", "December"];
      
      return `${dayWithSuffix} ${monthNames[month - 1]}, ${year}`;
    } catch (error) {
      console.error("Error parsing date:", error);
      return null;
    }
  };

  const formattedDate = getValidDate(dateParam);

  return (
    <main className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Book Time Slot</h1>
      {!roomId ? (
        <p className="text-red-500">Invalid or missing Room ID.</p>
      ) : !formattedDate ? (
        <p className="text-red-500">Invalid or missing date parameter (must be YYYY-MM-DD).</p>
      ) : (
        <TimeSlots roomId={roomId} selectedDate={dateParam} formattedDate={formattedDate} />
      )}
    </main>
  );
}

export default function TimePage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center h-screen">
        <Spinner size="large" show />
      </div>
    }>
      <TimePageContent />
    </Suspense>
  );
}