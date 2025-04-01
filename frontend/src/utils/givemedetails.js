import React from 'react'
import { SupabaseClient } from '@supabase/supabase-js'
const givemedetails = (bookingId) => {
    const supabase = SupabaseClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_API_KEY
    );
    const { data, error } = supabase
        .from('bookings')
        .select('*')
        .eq('id', bookingId)
        .single()
    if (error) {
        console.error("Error fetching booking data:", error);
        return null;
    }
    return data;
    
}

export default givemedetails