from fastapi import (
    FastAPI,
    UploadFile,
    File,
    HTTPException,
    Header,
)

from fastapi.middleware.cors import CORSMiddleware

from fastapi.responses import FileResponse

from pydantic import BaseModel, Field

from pathlib import Path

import shutil


# ==================================================
# RESUME PARSER
# ==================================================

from resume_parser import (
    extract_text_from_pdf
)

from structured_parser import (
    parse_resume
)

from excel_exporter import (
    export_to_excel
)


# ==================================================
# DATABASE OPERATIONS
# ==================================================

from database_operations import (
    save_candidate,
    get_candidate_by_id,
    update_candidate_status,
    search_candidates,
    get_all_skills,
)


from database import get_connection


# ==================================================
# AI CHAT
# ==================================================

from ai_chat import (
    ask_resumeiq_ai_with_context
)


# ==================================================
# AUTHENTICATION
# ==================================================

from auth import (
    create_default_admin,
    get_user_by_email,
    verify_password,
    create_token,
    verify_token,
    public_user,
    update_user_profile,
    create_user,
)


# ==================================================
# FASTAPI APPLICATION
# ==================================================

app = FastAPI(
    title="Resume Parser R&D",
    description=(
        "API for uploading resumes "
        "and extracting structured data"
    ),
    version="1.0.0",
)


# ==================================================
# CORS
# ==================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://resume-iq-sepia-beta.vercel.app",
        "https://resume-o0qicjzx-jamilunnishas-projects.vercel.app",
        "https://resume-iq-three-xi.vercel.app",
        "https://resume-iq-git-main-jamilunnishas-projects.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================================================
# DIRECTORIES
# ==================================================

BASE_DIR = (
    Path(__file__)
    .resolve()
    .parent
    .parent
)


RESUMES_DIR = (
    BASE_DIR / "resumes"
)


RESUMES_DIR.mkdir(
    exist_ok=True
)


# ==================================================
# INITIALIZE AUTHENTICATION
# ==================================================

try:

    create_default_admin()

    print(
        "ResumeIQ authentication initialized."
    )

except Exception as e:

    print(
        "AUTH INITIALIZATION ERROR:",
        str(e)
    )


# ==================================================
# AUTH HELPER
# ==================================================

def get_authenticated_user(
    authorization: str = ""
):

    if not authorization:

        raise HTTPException(
            status_code=401,
            detail="Authentication required.",
        )


    if not authorization.startswith(
        "Bearer "
    ):

        raise HTTPException(
            status_code=401,
            detail="Invalid authorization header.",
        )


    token = (
        authorization[7:]
        .strip()
    )


    payload = verify_token(
        token
    )


    if not payload:

        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token.",
        )


    user = get_user_by_email(
        payload.get("email", "")
    )


    if not user:

        raise HTTPException(
            status_code=401,
            detail="User account not found.",
        )


    if not user["is_active"]:

        raise HTTPException(
            status_code=403,
            detail="This account is inactive.",
        )


    return user


# ==================================================
# HOME
# ==================================================

@app.get("/")
def home():

    return {

        "message":
            "Resume Parser R&D API is running",

        "status":
            "success",

    }


# ==================================================
# HEALTH CHECK
# ==================================================

@app.get("/health")
def health_check():

    return {

        "status":
            "healthy"

    }


# ==================================================
# LOGIN MODEL
# ==================================================

class LoginRequest(BaseModel):

    email: str = Field(
        ...,
        min_length=3,
        max_length=255,
    )

    password: str = Field(
        ...,
        min_length=1,
        max_length=200,
    )


# ==================================================
# REGISTER MODEL
# ==================================================

class RegisterRequest(BaseModel):

    name: str = Field(
        ...,
        min_length=2,
        max_length=150,
    )

    email: str = Field(
        ...,
        min_length=5,
        max_length=255,
    )

    password: str = Field(
        ...,
        min_length=8,
        max_length=200,
    )

    confirm_password: str = Field(
        ...,
        min_length=8,
        max_length=200,
    )


# ==================================================
# REGISTER
# ==================================================

