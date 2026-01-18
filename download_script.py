
import pandas as pd
import gdown
import os
import re

def clean_name(name):
    if not isinstance(name, str):
        return "Uncategorized"
    # Replace invalid characters for folder names
    return re.sub(r'[<>:"/\\|?*]', '_', name).strip()

def download_materials():
    csv_file = 'sheet_data.csv'
    output_base = '/Users/admin/Library/Mobile Documents/com~apple~CloudDocs/downloaded_materials'

    try:
        # Read CSV. Assuming header is on line 2 (index 1) based on 'head' output
        # Line 1: s,,, -> skip
        # Line 2: STT,Tên sách,Link,
        df = pd.read_csv(csv_file, skiprows=1)
        
        # Forward fill 'Tên sách' to handle merged cells or empty rows
        # The column name in the CSV is 'Tên sách'.
        if 'Tên sách' in df.columns:
            df['Tên sách'] = df['Tên sách'].ffill()
        else:
            print("Column 'Tên sách' not found. Using 'Uncategorized'.")
            df['Tên sách'] = "Uncategorized"

        for index, row in df.iterrows():
            link = row.get('Link')
            category = row.get('Tên sách')
            
            if pd.isna(link) or str(link).strip() == '':
                continue
            
            link = str(link).strip()
            
            # Filter: Only download Google Drive links
            if 'drive.google.com' not in link:
                print(f"Skipping non-Google Drive link: {link}")
                continue

            category_name = clean_name(category)
            
            target_dir = os.path.join(output_base, category_name)
            os.makedirs(target_dir, exist_ok=True)
            
            print(f"Processing: {category_name} - {link}")
            
            import time
            max_retries = 3
            
            # Simple heuristic to check if done (folder exists and not empty? hard to know for folders)
            # For files, we can check existence, but gdown handles that often.
            
            for attempt in range(max_retries):
                original_cwd = os.getcwd() # Initialize here so it's available in except block
                try:
                    if 'folder' in link or 'folderview' in link:
                        print(f"-> Detected as Folder. Downloading to {target_dir} (Attempt {attempt+1}/{max_retries})")
                        gdown.download_folder(url=link, output=target_dir, quiet=False, use_cookies=False)
                    else:
                        print(f"-> Detected as File. Downloading to {target_dir} (Attempt {attempt+1}/{max_retries})")
                        
                        os.chdir(target_dir)
                        # fuzzy=True extracts id from link
                        gdown.download(url=link, quiet=False, fuzzy=True, resume=True)
                        os.chdir(original_cwd)
                    
                    # If successful, break retry loop
                    break
                except Exception as e:
                    print(f"Error downloading {link} (Attempt {attempt+1}): {e}")
                    # Reset CWD just in case
                    if os.getcwd() != os.path.abspath(original_cwd): 
                        os.chdir(original_cwd)
                    
                    if attempt < max_retries - 1:
                        print("Waiting 5 seconds before retrying...")
                        time.sleep(5)
                    else:
                        print(f"Failed to download {link} after {max_retries} attempts.")

    except Exception as e:
        print(f"Fatal Error: {e}")

if __name__ == "__main__":
    download_materials()
