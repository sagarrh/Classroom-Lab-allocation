"use client";
import { useEffect, useState } from "react";
import { SupabaseClient } from "@supabase/supabase-js";
import credentials from "../time/credentials";
import { Spinner } from "@/components/ui/spinner";

export default function TimeSlots({ roomId, selectedDate, formattedDate }) {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const supabase = new SupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_API_KEY
    );

    useEffect(() => {
        fetchBookings();
    }, [roomId, selectedDate]);

    const generateTimeSlots = () => {
        const slots = [];
        for (let hour = 7; hour < 18; hour++) {
            slots.push(`${hour}:00 - ${hour + 1}:00`);
        }
        return slots;
    };

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
                }
            ]).select();

            if (error) throw error;
            
            const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
            if (!adminEmail) {
                throw new Error("Admin email not set in environment variables.");
            }

            const bookingId = data?.[0]?.id;
            if (bookingId) {
                await requestApproval(bookingId, adminEmail, {
                    room_no: roomId,
                    date: selectedDate,
                    time_slot: slot,
                    booked_by: username,
                    reason: reason,
                    status: "pending"
                });
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
        try {
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
                throw new Error(text || 'Failed to send approval request');
            }
            return await res.json();
        } catch (error) {
            console.error('Error sending approval request:', error);
            throw error;
        }
    }

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Time Slots for {formattedDate}</h2>
            {loading ? (
                <div className="flex justify-center items-center mt-4">
                    <Spinner size="large" show />
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {generateTimeSlots().map((slot) => {
                        const status = isBooked(slot);
                        return (
                            <div
                                key={slot}
                                onClick={() => handleBooking(slot)}
                                className={`p-4 border rounded-lg cursor-pointer hover:opacity-80 transition-all ${
                                    status === "approved"
                                        ? "bg-green-200 border-green-400"
                                        : status === "pending"
                                        ? "bg-yellow-200 border-yellow-400"
                                        : status === "occupied"
                                        ? "bg-red-200 border-red-400"
                                        : "bg-gray-100 border-gray-300"
                                }`}
                            >
                                <p className="font-semibold text-center">{slot}</p>
                                <p className="text-center mt-2">
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
                                        {status === "vacant" ? "Available" : status}
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