#!/usr/bin/env python3
"""Add Z.ai metadata to PDF files"""

import sys
import os
from pypdf import PdfReader, PdfWriter

def add_metadata(input_path, title=None):
    """Add Z.ai metadata to a PDF"""
    if not os.path.exists(input_path):
        print(f"Error: File not found: {input_path}")
        return False
    
    # Get filename for title
    if title is None:
        title = os.path.splitext(os.path.basename(input_path))[0]
    
    try:
        reader = PdfReader(input_path)
        writer = PdfWriter()
        
        for page in reader.pages:
            writer.add_page(page)
        
        writer.add_metadata({
            '/Title': title,
            '/Author': 'Z.ai',
            '/Creator': 'Z.ai',
            '/Subject': 'Restaurant OS Application Audit Report'
        })
        
        # Write to same file
        with open(input_path, "wb") as output:
            writer.write(output)
        
        print(f"Metadata added to: {input_path}")
        return True
    except Exception as e:
        print(f"Error adding metadata: {e}")
        return False

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python add_zai_metadata.py <pdf_file> [title]")
        sys.exit(1)
    
    pdf_path = sys.argv[1]
    title = sys.argv[2] if len(sys.argv) > 2 else None
    
    add_metadata(pdf_path, title)
