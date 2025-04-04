"use client";

import { useEffect, useState } from "react";
import { SupabaseClient } from "@supabase/supabase-js";
import credentials from "../time/credentials";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog";

export default function TimeSlots({ roomId, selectedDate }) {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const supabase = new SupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_API_KEY
    );

    const generateTimeSlots = () => {
        const slots = [];
        for (let hour = 7; hour < 18; hour++) {
            slots.push(`${hour}:00 - ${hour + 1}:00`);
        }
        return slots;
    };

    useEffect(() => {
        fetchBookings();
    }, [roomId, selectedDate]);

    async function fetchBookings() {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from("bookings")
                .select("time_slot, status")
                .eq("room_no", roomId)
                .eq("date", selectedDate);

            if (error) throw error;
            setBookings(data || []);
        } catch (error) {
            console.error("Error fetching bookings:", error);
        } finally {
            setLoading(false);
        }
    }

    const isBooked = (slot) => {
        const booking = bookings.find((b) => b.time_slot === slot);
        return booking ? booking.status : "vacant";
    };

    const handleBooking = async (slot) => {
        try {
            const status = isBooked(slot);
            if (status !== "vacant") {
                alert("This slot is already booked or pending approval");
                return;
            }

            const username = prompt("Please enter your username:");
            if (!username) return;
            
            const password = prompt("Please enter your password:");
            if (!password) return;
            
            const validUser = credentials.find(cred => cred.username === username && cred.password === password);
            if (!validUser) {
                alert("Invalid username or password");
                return;
            }

            const reason = prompt("Please provide a reason for booking:");
            if (!reason) return;

            const confirmation = window.confirm(`Do you want to book this slot: ${slot}?`);
            if (!confirmation) return;

            setLoading(true);
            const { data, error } = await supabase.from("bookings").insert([
                {
                    room_no: roomId,
                    date: selectedDate,
                    time_slot: slot,
                    status: "pending",
                    booked_by: username,
                    reason: reason
                    // approved_by: "Vinaya Maam"
                }
            ]).select();

            if (error) throw error;
            const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
            if (!adminEmail) {
                throw new Error("Admin email not set in environment variables.");
            }
            const bookingId = data?.[0]?.id;
            const booked_by = data?.[0]?.booked_by;
            const reason1 = data?.[0]?.reason;
            const room_no = data?.[0]?.room_no;
            const date = data?.[0]?.date;
            const time_slot = data?.[0]?.time_slot;
            const statusa = data?.[0]?.status;
            const details = {
                room_no: room_no,
                date: date,
                time_slot: time_slot,
                booked_by: booked_by,
                reason: reason1,
                statusa: statusa,
            };
            console.log(data);
            if (bookingId) {
                // await requestApproval(bookingId,adminEmail, slot, username, reason, roomId, selectedDate);
                await requestApproval(bookingId,adminEmail, details);
            }

            alert("Booking request submitted successfully!");
            await fetchBookings();
        } catch (error) {
            alert("Error booking slot: " + error.message);
        } finally {
            setLoading(false);
        }
    };
    async function requestApproval(bookingId, adminEmail, details) {
        const res = await fetch("/api/sendMail", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: adminEmail,
                booking_id: bookingId,
                details: details,
            }),
        });
        
        if (!res.ok) {
            const text = await res.text();
            console.error('Error sending approval request:', text);
            throw new Error(text || 'Failed to send approval request');
        }

        try {
            const data = await res.json();
            return data;
        } catch (error) {
            console.error('Invalid JSON response:', error);
            return null;
        }
    }

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold">Time Slots for {selectedDate}</h2>
            {loading ? (
                <p>Loading...</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {generateTimeSlots().map((slot) => {
                        const status = isBooked(slot);
                        return (
                            <div
                                key={slot}
                                onClick={() => handleBooking(slot)}
                                className={`p-4 border rounded-lg cursor-pointer hover:opacity-80 ${
                                    status === "approve"
                                        ? "bg-green-300"
                                        : status === "pending"
                                        ? "bg-yellow-300"
                                        : status === "occupied"
                                        ? "bg-red-300"
                                        : "bg-gray-200"
                                } flex flex-col justify-center items-center text-center`}
                            >
                                <p className="font-semibold">{slot}</p>
                                <p>
                                    Status:{" "}
                                    <span
                                        className={`font-bold ${
                                            status === "approved"
                                                ? "text-green-700"
                                                : status === "pending"
                                                ? "text-yellow-700"
                                                : status === "occupied"
                                                ? "text-red-700"
                                                : "text-gray-700"
                                        }`}
                                    >
                                        {status === "vacant" ? "Vacant" : status}
                                    </span>
                                </p>
                            </div>
                        );
                    })}
                </div>
                
            )}
            
        </div>
    );
    
}
