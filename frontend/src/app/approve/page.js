"use client";
import { createClient } from "@supabase/supabase-js";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation"; 

function ApproveBookingComponent() {
  const [message, setMessage] = useState("");
  const searchParams = useSearchParams();
  
  const bookingId = searchParams.get("booking_id");
  const action = searchParams.get("action");

  useEffect(() => {
    if (!bookingId || !action) {
      setMessage("Invalid request.");
      return;
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_API_KEY
    );

    async function updateBookingStatus() {
      try {
        const { error } = await supabase
          .from("bookings")
          .update({
            status: action,
            approved_by: "Vinaya Maam"
          })
          .eq("id", bookingId);

        if (error) {
          setMessage("Error updating booking: " + error.message);
        } else {
          setMessage(`Booking ${action === "approve" ? "approved" : "rejected"} successfully!`);
        }
      } catch (err) {
        setMessage("Network error: " + err.message);
      }
    }

    updateBookingStatus();
  }, [bookingId, action]);

  return <h1>{message}</h1>;
}

export default function ApproveBooking() {
  return (
    <Suspense fallback={<h1>Loading...</h1>}>
      <ApproveBookingComponent />
    </Suspense>
  );
}
