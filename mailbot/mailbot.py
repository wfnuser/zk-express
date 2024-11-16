import os
import time
import poplib
from email import parser
from dotenv import load_dotenv

def fetch_latest_email(username, password):
    try:
        # Connect to Gmail's POP3 server
        pop_conn = poplib.POP3_SSL('pop.gmail.com')
        pop_conn.user(username)
        pop_conn.pass_(password)

        # Create mails directory if it doesn't exist
        mails_dir = "mails"
        if not os.path.exists(mails_dir):
            os.makedirs(mails_dir)

        # Get the latest message number
        print(pop_conn.list())
        latest_msg_num = len(pop_conn.list()[1])
        if latest_msg_num > 0:
            eml_path = os.path.join(mails_dir, f'{latest_msg_num}.eml')
            # Only download if the email hasn't been downloaded before
            # if not os.path.exists(eml_path):
            response, lines, octets = pop_conn.retr(latest_msg_num)
            # get date from the email
            # Date: Sat, 16 Nov 2024 12:01:38 -0800
            for line in lines:
                if line.startswith(b"Date:"):
                    date = line.split(b"-")[0].split(b":", 1)[1].strip().decode("utf-8")
                    break
            raw_message = b"\n".join(lines)
            # date to timestamp
            timestamp = int(time.mktime(time.strptime(date, "%a, %d %b %Y %H:%M:%S")))
            # Save as .eml file
            with open(eml_path, 'wb') as f:
                f.write(raw_message)
            print(f"Downloaded new email: {timestamp}.eml")
            # else:
            #     print(f"{latest_msg_num}.eml already exists")
        else:
            print("No emails found")

    except Exception as e:
        print(f"An error occurred: {str(e)}")
    
    finally:
        # Close the connection
        try:
            pop_conn.quit()
        except:
            pass

def main():
    load_dotenv()
    # Read credentials from environment variables
    username = os.getenv("GMAIL_USERNAME")
    password = os.getenv("GMAIL_PASSWORD")

    print("Starting email monitoring...")
    try:
        while True:
            print("\nChecking for new emails...")
            fetch_latest_email(username, password)
            time.sleep(10)  # Wait for 10 seconds before next check
    except KeyboardInterrupt:
        print("\nStopping email monitoring...")

if __name__ == "__main__":
    main()