@app.post("/auth/register")
def register(
    register_data: RegisterRequest
):

    name = (
        register_data.name
        .strip()
    )

    email = (
        register_data.email
        .strip()
        .lower()
    )

    password = (
        register_data.password
    )

    confirm_password = (
        register_data.confirm_password
    )


    if password != confirm_password:

        raise HTTPException(
            status_code=400,
            detail="Passwords do not match.",
        )


    try:

        user = create_user(
            name=name,
            email=email,
            password=password,
        )


        if not user:

            raise HTTPException(
                status_code=500,
                detail="Unable to create account.",
            )


        token = create_token(
            user_id=user["id"],
            email=user["email"],
            role=user["role"],
        )


        return {

            "status":
                "success",

            "message":
                "Account created successfully.",

            "token":
                token,

            "user":
                public_user(user),

        }


    except ValueError as e:

        raise HTTPException(
            status_code=400,
            detail=str(e),
        )


    except HTTPException:

        raise


    except Exception as e:

        print(
            "REGISTRATION ERROR:",
            str(e)
        )

        raise HTTPException(
            status_code=500,
            detail="Unable to create account.",
        )


# ==================================================
# LOGIN
# ==================================================

@app.post("/auth/login")
def login(
    login_data: LoginRequest
):

    email = (
        login_data.email
        .strip()
        .lower()
    )


    user = get_user_by_email(
        email
    )


    if not user:

        raise HTTPException(
            status_code=401,
            detail="Invalid email or password.",
        )


    if not user["is_active"]:

        raise HTTPException(
            status_code=403,
            detail="This account is inactive.",
        )


    password_valid = verify_password(
        login_data.password,
        user["password_hash"],
    )


    if not password_valid:

        raise HTTPException(
            status_code=401,
            detail="Invalid email or password.",
        )


    token = create_token(
        user_id=user["id"],
        email=user["email"],
        role=user["role"],
    )


    return {

        "status":
            "success",

        "message":
            "Login successful.",

        "token":
            token,

        "user":
            public_user(user),

    }


# ==================================================
# CURRENT USER
# ==================================================

@app.get("/auth/me")
def get_current_user(
    authorization: str = Header(
        default=""
    )
):

    user = get_authenticated_user(
        authorization
    )


    return {

        "status":
            "success",

        "user":
            public_user(user),

    }


# ==================================================
# PROFILE MODEL
# ==================================================

class ProfileUpdate(BaseModel):

    name: str = Field(
        ...,
        min_length=1,
        max_length=150,
    )

    email: str = Field(
        ...,
        min_length=3,
        max_length=255,
    )

    role: str = Field(
        ...,
        min_length=1,
        max_length=30,
    )


# ==================================================
# UPDATE PROFILE
# ==================================================

@app.put("/auth/profile")
def update_profile(
    profile_data: ProfileUpdate,
    authorization: str = Header(
        default=""
    ),
):

    current_user = get_authenticated_user(
        authorization
    )


    name = (
        profile_data.name
        .strip()
    )

    email = (
        profile_data.email
        .strip()
        .lower()
    )

    role = (
        profile_data.role
        .strip()
    )


    if (
        not name
        or not email
        or not role
    ):

        raise HTTPException(
            status_code=400,
            detail=(
                "Name, email and role "
                "are required."
            ),
        )


    # ----------------------------------------------
    # SECURITY
    # ----------------------------------------------
    # Recruiters cannot promote themselves
    # to Admin.

    if (
        current_user["role"] != "Admin"
        and role != current_user["role"]
    ):

        role = current_user["role"]


    try:

        user = update_user_profile(

            user_id=
                current_user["id"],

            name=name,

            email=email,

            role=role,

        )


    except Exception as e:

        error_text = str(e).lower()


        if (
            "unique" in error_text
            or "duplicate" in error_text
        ):

            raise HTTPException(
                status_code=409,
                detail=(
                    "That email address "
                    "is already in use."
                ),
            )


        print(
            "PROFILE UPDATE ERROR:",
            str(e)
        )


        raise HTTPException(
            status_code=500,
            detail="Could not update profile.",
        )


    if not user:

        raise HTTPException(
            status_code=404,
            detail="User account not found.",
        )


    new_token = create_token(
        user_id=user["id"],
        email=user["email"],
        role=user["role"],
    )


    return {

        "status":
            "success",

        "message":
            "Profile updated successfully.",

        "token":
            new_token,

        "user":
            public_user(user),

    }


