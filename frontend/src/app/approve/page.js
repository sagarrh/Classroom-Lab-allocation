"use client"
import { SupabaseClient } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation"; // If using React Router

// Initialize Supabase client outside of the component
const supabase = new SupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_API_KEY
);

function ApproveBooking() {
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

      try {
        const { error } = await supabase
          .from("bookings")
          .update({
            status: action,
            approved_by:"Vinaya Maam"  // Ideally, replace this with dynamic user info
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

export default ApproveBooking;
