import psycopg


DATABASE_URL = (
    "dbname=resume_parser_db "
    "user=postgres "
    "password=Jammu@123 "
    "host=localhost "
    "port=5432"
)


def get_connection():
    return psycopg.connect(DATABASE_URL)