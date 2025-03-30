"use client"
import { SupabaseClient } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation"; // If using React Router

function ApproveBooking() {
    const supabase = new SupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_API_KEY
    );
  const [message, setMessage] = useState("");
  const searchParams = useSearchParams();
  
  const bookingId = searchParams.get("booking_id");
  const action = searchParams.get("action"); // "approve" or "reject"

  useEffect(() => {
    async function updateBookingStatus() {
      if (!bookingId || !action) {
        setMessage("Invalid request.");
        return;
      }

      const { error } = await supabase
        .from("bookings")
        .update({ status: action, approved_by: "hod@example.com" })
        .eq("id", bookingId);

      if (error) {
        setMessage("Error updating booking: " + error.message);
      } else {
        setMessage(`Booking ${action === "approve" ? "approved" : "rejected"} successfully!`);
      }
    }

    updateBookingStatus();
  }, [bookingId, action]);

  return <h1>{message}</h1>;
}

export default ApproveBooking;