# ==================================================
# CHAT MODEL
# ==================================================

class ChatMessage(BaseModel):

    message: str = Field(
        ...,
        min_length=1,
        max_length=2000,
    )

    conversation: list = Field(
        default_factory=list
    )


# ==================================================
# AI CHAT
# ==================================================

@app.post("/chat")
async def chat_with_ai(
    chat: ChatMessage,
    authorization: str = Header(
        default=""
    )
):

    # Authenticate the logged-in user before performing
    # any candidate search through the AI assistant.
    user = get_authenticated_user(
        authorization
    )

    is_admin = (
        user["role"] == "Admin"
    )

    try:

        result = (
            ask_resumeiq_ai_with_context(

                message=chat.message,

                conversation=chat.conversation,

                user_id=user["id"],

                is_admin=is_admin,

            )
        )


        answer = result.get(
            "answer",
            ""
        )


        database_context = (
            result.get(
                "database_context"
            )
        )


        candidates = []


        if isinstance(
            database_context,
            dict
        ):

            raw_candidates = (
                database_context.get(
                    "candidates",
                    []
                )
            )


            if isinstance(
                raw_candidates,
                list
            ):

                candidates = raw_candidates


        if (

            isinstance(
                database_context,
                dict
            )

            and database_context.get(
                "type"
            ) == "latest_candidate"

        ):

            latest_candidate = (
                database_context.get(
                    "candidate"
                )
            )


            if latest_candidate:

                candidates = [
                    latest_candidate
                ]


        return {

            "status":
                "success",

            "answer":
                answer,

            "candidates":
                candidates,

        }


    except ValueError as e:

        raise HTTPException(
            status_code=400,
            detail=str(e),
        )


    except Exception as e:

        print(
            "AI CHAT ERROR:",
            str(e)
        )


        raise HTTPException(
            status_code=500,
            detail="Unable to process AI request.",
        )


# ==================================================
# VIEW RESUME
# ==================================================

@app.get("/resume/{filename}")
def get_resume(
    filename: str,
    authorization: str = Header(
        default=""
    )
):

    user = get_authenticated_user(
        authorization
    )


    # ----------------------------------------------
    # CHECK RESUME OWNERSHIP
    # ----------------------------------------------

    connection = get_connection()


    try:

        with connection.cursor() as cursor:

            if user["role"] == "Admin":

                cursor.execute(
                    """
                    SELECT id
                    FROM candidates
                    WHERE resume_filename = %s
                    LIMIT 1;
                    """,
                    (
                        filename,
                    )
                )

            else:

                cursor.execute(
                    """
                    SELECT id
                    FROM candidates
                    WHERE resume_filename = %s
                    AND user_id = %s
                    LIMIT 1;
                    """,
                    (
                        filename,
                        user["id"],
                    )
                )


            candidate = (
                cursor.fetchone()
            )


    finally:

        connection.close()


    if not candidate:

        raise HTTPException(
            status_code=404,
            detail="Resume not found.",
        )


    file_path = (
        RESUMES_DIR / filename
    )


    if not file_path.exists():

        raise HTTPException(
            status_code=404,
            detail="Resume file not found.",
        )


    if (
        file_path.suffix.lower()
        != ".pdf"
    ):

        raise HTTPException(
            status_code=400,
            detail="Only PDF resumes are supported.",
        )


    return FileResponse(

        path=file_path,

        media_type="application/pdf",

        content_disposition_type="inline",

    )


# ==================================================
# UPLOAD AND PARSE RESUME
# ==================================================

