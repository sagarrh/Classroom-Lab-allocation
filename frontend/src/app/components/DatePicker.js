"use client";
import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function DatePickerDemo({ onChange }) {  // Add onChange prop
  const [date, setDate] = React.useState();
  const today = new Date();

  const handleDateSelect = (selectedDate) => {
    setDate(selectedDate);
    onChange(selectedDate);  // Call the parent's callback
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal text-lg py-7",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-5 w-5" />
          {date ? format(date, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDateSelect}  // Use our handler
          initialFocus
          fromDate={today}
        />
      </PopoverContent>
    </Popover>
  );
}