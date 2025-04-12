import nodemailer from 'nodemailer';
import givemedetails from '@/utils/givemedetails';

export async function POST(req) {
  // const data = supabase(
  //   process.env.NEXT_PUBLIC_SUPABASE_URL,
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
    console.log("One");
    if (!email || !booking_id || !details) {
      console.error("Missing parameters:", { email, booking_id, details });
      return new Response(JSON.stringify({ error: "Missing parameters" }), { status: 400 });
    }
    // Create a transporter using SMTP
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // Your Gmail address
        pass: process.env.EMAIL_PASSWORD // Your Gmail app password
      }
    }); 
    console.log("Two");
    const approveLink = `http://localhost:3000/approve?booking_id=${booking_id.toString()}&action=approved`;
    const rejectLink = `https://localhost:3000/approve?booking_id=${booking_id.toString()}&action=reject`;

    console.log("Three");
    // const data = SupabaseClient( 
    //   process.env.NEXT_PUBLIC_SUPABASE_URL,
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
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
          <div style="background: #3f51b5; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">Classroom Booking Request</h1>
          </div>
          
          <div style="padding: 20px;">
            <p style="font-size: 16px; color: #555;">A new booking request requires your approval:</p>
            
            <div style="background: #f9f9f9; border-radius: 6px; padding: 15px; margin: 15px 0;">
              <h3 style="margin-top: 0; color: #3f51b5;">Booking Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee; width: 30%; color: #666;">Booking ID:</td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: 500;">${booking_id}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #666;">Room:</td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: 500;">${details.room_no.replace(/(lab|laboratory)-(\d+)/i, 'Lab $2')}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #666;">Date:</td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: 500;">${formatDate(details.date)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #666;">Time Slot:</td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: 500;">${details.time_slot}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #666;">Requested By:</td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: 500;">${details.booked_by}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;">Purpose:</td>
                  <td style="padding: 8px 0; font-weight: 500;">${details.reason}</td>
                </tr>
              </table>
            </div>
    
            <div style="background: #fff8e1; border-left: 4px solid #ffc107; padding: 12px; margin: 15px 0; border-radius: 0 4px 4px 0;">
              <p style="margin: 0; color: #ff6f00; font-weight: 500;">Current Status: ${details.status}</p>
            </div>
    
            <p style="text-align: center; margin: 25px 0 15px; color: #666;">Please take action on this request:</p>
            
            <div style="text-align: center; margin: 20px 0;">
              <a href="${approveLink}" style="display: inline-block; background: #4caf50; color: white; padding: 12px 25px; margin: 0 10px; text-decoration: none; border-radius: 4px; font-weight: bold;">Approve</a>
              <a href="${rejectLink}" style="display: inline-block; background: #f44336; color: white; padding: 12px 25px; margin: 0 10px; text-decoration: none; border-radius: 4px; font-weight: bold;">Reject</a>
            </div>
    
            <p style="font-size: 12px; color: #999; text-align: center; margin-top: 30px;">
              This is an automated message. Please do not reply to this email.
            </p>
          </div>
        </div>
      `
    };
    console.log("Four");
    // Add this helper function to format the date as "20th April, 2025"
    function formatDate(dateString) {
      const date = new Date(dateString);
      if (isNaN(date)) return dateString; // fallback if invalid date
      
      const day = date.getDate();
      const month = date.toLocaleString('default', { month: 'long' });
      const year = date.getFullYear();
      
      // Add ordinal suffix to day
      const suffixes = ['th', 'st', 'nd', 'rd'];
      const relevantDigits = (day < 30) ? day % 20 : day % 30;
      const suffix = (relevantDigits <= 3) ? suffixes[relevantDigits] : suffixes[0];
      
      return `${day}${suffix} ${month}, ${year}`;
    }
    console.log("Five");
    // Send the email

    
    console.log("Sending email to:", email);
    console.log("Email options:", mailOptions);
    //using college wifi or any other public network for sending mail wont work so keep that in mind next time KJ somaiya wifi doesnt work hehe...
    const info = await transporter.sendMail(mailOptions);
    // console.log("Email sent:", info.response);
    console.log("Seven");
    
    return new Response(JSON.stringify({ 
      message: "Email sent successfully!", 
      messageId: info.messageId 
    }), { status: 200 });
  } catch (err) {
    console.error("❌ Error:", err);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}
