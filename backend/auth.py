import base64
import hashlib
import hmac
import json
import secrets
import time

from database import get_connection


# ==================================================
# AUTHENTICATION CONFIGURATION
# ==================================================

TOKEN_EXPIRE_SECONDS = 60 * 60 * 8
# 8 hours


# ==================================================
# PASSWORD HASHING
# ==================================================

def hash_password(password: str) -> str:

    if not password:

        raise ValueError(
            "Password cannot be empty."
        )


    salt = secrets.token_bytes(16)


    password_hash = hashlib.pbkdf2_hmac(

        "sha256",

        password.encode("utf-8"),

        salt,

        200_000,

    )


    return (

        "pbkdf2_sha256$"

        + base64.urlsafe_b64encode(
            salt
        ).decode("utf-8")

        + "$"

        + base64.urlsafe_b64encode(
            password_hash
        ).decode("utf-8")

    )


# ==================================================
# PASSWORD VERIFICATION
# ==================================================

def verify_password(
    password: str,
    stored_password: str,
) -> bool:

    try:

        algorithm, salt_encoded, hash_encoded = (
            stored_password.split("$")
        )


        if algorithm != "pbkdf2_sha256":

            return False


        salt = base64.urlsafe_b64decode(
            salt_encoded.encode("utf-8")
        )


        expected_hash = (
            base64.urlsafe_b64decode(
                hash_encoded.encode("utf-8")
            )
        )


        actual_hash = hashlib.pbkdf2_hmac(

            "sha256",

            password.encode("utf-8"),

            salt,

            200_000,

        )


        return hmac.compare_digest(

            actual_hash,

            expected_hash,

        )


    except Exception:

        return False


# ==================================================
# TOKEN SECRET
# ==================================================

def get_token_secret():

    connection = get_connection()


    try:

        with connection.cursor() as cursor:

            cursor.execute(
                """
                CREATE TABLE IF NOT EXISTS
                resumeiq_auth_config
                (
                    id INTEGER PRIMARY KEY,
                    token_secret TEXT NOT NULL
                );
                """
            )


            cursor.execute(
                """
                SELECT token_secret
                FROM resumeiq_auth_config
                WHERE id = 1;
                """
            )


            row = cursor.fetchone()


            if row:

                return row[0]


            secret = secrets.token_urlsafe(
                64
            )


            cursor.execute(
                """
                INSERT INTO
                resumeiq_auth_config
                (
                    id,
                    token_secret
                )
                VALUES (1, %s);
                """,
                (secret,),
            )


            connection.commit()


            return secret


    finally:

        connection.close()


# ==================================================
# CREATE TOKEN
# ==================================================

def create_token(
    user_id: int,
    email: str,
    role: str,
):

    secret = get_token_secret()


    payload = {

        "user_id":
            user_id,

        "email":
            email,

        "role":
            role,

        "expires_at":
            int(
                time.time()
                + TOKEN_EXPIRE_SECONDS
            ),

    }


    payload_json = json.dumps(

        payload,

        separators=(
            ",",
            ":",
        ),

        sort_keys=True,

    )


    payload_encoded = (

        base64.urlsafe_b64encode(

            payload_json.encode(
                "utf-8"
            )

        )
        .decode("utf-8")
        .rstrip("=")

    )


    signature = hmac.new(

        secret.encode("utf-8"),

        payload_encoded.encode(
            "utf-8"
        ),

        hashlib.sha256,

    ).hexdigest()


    return (

        payload_encoded

        + "."

        + signature

    )


# ==================================================
# VERIFY TOKEN
# ==================================================

def verify_token(
    token: str,
):

    if not token:

        return None


    try:

        parts = token.split(".")


        if len(parts) != 2:

            return None


        payload_encoded = parts[0]

        received_signature = parts[1]


        secret = get_token_secret()


        expected_signature = hmac.new(

            secret.encode("utf-8"),

            payload_encoded.encode(
                "utf-8"
            ),

            hashlib.sha256,

        ).hexdigest()


        if not hmac.compare_digest(

            received_signature,

            expected_signature,

        ):

            return None


        padding = "=" * (

            -len(payload_encoded)
            % 4

        )


        payload_json = (

            base64.urlsafe_b64decode(

                (

                    payload_encoded

                    + padding

                ).encode("utf-8")

            )
            .decode("utf-8")

        )


        payload = json.loads(
            payload_json
        )


        if (

            payload.get(
                "expires_at",
                0
            )

            < int(time.time())

        ):

            return None


        return payload


    except Exception:

        return None


# ==================================================
# CREATE USERS TABLE
# ==================================================

def create_users_table():

    connection = get_connection()


    try:

        with connection.cursor() as cursor:

            cursor.execute(
                """
                CREATE TABLE IF NOT EXISTS
                users
                (
                    id SERIAL PRIMARY KEY,

                    name VARCHAR(150)
                    NOT NULL,

                    email VARCHAR(255)
                    UNIQUE NOT NULL,

                    password_hash TEXT
                    NOT NULL,

                    role VARCHAR(30)
                    NOT NULL
                    DEFAULT 'Recruiter',

                    is_active BOOLEAN
                    NOT NULL
                    DEFAULT TRUE,

                    created_at TIMESTAMP
                    NOT NULL
                    DEFAULT CURRENT_TIMESTAMP
                );
                """
            )


        connection.commit()


    finally:

        connection.close()


# ==================================================
# CREATE DEFAULT ADMIN
# ==================================================

