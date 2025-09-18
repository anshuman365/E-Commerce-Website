import subprocess
import sys

def run_db_migration():
    try:
        print("Running database migration...")
        subprocess.run("flask db init", shell=True, check=True)
        subprocess.run("flask db migrate", shell=True, check=True)
        subprocess.run("flask db upgrade", shell=True, check=True)
        print("Database migration successful!")
    except subprocess.CalledProcessError as e:
        print(f"An error occurred: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
