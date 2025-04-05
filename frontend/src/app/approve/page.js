"use client";
import { createClient } from "@supabase/supabase-js";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation"; 
import { Spinner } from "@/components/ui/spinner";
import { CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

function ApproveBookingComponent() {
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const bookingId = searchParams.get("booking_id");
  const action = searchParams.get("action");

  useEffect(() => {
    if (!bookingId || !action) {
      setMessage("Invalid request parameters.");
      setIsLoading(false);
      setIsSuccess(false);
      return;
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_API_KEY
    );

    async function updateBookingStatus() {
      try {
        setIsLoading(true);
        const { error } = await supabase
          .from("bookings")
          .update({
            status: action,
            approved_by: "Vinaya Maam"
            // Removed approved_at since it doesn't exist in your schema
          })
          .eq("id", bookingId);

        if (error) {
          throw error;
        }

        setIsSuccess(true);
        setMessage(`Booking ${action === "approved" ? "approved" : "rejected"} successfully!`);
      } catch (err) {
        setIsSuccess(false);
        setMessage("Error processing request: " + err.message);
      } finally {
        setIsLoading(false);
      }
    }

    updateBookingStatus();
  }, [bookingId, action]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Spinner size="large" show />
        <p className="text-lg text-gray-600">Processing your request...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 text-center bg-white rounded-lg shadow-md">
        {isSuccess ? (
          <div className="animate-in fade-in zoom-in">
            <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full">
              <CheckCircle2 className="w-12 h-12 text-green-600" strokeWidth={1.5} />
            </div>
            <h1 className="text-2xl font-bold text-green-600">Success!</h1>
            <p className="mt-2 text-gray-600">{message}</p>
            <p className="mt-2 text-sm text-gray-500">
              Booking ID: {bookingId}
            </p>
          </div>
        ) : (
          <div className="animate-in fade-in zoom-in">
            <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full">
              <XCircle className="w-12 h-12 text-red-600" strokeWidth={1.5} />
            </div>
            <h1 className="text-2xl font-bold text-red-600">Error Occurred</h1>
            <p className="mt-2 text-gray-600">{message}</p>
          </div>
        )}

        <div className="pt-6">
          <Button
            onClick={() => router.push("/")}
            variant={isSuccess ? "default" : "destructive"}
            className="w-full"
          >
            {isSuccess ? "Back to Dashboard" : "Try Again"}
          </Button>
        </div>

        {isSuccess && (
          <p className="mt-4 text-sm text-gray-500">
            An email confirmation has been sent to the requester.
          </p>
        )}
      </div>
    </div>
  );
}

export default function ApproveBooking() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
          <Spinner size="large" show />
          <p className="text-lg text-gray-600">Loading approval page...</p>
        </div>
      }
    >
      <ApproveBookingComponent />
    </Suspense>
  );
}