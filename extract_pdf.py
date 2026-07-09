import os
import sys
import subprocess

def main():
    try:
        import pypdf
    except ImportError:
        print("Installing pypdf...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "pypdf"])
        import pypdf

    pdf_path = r"D:/Spring_Boot/StockPilot_Project/StockPilot_Complete_Guide.pdf"
    txt_path = r"D:/Spring_Boot/StockPilot_Project/StockPilot_Complete_Guide.txt"

    print(f"Reading PDF from: {pdf_path}")
    reader = pypdf.PdfReader(pdf_path)
    
    print(f"Total pages: {len(reader.pages)}")
    text_content = []
    
    for i, page in enumerate(reader.pages):
        text = page.extract_text()
        text_content.append(f"--- PAGE {i + 1} ---")
        text_content.append(text)
    
    full_text = "\n".join(text_content)
    with open(txt_path, "w", encoding="utf-8") as f:
        f.write(full_text)
    
    print(f"Successfully extracted text to: {txt_path}")

if __name__ == "__main__":
    main()
