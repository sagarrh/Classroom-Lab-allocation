"use client";
import { useEffect, useState } from "react";
import { SupabaseClient } from "@supabase/supabase-js";
import credentials from "../time/credentials";
import { Spinner } from "@/components/ui/spinner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function TimeSlots({ roomId, selectedDate, formattedDate }) {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [reason, setReason] = useState("");
    const [bookingStep, setBookingStep] = useState(1);
    const supabase = new SupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_API_KEY
    );

    useEffect(() => {
        fetchBookings();
    }, [roomId, selectedDate]);

    const resetBookingForm = () => {
        setUsername("");
        setPassword("");
        setReason("");
        setBookingStep(1);
    };

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

    const handleSlotClick = (slot) => {
        const status = isBooked(slot);
        if (status !== "vacant") {
            alert("This slot is already booked or pending approval");
            return;
        }
        setSelectedSlot(slot);
        setBookingDialogOpen(true);
    };

    const handleBooking = async () => {
        try {
            const validUser = credentials.find(cred => 
                cred.username === username && cred.password === password
            );
            
            if (!validUser) {
                alert("Invalid username or password");
                return;
            }

            setLoading(true);
            const { data, error } = await supabase.from("bookings").insert([
                {
                    room_no: roomId,
                    date: selectedDate,
                    time_slot: selectedSlot,
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
                    time_slot: selectedSlot,
                    booked_by: username,
                    reason: reason,
                    status: "pending"
                });
            }

            alert("Booking request submitted successfully!");
            setBookingDialogOpen(false);
            resetBookingForm();
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
                                onClick={() => handleSlotClick(slot)}
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

            <Dialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Book Time Slot: {selectedSlot}</DialogTitle>
                        <DialogDescription>
                            Please provide your credentials and reason for booking
                        </DialogDescription>
                    </DialogHeader>

                    {bookingStep === 1 && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Username</label>
                                <Input 
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Enter your username"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Password</label>
                                <Input 
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                />
                            </div>
                        </div>
                    )}

                    {bookingStep === 2 && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Reason for Booking</label>
                                <Input 
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="Enter your reason for booking"
                                />
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        {bookingStep === 1 ? (
                            <Button onClick={() => setBookingStep(2)} disabled={!username || !password}>
                                Continue
                            </Button>
                        ) : (
                            <>
                                <Button variant="outline" onClick={() => setBookingStep(1)}>
                                    Back
                                </Button>
                                <Button onClick={handleBooking} disabled={!reason}>
                                    Confirm Booking
                                </Button>
                            </>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}