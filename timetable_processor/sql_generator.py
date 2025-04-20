"""
Module for generating SQL insert statements from timetable data.
"""
from typing import List, Dict, Any, Optional
import datetime


class SQLGenerator:
    """
    Class for generating SQL insert statements from timetable data.
    """

    def __init__(self, table_name: str = "timetable"):
        """
        Initialize the SQLGenerator.
        
        Args:
            table_name: Name of the table to insert data into
        """
        self.table_name = table_name
    
    # In the generate_insert_statements method of SQLGenerator class:

    def generate_insert_statements(self, data: List[Dict[str, Any]], 
                                batch_size: int = 100) -> List[str]:
        """
        Generate SQL insert statements from timetable data.
        
        Args:
            data: List of dictionaries containing timetable data
            batch_size: Number of rows per insert statement
            
        Returns:
            List of SQL insert statements
        """
        if not data:
            return []
        
        statements = []
        
        # Get column names from the first data entry
        columns = list(data[0].keys())
        
        # Ensure 'date' is in the columns
        if 'date' not in columns:
            # Add current date as fallback
            for entry in data:
                entry['date'] = datetime.date.today().isoformat()
            columns.append('date')
        
        # Process data in batches
        for i in range(0, len(data), batch_size):
            batch = data[i:i + batch_size]
            
            # Create the insert statement header
            insert_stmt = f"INSERT INTO {self.table_name} ({', '.join(columns)}) VALUES\n"
            
            # Add value rows
            value_rows = []
            
            for entry in batch:
                values = []
                for col in columns:
                    value = entry.get(col, '')
                    
                    # Format value based on its type
                    if value is None:
                        # For NOT NULL constraints, provide a default value
                        if col == 'date':
                            today = datetime.date.today().isoformat()
                            values.append(f"'{today}'")
                        else:
                            values.append('NULL')
                    elif isinstance(value, bool):
                        values.append('TRUE' if value else 'FALSE')
                    elif isinstance(value, (int, float)):
                        values.append(str(value))
                    elif col == 'date':
                        # Ensure date is in YYYY-MM-DD format
                        values.append(f"'{value}'")
                    else:
                        # Escape single quotes in string values
                        escaped_value = str(value).replace("'", "''")
                        values.append(f"'{escaped_value}'")
                
                value_rows.append(f"({', '.join(values)})")
            
            # Join all value rows with commas
            insert_stmt += ',\n'.join(value_rows) + ";"
            statements.append(insert_stmt)
        
        return statements
    
    def save_to_file(self, statements: List[str], output_file: str) -> None:
        """
        Save SQL statements to a file.
        
        Args:
            statements: List of SQL statements
            output_file: Output file path
        """
        try:
            with open(output_file, 'w') as file:
                for statement in statements:
                    file.write(statement + "\n\n")
            print(f"SQL statements saved to {output_file}")
        except Exception as e:
            raise Exception(f"Failed to save SQL statements to file: {e}")


if __name__ == "__main__":
    # Example usage
    from processor import TimetableProcessor
    
    processor = TimetableProcessor()
    data = processor.process_timetable("examples/sample.xlsx")
    
    generator = SQLGenerator()
    statements = generator.generate_insert_statements(data)
    generator.save_to_file(statements, "output/inserts.sql")