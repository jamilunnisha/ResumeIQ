import os
import psycopg
from dotenv import load_dotenv

# Load environment variables from backend/.env when running locally
load_dotenv()


DATABASE_URL = os.getenv("DATABASE_URL")


if not DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL environment variable is not configured."
    )


def get_connection():
    return psycopg.connect(DATABASE_URL)