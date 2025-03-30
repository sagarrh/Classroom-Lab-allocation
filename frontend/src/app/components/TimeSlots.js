"use client";

import { useEffect, useState } from "react";
import { SupabaseClient } from "@supabase/supabase-js";
import credentials from "../time/credentials";

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
                    reason: reason,
                }
            ]).select();

            if (error) throw error;
            const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
            if (!adminEmail) {
                throw new Error("Admin email not set in environment variables.");
            }
            const bookingId = data?.[0]?.id;
            if (bookingId) {
                await requestApproval(bookingId,adminEmail );
            }

            alert("Booking request submitted successfully!");
            await fetchBookings();
        } catch (error) {
            alert("Error booking slot: " + error.message);
        } finally {
            setLoading(false);
        }
    };
    async function requestApproval(bookingId, adminEmail) {
        const res = await fetch("/api/sendMail", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: adminEmail,
                booking_id: bookingId,
            }),
        });
        
        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.error);
        }
    }

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold">Time Slots for {selectedDate}</h2>
            {loading ? (
                <p>Loading...</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {generateTimeSlots().map((slot) => {
                        const status = isBooked(slot);
                        return (
                            <div
                                key={slot}
                                onClick={() => handleBooking(slot)}
                                className={`p-3 border rounded-lg cursor-pointer hover:opacity-80 ${
                                    status === "approved"
                                        ? "bg-green-300"
                                        : status === "pending"
                                        ? "bg-yellow-300"
                                        : "bg-gray-200"
                                }`}
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
