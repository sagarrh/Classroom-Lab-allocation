import nodemailer from 'nodemailer';

export async function POST(req) {
  try {
    const { email, booking_id } = await req.json();

    if (!email || !booking_id) {
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

    const approveLink = `https://localhost:3000/approve?booking_id=${booking_id}&action=approve`;
    const rejectLink = `https://localhost:3000/approve?booking_id=${booking_id}&action=reject`;

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Classroom Booking Approval Request",
      html: `
        <h2>New Booking Request</h2>
        <p>Please approve or reject the booking request:</p>
        <a href="${approveLink}" style="background:green;color:white;padding:10px;text-decoration:none;">Approve</a>
        &nbsp;
        <a href="${rejectLink}" style="background:red;color:white;padding:10px;text-decoration:none;">Reject</a>
      `
    };

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