@app.post("/upload-resume")
async def upload_resume(
    file: UploadFile = File(...),
    authorization: str = Header(
        default=""
    )
):

    user = get_authenticated_user(
        authorization
    )


    if not file.filename:

        raise HTTPException(
            status_code=400,
            detail="No file was provided.",
        )


    if not file.filename.lower().endswith(
        ".pdf"
    ):

        raise HTTPException(
            status_code=400,
            detail=(
                "Only PDF files are "
                "currently supported."
            ),
        )


    file_path = (
        RESUMES_DIR /
        file.filename
    )


    try:

        # ==========================================
        # SAVE PDF
        # ==========================================

        with file_path.open(
            "wb"
        ) as buffer:

            shutil.copyfileobj(
                file.file,
                buffer,
            )


        # ==========================================
        # EXTRACT TEXT
        # ==========================================

        extracted_text = (
            extract_text_from_pdf(
                str(file_path)
            )
        )


        # ==========================================
        # PARSE RESUME
        # ==========================================

        structured_data = (
            parse_resume(
                extracted_text
            )
        )


        # ==========================================
        # EXCEL
        # ==========================================

        excel_file = (
            export_to_excel(
                structured_data,
                file.filename,
            )
        )


        # ==========================================
        # SAVE CANDIDATE WITH USER ID
        # ==========================================

        candidate_id = (
            save_candidate(

                structured_data,

                file.filename,

                user_id=user["id"],

            )
        )


        return {

            "filename":
                file.filename,

            "status":
                "success",

            "message":
                (
                    "Resume parsed, "
                    "stored in Excel "
                    "and PostgreSQL"
                ),

            "candidate_id":
                candidate_id,

            "candidate_status":
                "New",

            "data":
                structured_data,

            "excel_file":
                excel_file,

        }


    except Exception as e:

        print(
            "RESUME UPLOAD ERROR:",
            str(e)
        )


        raise HTTPException(
            status_code=500,
            detail=(
                "Could not process "
                f"resume: {str(e)}"
            ),
        )


# ==================================================
# GET ALL CANDIDATES
# ==================================================

@app.get("/candidates")
def get_candidates(
    authorization: str = Header(
        default=""
    )
):

    user = get_authenticated_user(
        authorization
    )


    is_admin = (
        user["role"] == "Admin"
    )


    candidates = search_candidates(

        user_id=user["id"],

        is_admin=is_admin,

        limit=1000,

    )


    return {

        "status":
            "success",

        "count":
            len(candidates),

        "candidates":
            candidates,

    }


# ==================================================
# GET SINGLE CANDIDATE
# ==================================================

@app.get(
    "/candidates/{candidate_id}"
)
def get_single_candidate(
    candidate_id: int,

    authorization: str = Header(
        default=""
    )
):

    user = get_authenticated_user(
        authorization
    )


    is_admin = (
        user["role"] == "Admin"
    )


    candidate = (
        get_candidate_by_id(

            candidate_id,

            user_id=user["id"],

            is_admin=is_admin,

        )
    )


    if not candidate:

        raise HTTPException(
            status_code=404,
            detail="Candidate not found.",
        )


    return {

        "status":
            "success",

        "candidate":
            candidate,

    }


# ==================================================
# CANDIDATE STATUS MODEL
# ==================================================

class CandidateStatusUpdate(
    BaseModel
):

    status: str = Field(
        ...,
        min_length=1,
        max_length=30,
    )


# ==================================================
# UPDATE CANDIDATE STATUS
# ==================================================

@app.patch(
    "/candidates/{candidate_id}/status"
)
def change_candidate_status(

    candidate_id: int,

    status_data:
        CandidateStatusUpdate,

    authorization: str = Header(
        default=""
    ),

):

    allowed_statuses = [

        "New",

        "Screening",

        "Shortlisted",

        "Interview",

        "Selected",

        "Rejected",

    ]


    if (
        status_data.status
        not in allowed_statuses
    ):

        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid status. "
                "Allowed statuses: "
                +
                ", ".join(
                    allowed_statuses
                )
            ),
        )


    user = get_authenticated_user(
        authorization
    )


    is_admin = (
        user["role"] == "Admin"
    )


    try:

        candidate = (
            update_candidate_status(

                candidate_id,

                status_data.status,

                user_id=user["id"],

                is_admin=is_admin,

            )
        )


        if not candidate:

            raise HTTPException(
                status_code=404,
                detail="Candidate not found.",
            )


        return {

            "status":
                "success",

            "message":
                (
                    "Candidate status "
                    "updated successfully."
                ),

            "candidate":
                candidate,

        }


    except HTTPException:

        raise


    except ValueError as e:

        raise HTTPException(
            status_code=400,
            detail=str(e),
        )


    except Exception as e:

        print(
            "STATUS UPDATE ERROR:",
            str(e)
        )


        raise HTTPException(
            status_code=500,
            detail=(
                "Could not update "
                "candidate status: "
                f"{str(e)}"
            ),
        )