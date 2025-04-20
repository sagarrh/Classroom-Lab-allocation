"""
Command-line interface for the timetable processor.
"""
import argparse
import os
import sys
import logging
from datetime import datetime

from processor import TimetableProcessor
from sql_generator import SQLGenerator
from uploader import SupabaseUploader


def setup_logging(verbose: bool = False) -> logging.Logger:
    """
    Set up logging configuration.
    
    Args:
        verbose: Enable verbose logging
        
    Returns:
        Configured logger
    """
    log_level = logging.DEBUG if verbose else logging.INFO
    
    # Configure logger
    logger = logging.getLogger("timetable_processor")
    logger.setLevel(log_level)
    
    # Add console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(log_level)
    
    # Formatter
    formatter = logging.Formatter("%(asctime)s - %(levelname)s - %(message)s")
    console_handler.setFormatter(formatter)
    
    logger.addHandler(console_handler)
    
    return logger


def main():
    """
    Main entry point for the timetable processor.
    """
    # Parse command-line arguments
    parser = argparse.ArgumentParser(description="Process timetable Excel files and convert to SQL or upload to Supabase")
    
    parser.add_argument("--file", "-f", required=True, help="Path to the Excel file to process")
    parser.add_argument("--output", "-o", help="Path to save the SQL output file")
    parser.add_argument("--upload", action="store_true", help="Upload data to Supabase")
    parser.add_argument("--supabase-url", help="Supabase URL")
    parser.add_argument("--supabase-key", help="Supabase API key")
    parser.add_argument("--table", default="timetable", help="Table name (default: timetable)")
    parser.add_argument("--date", help="Override date for all entries (YYYY-MM-DD format)")
    parser.add_argument("--batch-size", type=int, default=50, help="Batch size for uploads/inserts")
    parser.add_argument("--verbose", "-v", action="store_true", help="Enable verbose logging")
    
    args = parser.parse_args()
    
    # Set up logging
    logger = setup_logging(args.verbose)
    
    # Validate input file
    if not os.path.exists(args.file):
        logger.error(f"Input file not found: {args.file}")
        return 1
    
    # If upload is requested, check Supabase credentials
    if args.upload and (not args.supabase_url or not args.supabase_key):
        logger.error("Supabase URL and API key are required for upload")
        return 1
    
    # If output path is specified, ensure directory exists
    if args.output:
        output_dir = os.path.dirname(args.output)
        if output_dir and not os.path.exists(output_dir):
            os.makedirs(output_dir, exist_ok=True)
    
    # Process timetable
    # In the main() function in main.py, modify the timetable processing part:

# Process timetable
    try:
        logger.info(f"Processing file: {args.file}")
        processor = TimetableProcessor(debug=args.verbose)
        
        # Pass the date parameter to the processor
        data = processor.process_timetable(args.file, default_date=args.date)
        logger.info(f"Extracted {len(data)} time slot entries")
        
        if len(data) == 0:
            logger.error("No data extracted from the file")
            return 1
        
        # Generate SQL or upload to Supabase
        if args.upload:
            logger.info(f"Uploading data to Supabase: {args.supabase_url}")
            uploader = SupabaseUploader(args.supabase_url, args.supabase_key, args.table)
            
            # Verify connection
            if not uploader.verify_connection():
                logger.error("Could not connect to Supabase. Check your URL and API key.")
                return 1
            
            # Upload data
            result = uploader.upload_data(data, batch_size=args.batch_size)
            
            if result["success"]:
                logger.info(result["message"])
            else:
                logger.error(f"Upload failed: {result['message']}")
                logger.debug(f"Details: {result['details']}")
                return 1
        
        else:
            # Generate SQL
            output_file = args.output or "output/inserts.sql"
            logger.info(f"Generating SQL insert statements to: {output_file}")
            
            generator = SQLGenerator(args.table)
            statements = generator.generate_insert_statements(data, batch_size=args.batch_size)
            
            generator.save_to_file(statements, output_file)
            logger.info(f"SQL statements saved to {output_file}")
    
    except Exception as e:
        logger.error(f"Error processing timetable: {str(e)}")
        if args.verbose:
            import traceback
            logger.debug(traceback.format_exc())
        return 1


if __name__ == "__main__":
    sys.exit(main())