import nodemailer from 'nodemailer';
import givemedetails from '@/utils/givemedetails';

export async function POST(req) {
  // const data = supabase(
  //   process.env.NEXT_PUBLIC_NEXT_PUBLIC_SUPABASE_URL,
  //   process.env.NEXT_PUBLIC_SUPABASE_API_KEY
  // );
  // const { data: bookingData, error } = await data
  //   .from("bookings")
  //   .select("*")
  //   .eq("id", booking_id)
  //   .single();
  // if (error) {
  //   console.error("Error fetching booking data:", error);
  //   return new Response(JSON.stringify({ error: "Failed to fetch booking data" }), { status: 500 });
  // }
  // console.log(bookingData);

  
  
  // const details = givemedetails(booking_id);
  try {
    const { email, booking_id ,details } = await req.json();
    if (!email || !booking_id || !details) {
      console.error("Missing parameters:", { email, booking_id, details });
      return new Response(JSON.stringify({ error: "Missing parameters" }), { status: 400 });
    }
    
    // console.log("Details:", details);
    // Create a transporter using SMTP
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // Your Gmail address
        pass: process.env.EMAIL_PASSWORD // Your Gmail app password
      }
    });

    const approveLink = `http://localhost:3000/approve?booking_id=${booking_id.toString()}&action=approve`;
    const rejectLink = `https://localhost:3000/approve?booking_id=${booking_id.toString()}&action=reject`;


    // const data = SupabaseClient( 
    //   process.env.NEXT_PUBLIC_NEXT_PUBLIC_SUPABASE_URL,
    //   process.env.NEXT_PUBLIC_SUPABASE_API_KEY
    // );
    // const { data: bookingData, error } = await data
    //   .from("bookings")
    //   .select("*")
    //   .eq("id", booking_id)
    //   .single();
    // if (error) {
    //   console.error("Error fetching booking data:", error);
    //   return new Response(JSON.stringify({ error: "Failed to fetch booking data" }), { status: 500 });
    // }
    // console.log(bookingData)
    // Email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Classroom Booking Approval Request",
      html: `
        <h2>New Booking Request</h2>
        <p>Please approve or reject the booking request:</p>
        <p>Booking ID: ${booking_id}</p>
        <p>Details:</p>
        <ul>
          <li>Room Name: ${details.room_no}</li>
          <li>Booking Date: ${details.date}</li>
          <li>Time: ${details.time_slot}</li>
          <li>Booked By: ${details.booked_by}</li>
          <li>Purpose: ${details.reason}</li>
        </ul>
        <p>Status: ${details.statusa}</p>
        <p>Click the buttons below to approve or reject the booking request:</p>
      
        <a href="${approveLink}" style="background:green;color:white;padding:10px;text-decoration:none;">Approve</a>
        &nbsp;
        <a href="${rejectLink}" style="background:red;color:white;padding:10px;text-decoration:none;">Reject</a>
      `
    };
    // const mailOptions = {
    //   from: process.env.EMAIL_USER,
    //   to: email,
    //   subject: "Classroom Booking Approval Request",
    //   html: `
    //     <h2>New Booking Request</h2>
    //     <p>Please approve or reject the booking request:</p>
    //     <p>Booking ID: ${booking_id}</p>
    //     <p>Details:</p>
    //     <ul>
    //       <li>Room Name: ${details.room_no}</li>
    //       <li>Booking Date: ${details.date}</li>
    //       <li>Start Time: ${details.time_slot}</li>
    //       <li>Booked By: ${details.booked_by}</li>
    //       <li>Purpose: ${details.reason}</li>
    //     </ul>
    //     <p>Click the buttons below to approve or reject the booking request:</p>
      
    //     <a href="${approveLink}" style="background:green;color:white;padding:10px;text-decoration:none;">Approve</a>
    //     &nbsp;
    //     <a href="${rejectLink}" style="background:red;color:white;padding:10px;text-decoration:none;">Reject</a>
    //   `
    // };

    // Send email
    const info = await transporter.sendMail(mailOptions);

    return new Response(JSON.stringify({ 
      message: "Email sent successfully!", 
      messageId: info.messageId 
    }), { status: 200 });

  } catch (err) {
    console.error("❌ Error:", err);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}