def create_default_admin():

    create_users_table()


    connection = get_connection()


    try:

        with connection.cursor() as cursor:

            cursor.execute(
                """
                SELECT id
                FROM users
                WHERE LOWER(email) =
                      LOWER(%s);
                """,
                (
                    "admin@resumeiq.com",
                ),
            )


            existing_user = (
                cursor.fetchone()
            )


            if existing_user:

                return


            password_hash = hash_password(
                "admin123"
            )


            cursor.execute(
                """
                INSERT INTO users
                (
                    name,
                    email,
                    password_hash,
                    role,
                    is_active
                )
                VALUES
                (
                    %s,
                    %s,
                    %s,
                    %s,
                    TRUE
                );
                """,
                (
                    "ResumeIQ Admin",
                    "admin@resumeiq.com",
                    password_hash,
                    "Admin",
                ),
            )


        connection.commit()


    finally:

        connection.close()


# ==================================================
# FIND USER BY EMAIL
# ==================================================

def get_user_by_email(
    email: str,
):

    connection = get_connection()


    try:

        with connection.cursor() as cursor:

            cursor.execute(
                """
                SELECT
                    id,
                    name,
                    email,
                    password_hash,
                    role,
                    is_active,
                    created_at
                FROM users
                WHERE LOWER(email) =
                      LOWER(%s);
                """,
                (email,),
            )


            row = cursor.fetchone()


            if not row:

                return None


            return {

                "id":
                    row[0],

                "name":
                    row[1],

                "email":
                    row[2],

                "password_hash":
                    row[3],

                "role":
                    row[4],

                "is_active":
                    row[5],

                "created_at":
                    (
                        row[6].isoformat()
                        if row[6]
                        else None
                    ),

            }


    finally:

        connection.close()


# ==================================================
# CREATE NEW USER
# ==================================================

def create_user(
    name: str,
    email: str,
    password: str,
):

    create_users_table()


    cleaned_name = (
        name.strip()
    )

    cleaned_email = (
        email.strip().lower()
    )


    if not cleaned_name:

        raise ValueError(
            "Name is required."
        )


    if not cleaned_email:

        raise ValueError(
            "Email is required."
        )


    if "@" not in cleaned_email:

        raise ValueError(
            "Please enter a valid email address."
        )


    if len(password) < 8:

        raise ValueError(
            "Password must contain at least 8 characters."
        )


    # ----------------------------------------------
    # CHECK EXISTING EMAIL
    # ----------------------------------------------

    existing_user = (
        get_user_by_email(
            cleaned_email
        )
    )


    if existing_user:

        raise ValueError(
            "An account with this email already exists."
        )


    # ----------------------------------------------
    # HASH PASSWORD
    # ----------------------------------------------

    password_hash = hash_password(
        password
    )


    # ----------------------------------------------
    # CREATE USER
    # ----------------------------------------------

    connection = get_connection()


    try:

        with connection.cursor() as cursor:

            cursor.execute(
                """
                INSERT INTO users
                (
                    name,
                    email,
                    password_hash,
                    role,
                    is_active
                )
                VALUES
                (
                    %s,
                    %s,
                    %s,
                    %s,
                    TRUE
                )
                RETURNING
                    id,
                    name,
                    email,
                    password_hash,
                    role,
                    is_active,
                    created_at;
                """,
                (
                    cleaned_name,
                    cleaned_email,
                    password_hash,
                    "Recruiter",
                ),
            )


            row = cursor.fetchone()


        connection.commit()


        if not row:

            return None


        return {

            "id":
                row[0],

            "name":
                row[1],

            "email":
                row[2],

            "password_hash":
                row[3],

            "role":
                row[4],

            "is_active":
                row[5],

            "created_at":
                (
                    row[6].isoformat()
                    if row[6]
                    else None
                ),

        }


    except Exception as e:

        connection.rollback()


        error_text = str(e).lower()


        if (
            "unique" in error_text
            or "duplicate" in error_text
        ):

            raise ValueError(
                "An account with this email already exists."
            )


        raise


    finally:

        connection.close()


# ==================================================
# UPDATE USER PROFILE
# ==================================================

def update_user_profile(
    user_id: int,
    name: str,
    email: str,
    role: str,
):

    connection = get_connection()


    try:

        with connection.cursor() as cursor:

            cursor.execute(
                """
                UPDATE users
                SET
                    name = %s,
                    email = %s,
                    role = %s
                WHERE id = %s
                RETURNING
                    id,
                    name,
                    email,
                    password_hash,
                    role,
                    is_active,
                    created_at;
                """,
                (
                    name,
                    email,
                    role,
                    user_id,
                ),
            )


            row = cursor.fetchone()


        connection.commit()


        if not row:

            return None


        return {

            "id":
                row[0],

            "name":
                row[1],

            "email":
                row[2],

            "password_hash":
                row[3],

            "role":
                row[4],

            "is_active":
                row[5],

            "created_at":
                (
                    row[6].isoformat()
                    if row[6]
                    else None
                ),

        }


    finally:

        connection.close()


# ==================================================
# SAFE USER RESPONSE
# ==================================================

def public_user(user):

    if not user:

        return None


    return {

        "id":
            user.get("id"),

        "name":
            user.get("name"),

        "email":
            user.get("email"),

        "role":
            user.get("role"),

        "is_active":
            user.get("is_active"),

        "created_at":
            user.get("created_at"),

    }