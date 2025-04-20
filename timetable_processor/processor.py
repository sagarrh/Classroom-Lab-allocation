"""
Module for processing Excel timetable files and extracting structured data.
"""
import pandas as pd
import re
from datetime import datetime, timedelta
from typing import List, Dict, Any, Tuple, Generator


class TimetableProcessor:
    """
    Class for processing Excel timetable files and extracting structured data.
    """

    def __init__(self, debug: bool = False):
        """
        Initialize the TimetableProcessor.
        
        Args:
            debug: Enable debug mode for additional logging
        """
        self.debug = debug
        self.days_of_week = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
        
    def read_excel(self, file_path: str) -> pd.DataFrame:
        """
        Read Excel file and return the DataFrame.
        
        Args:
            file_path: Path to the Excel file
            
        Returns:
            DataFrame containing the Excel data
        """
        try:
            df = pd.read_excel(file_path)
            if self.debug:
                print(f"Successfully read Excel file: {file_path}")
            return df
        except Exception as e:
            raise Exception(f"Failed to read Excel file: {e}")
    
    def preprocess_dataframe(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Preprocess the DataFrame to handle inconsistencies.
        
        Args:
            df: Raw DataFrame from Excel
            
        Returns:
            Preprocessed DataFrame ready for data extraction
        """
        # Check if the DataFrame has the expected columns
        if set(self.days_of_week).issubset(df.columns):
            # DataFrame already has the right format
            return df
        
        # Try to identify the correct column names
        day_columns = []
        for col in df.columns:
            for day in self.days_of_week:
                if isinstance(col, str) and day.lower() in col.lower():
                    day_columns.append(col)
                    break
        
        if not day_columns:
            # If day columns are not found in headers, try to find them in the first few rows
            for i in range(min(5, len(df))):
                row = df.iloc[i]
                for j, value in enumerate(row):
                    if isinstance(value, str):
                        for day in self.days_of_week:
                            if day.lower() in value.lower():
                                # Found a day in the row, use this row as header
                                new_header = df.iloc[i]
                                df = df[i+1:].copy()
                                df.columns = new_header
                                return self.preprocess_dataframe(df)
        
        # If we still can't find day columns, raise an error
        if not day_columns:
            raise ValueError("Could not identify day columns in the Excel file")
        
        return df
    
    def extract_time_range(self, time_str: str) -> Tuple[str, str]:
        """
        Extract start and end times from a time range string.
        
        Args:
            time_str: Time range string (e.g., "9:00 - 10:30")
            
        Returns:
            Tuple of (start_time, end_time)
        """
        # Match patterns like "9:00 - 10:30" or "9:00-10:30" or "9 - 10:30"
        pattern = r'(\d{1,2}(?::\d{2})?\s*(?:AM|PM)?)\s*-\s*(\d{1,2}(?::\d{2})?\s*(?:AM|PM)?)'
        match = re.search(pattern, time_str, re.IGNORECASE)
        
        if not match:
            raise ValueError(f"Could not parse time range: {time_str}")
        
        start_time, end_time = match.groups()
        
        # Normalize times (ensure they have HH:MM format)
        start_time = self._normalize_time(start_time)
        end_time = self._normalize_time(end_time)
        
        return start_time, end_time
    
    def _normalize_time(self, time_str: str) -> str:
        """
        Normalize time string to HH:MM format.
        
        Args:
            time_str: Time string to normalize
            
        Returns:
            Normalized time string in HH:MM format
        """
        time_str = time_str.strip()
        
        # Handle case where there's no colon (e.g., "9 AM")
        if ':' not in time_str:
            # Check if it has AM/PM
            if 'AM' in time_str.upper() or 'PM' in time_str.upper():
                # Extract number and AM/PM
                num = re.search(r'(\d+)', time_str).group(1)
                period = re.search(r'(AM|PM)', time_str.upper()).group(1)
                time_str = f"{num}:00 {period}"
            else:
                # Just a number, assume it's an hour
                time_str = f"{time_str}:00"
        
        # Parse the time string
        if ' ' in time_str and ('AM' in time_str.upper() or 'PM' in time_str.upper()):
            try:
                dt = datetime.strptime(time_str, '%I:%M %p')
                return dt.strftime('%H:%M')
            except ValueError:
                try:
                    dt = datetime.strptime(time_str, '%I %p')
                    return dt.strftime('%H:%M')
                except ValueError:
                    pass
        
        # If the parsing above failed or wasn't applicable, just return the cleaned time
        # Remove any AM/PM and just keep the time
        time_str = re.sub(r'(?i)\s*(?:AM|PM)', '', time_str)
        
        # Ensure HH:MM format
        if ':' not in time_str:
            time_str = f"{time_str}:00"
        
        return time_str
    
    def generate_30min_slots(self, start_time: str, end_time: str) -> List[Tuple[str, str]]:
        """
        Generate 30-minute time slots between start and end times.
        
        Args:
            start_time: Start time in HH:MM format
            end_time: End time in HH:MM format
            
        Returns:
            List of (slot_start, slot_end) tuples for each 30-minute slot
        """
        # Parse times
        start_dt = datetime.strptime(start_time, '%H:%M')
        end_dt = datetime.strptime(end_time, '%H:%M')
        
        # Handle case where end time is earlier than start time (next day)
        if end_dt < start_dt:
            end_dt += timedelta(days=1)
        
        slots = []
        current = start_dt
        
        # Generate slots until we reach the end time
        while current < end_dt:
            slot_start = current
            slot_end = current + timedelta(minutes=30)
            
            # If the slot would extend beyond the end time, cap it
            if slot_end > end_dt:
                slot_end = end_dt
            
            slots.append((
                slot_start.strftime('%H:%M'),
                slot_end.strftime('%H:%M')
            ))
            
            current = slot_end
        
        return slots
    
    def extract_booking_details(self, cell_value: str) -> Dict[str, str]:
        """
        Extract booking details from cell value.
        
        Expected format: "Subject (Faculty)(Room)" or variations
        Example: "DP (NA)(65)" -> reason="DP", booked_by="NA", room_no="65"
        
        Args:
            cell_value: Cell value containing booking details
            
        Returns:
            Dictionary with extracted details
        """
        if not cell_value or pd.isna(cell_value) or cell_value.strip() == '':
            return {
                'reason': '',
                'booked_by': '',
                'room_no': '',
                'status': 'available'
            }
        
        # Default values
        details = {
            'reason': '',
            'booked_by': '',
            'room_no': '',
            'status': 'booked'
        }
        
        # Extract information using regex
        # Pattern: "Subject (Faculty)(Room)" or variations
        pattern = r'^(.*?)\s*(?:\(([^)]*)\))?(?:\(([^)]*)\))?'
        match = re.match(pattern, str(cell_value))
        
        if match:
            groups = match.groups()
            details['reason'] = groups[0].strip() if groups[0] else ''
            
            # If we have at least one parenthesis group
            if len(groups) > 1 and groups[1]:
                details['booked_by'] = groups[1].strip()
            
            # If we have two parenthesis groups
            if len(groups) > 2 and groups[2]:
                details['room_no'] = groups[2].strip()
        else:
            # If the regex pattern doesn't match, use the whole cell as reason
            details['reason'] = str(cell_value).strip()
        
        return details
    
    # Add this to the TimetableProcessor class in processor.py

    def process_timetable(self, file_path: str, default_date: str = None) -> List[Dict[str, Any]]:
        """
        Process the timetable Excel file and extract all booking details.
        
        Args:
            file_path: Path to the Excel file
            default_date: Default date in YYYY-MM-DD format if no date is found
            
        Returns:
            List of dictionaries containing booking details
        """
        df = self.read_excel(file_path)
        df = self.preprocess_dataframe(df)
        
        # Find the column containing time slots
        time_col = None
        for col in df.columns:
            if isinstance(col, str) and any(t in col.lower() for t in ['time', 'period', 'hour']):
                time_col = col
                break
        
        if not time_col:
            # Try to identify the time column by looking for time patterns in the first column
            first_col = df.columns[0]
            time_pattern = r'\d{1,2}(?::\d{2})?\s*-\s*\d{1,2}(?::\d{2})?'
            
            # Check if at least some values in the first column match the time pattern
            if df[first_col].astype(str).str.match(time_pattern).any():
                time_col = first_col
        
        if not time_col:
            raise ValueError("Could not identify time column in Excel file")
        
        # Identify day columns
        day_cols = []
        for day in self.days_of_week:
            matching_cols = [col for col in df.columns if isinstance(col, str) and day.lower() in col.lower()]
            if matching_cols:
                day_cols.append(matching_cols[0])
        
        if not day_cols:
            raise ValueError("Could not identify day columns in Excel file")
        
        # Try to find a date column or header
        date_from_excel = None
        date_pattern = r'\d{1,2}[/-]\d{1,2}[/-]\d{2,4}'
        
        # Look in headers
        for col in df.columns:
            if isinstance(col, str) and re.search(date_pattern, col):
                date_match = re.search(date_pattern, col)
                if date_match:
                    try:
                        date_from_excel = self._parse_date(date_match.group(0))
                        if self.debug:
                            print(f"Found date in header: {date_from_excel}")
                        break
                    except:
                        pass
        
        # Look in the first few rows for a date
        if not date_from_excel:
            for i in range(min(5, len(df))):
                for col in df.columns:
                    cell_value = str(df.iloc[i][col])
                    if re.search(date_pattern, cell_value):
                        date_match = re.search(date_pattern, cell_value)
                        if date_match:
                            try:
                                date_from_excel = self._parse_date(date_match.group(0))
                                if self.debug:
                                    print(f"Found date in cell: {date_from_excel}")
                                break
                            except:
                                pass
                if date_from_excel:
                    break
        
        # Use default date or today's date if no date is found
        if not date_from_excel:
            if default_date:
                date_from_excel = default_date
            else:
                # Use current date as fallback
                date_from_excel = datetime.now().strftime('%Y-%m-%d')
                if self.debug:
                    print(f"Using current date: {date_from_excel}")
        
        # Process each row
        result = []
        for _, row in df.iterrows():
            time_value = row[time_col]
            
            # Skip rows without time information
            if pd.isna(time_value) or not isinstance(time_value, (str, int, float)):
                continue
            
            # Convert time value to string
            time_str = str(time_value).strip()
            
            # Skip header rows or rows with non-time values
            if not re.search(r'\d{1,2}(?::\d{2})?\s*-\s*\d{1,2}(?::\d{2})?', time_str):
                continue
            
            try:
                # Extract time range
                start_time, end_time = self.extract_time_range(time_str)
                
                # Generate 30-minute slots
                time_slots = self.generate_30min_slots(start_time, end_time)
                
                # Process each day column
                for day_col in day_cols:
                    day_of_week = next((day for day in self.days_of_week if day.lower() in str(day_col).lower()), str(day_col))
                    cell_value = row[day_col]
                    
                    # Skip empty cells
                    if pd.isna(cell_value) or str(cell_value).strip() == '':
                        continue
                    
                    # Extract booking details
                    booking_details = self.extract_booking_details(cell_value)
                    
                    # Create entry for each time slot
                    for slot_start, slot_end in time_slots:
                        entry = {
                            'room_no': booking_details['room_no'],
                            'day_of_week': day_of_week,
                            'date': date_from_excel,  # Add date to each entry
                            'time_slot': f"{slot_start} - {slot_end}",
                            'start_time': slot_start,
                            'end_time': slot_end,
                            'booked_by': booking_details['booked_by'],
                            'reason': booking_details['reason'],
                            'status': booking_details['status'],
                            'approved_by': '',  # Could be added in future versions
                            'is_recurring': True,  # Assuming weekly recurrence
                            'class': ''  # Could be added in future versions
                        }
                        result.append(entry)
            except Exception as e:
                if self.debug:
                    print(f"Error processing row with time {time_str}: {str(e)}")
                continue
        
        return result

    def _parse_date(self, date_str: str) -> str:
        """
        Parse a date string into YYYY-MM-DD format.
        
        Args:
            date_str: Date string in various formats (MM/DD/YYYY, DD-MM-YYYY, etc.)
            
        Returns:
            Date in YYYY-MM-DD format
        """
        # Try common date formats
        formats = [
            '%m/%d/%Y', '%d/%m/%Y', '%Y/%m/%d',
            '%m-%d-%Y', '%d-%m-%Y', '%Y-%m-%d',
            '%m/%d/%y', '%d/%m/%y', '%y/%m/%d',
            '%m-%d-%y', '%d-%m-%y', '%y-%m-%d'
        ]
        
        for fmt in formats:
            try:
                date_obj = datetime.strptime(date_str, fmt)
                return date_obj.strftime('%Y-%m-%d')
            except ValueError:
                continue
        
        # If all formats fail, raise an exception
        raise ValueError(f"Could not parse date: {date_str}")


if __name__ == "__main__":
    # Example usage
    processor = TimetableProcessor(debug=True)
    results = processor.process_timetable("examples/sample.xlsx")
    print(f"Extracted {len(results)} time slot entries")