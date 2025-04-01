import { supabaseURL, supabasekey } from "@/utils/supabaseClient";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const booking_id = searchParams.get("booking_id");
    const action = searchParams.get("action");

    if (!booking_id || !action) {
      return new Response(JSON.stringify({ error: "Missing parameters" }), { status: 400 });
    }

    const newStatus = action === "approve" ? "approved" : "rejected";
    const supabase = createClient(supabaseURL, supabasekey);
    const { error } = await supabase
      .from("bookings")
      .update({ status: newStatus })
      .eq("id", booking_id);

    if (error) throw error;

    return new Response(JSON.stringify({ message: `Booking ${newStatus}` }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to update booking" }), { status: 500 });
  }
}
