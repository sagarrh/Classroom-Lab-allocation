"""
Module for uploading timetable data to a Supabase database.
"""
import os
import json
import requests
from typing import List, Dict, Any, Optional


class SupabaseUploader:
    """
    Class for uploading timetable data to a Supabase database.
    """

    def __init__(self, supabase_url: str, supabase_key: str, table_name: str = "timetable"):
        """
        Initialize the SupabaseUploader.
        
        Args:
            supabase_url: Supabase project URL
            supabase_key: Supabase API key
            table_name: Name of the table to insert data into
        """
        self.supabase_url = supabase_url.rstrip('/')
        self.supabase_key = supabase_key
        self.table_name = table_name
        
        # API endpoint for the table
        self.endpoint = f"{self.supabase_url}/rest/v1/{self.table_name}"
    
    # In the upload_data method of SupabaseUploader class:

    def upload_data(self, data: List[Dict[str, Any]], 
                batch_size: int = 50) -> Dict[str, Any]:
        """
        Upload timetable data to Supabase.
        
        Args:
            data: List of dictionaries containing timetable data
            batch_size: Number of rows per batch upload
            
        Returns:
            Dictionary with upload results
        """
        if not data:
            return {"success": False, "message": "No data to upload", "details": []}
        
        # Ensure all records have a date
        for entry in data:
            if 'date' not in entry or not entry['date']:
                entry['date'] = datetime.date.today().isoformat()
        
        # Set up headers
        headers = {
            "apikey": self.supabase_key,
            "Authorization": f"Bearer {self.supabase_key}",
            "Content-Type": "application/json",
            "Prefer": "return=minimal"  # For better performance
        }
        
        results = []
        
        # Process data in batches
        for i in range(0, len(data), batch_size):
            batch = data[i:i + batch_size]
            
            try:
                # Send batch to Supabase
                response = requests.post(
                    self.endpoint,
                    headers=headers,
                    data=json.dumps(batch)
                )
                
                # Check response
                if response.status_code in (200, 201):
                    results.append({
                        "batch": i // batch_size + 1,
                        "success": True,
                        "records": len(batch)
                    })
                else:
                    results.append({
                        "batch": i // batch_size + 1,
                        "success": False,
                        "status_code": response.status_code,
                        "message": response.text
                    })
            except Exception as e:
                results.append({
                    "batch": i // batch_size + 1,
                    "success": False,
                    "error": str(e)
                })
        
        # Summarize results
        success_count = sum(1 for r in results if r.get("success", False))
        total_batches = len(results)
        
        return {
            "success": success_count == total_batches,
            "message": f"Uploaded {success_count}/{total_batches} batches successfully",
            "details": results
        }
    
    def verify_connection(self) -> bool:
        """
        Verify the connection to Supabase.
        
        Returns:
            True if connection is successful, False otherwise
        """
        try:
            # Test connection by sending a HEAD request
            headers = {
                "apikey": self.supabase_key,
                "Authorization": f"Bearer {self.supabase_key}"
            }
            
            response = requests.head(
                self.endpoint,
                headers=headers
            )
            
            return response.status_code in (200, 204)
        except Exception:
            return False


if __name__ == "__main__":
    # Example usage
    from processor import TimetableProcessor
    
    # Get environment variables or use defaults
    supabase_url = os.environ.get('SUPABASE_URL', 'https://zzmrnguthyijlwcleacs.supabase.co')
    supabase_key = os.environ.get('SUPABASE_KEY', 'your-key-here')
    
    processor = TimetableProcessor()
    data = processor.process_timetable("examples/sample.xlsx")
    
    uploader = SupabaseUploader(supabase_url, supabase_key)
    
    if uploader.verify_connection():
        print("Connected to Supabase successfully!")
        result = uploader.upload_data(data)
        print(json.dumps(result, indent=2))
    else:
        print("Failed to connect to Supabase. Check your URL and API key.")