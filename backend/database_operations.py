from database import get_connection


# ==================================================
# ENSURE USER_ID COLUMN EXISTS
# ==================================================

def ensure_candidate_user_column():

    connection = get_connection()

    try:

        with connection.cursor() as cursor:

            cursor.execute(
                """
                ALTER TABLE candidates
                ADD COLUMN IF NOT EXISTS user_id INTEGER;
                """
            )


            # --------------------------------------
            # OPTIONAL FOREIGN KEY
            # --------------------------------------

            cursor.execute(
                """
                DO $$
                BEGIN

                    IF NOT EXISTS (

                        SELECT 1
                        FROM pg_constraint
                        WHERE conname =
                            'candidates_user_id_fkey'

                    ) THEN

                        ALTER TABLE candidates

                        ADD CONSTRAINT
                            candidates_user_id_fkey

                        FOREIGN KEY (
                            user_id
                        )

                        REFERENCES users(id)

                        ON DELETE SET NULL;

                    END IF;

                END
                $$;
                """
            )


            # --------------------------------------
            # INDEX
            # --------------------------------------

            cursor.execute(
                """
                CREATE INDEX IF NOT EXISTS
                idx_candidates_user_id
                ON candidates(user_id);
                """
            )


        connection.commit()


    finally:

        connection.close()


# ==================================================
# SAVE CANDIDATE
# ==================================================

def save_candidate(
    data,
    resume_filename,
    user_id=None
):

    # ----------------------------------------------
    # MAKE SURE COLUMN EXISTS
    # ----------------------------------------------

    ensure_candidate_user_column()


    skills = ", ".join(
        data.get(
            "skills",
            []
        )
    )


    connection = get_connection()


    try:

        with connection.cursor() as cursor:

            cursor.execute(
                """
                INSERT INTO candidates
                (
                    user_id,
                    name,
                    email,
                    phone,
                    experience,
                    skills,
                    resume_filename,
                    status
                )
                VALUES
                (
                    %s,
                    %s,
                    %s,
                    %s,
                    %s,
                    %s,
                    %s,
                    %s
                )
                RETURNING id;
                """,
                (
                    user_id,

                    data.get(
                        "name"
                    ),

                    data.get(
                        "email"
                    ),

                    data.get(
                        "phone"
                    ),

                    data.get(
                        "experience"
                    ),

                    skills,

                    resume_filename,

                    "New",
                )
            )


            candidate_id = (
                cursor.fetchone()[0]
            )


        connection.commit()


        return candidate_id


    finally:

        connection.close()


# ==================================================
# GET ALL SKILLS
# ==================================================

def get_all_skills(
    user_id=None,
    is_admin=False
):

    ensure_candidate_user_column()


    connection = get_connection()


    try:

        with connection.cursor() as cursor:

            query = """
                SELECT skills
                FROM candidates
                WHERE skills IS NOT NULL
                AND TRIM(skills) <> ''
            """

            parameters = []


            # --------------------------------------
            # USER FILTER
            # --------------------------------------

            if not is_admin:

                if user_id is None:

                    return []


                query += """
                    AND user_id = %s
                """

                parameters.append(
                    user_id
                )


            query += ";"



            cursor.execute(
                query,
                parameters
            )


            rows = cursor.fetchall()


            skills = set()


            for row in rows:

                if not row[0]:

                    continue


                candidate_skills = (
                    row[0].split(",")
                )


                for skill in candidate_skills:

                    cleaned_skill = (
                        skill.strip()
                    )


                    if cleaned_skill:

                        skills.add(
                            cleaned_skill
                        )


            return sorted(
                skills,
                key=str.lower
            )


    finally:

        connection.close()


# ==================================================
# SEARCH CANDIDATES
# ==================================================

def search_candidates(
    skill=None,
    skills=None,
    name=None,
    email=None,
    limit=20,
    user_id=None,
    is_admin=False
):

    ensure_candidate_user_column()


    connection = get_connection()


    try:

        with connection.cursor() as cursor:

            query = """
                SELECT
                    id,
                    user_id,
                    name,
                    email,
                    phone,
                    experience,
                    skills,
                    resume_filename,
                    status,
                    created_at
                FROM candidates
                WHERE 1 = 1
            """


            parameters = []


            # --------------------------------------
            # USER FILTER
            # --------------------------------------

            if not is_admin:

                if user_id is None:

                    return []


                query += """
                    AND user_id = %s
                """

                parameters.append(
                    user_id
                )


            # --------------------------------------
            # SINGLE SKILL
            # --------------------------------------

            if skill:

                query += """
                    AND skills ILIKE %s
                """

                parameters.append(
                    f"%{skill}%"
                )


            # --------------------------------------
            # MULTIPLE SKILLS
            # --------------------------------------

            if skills:

                for current_skill in skills:

                    query += """
                        AND skills ILIKE %s
                    """

                    parameters.append(
                        f"%{current_skill}%"
                    )


            # --------------------------------------
            # SEARCH BY NAME
            # --------------------------------------

            if name:

                query += """
                    AND name ILIKE %s
                """

                parameters.append(
                    f"%{name}%"
                )


            # --------------------------------------
            # SEARCH BY EMAIL
            # --------------------------------------

            if email:

                query += """
                    AND email ILIKE %s
                """

                parameters.append(
                    f"%{email}%"
                )


            # --------------------------------------
            # ORDER AND LIMIT
            # --------------------------------------

            query += """
                ORDER BY created_at DESC
                LIMIT %s
            """


            parameters.append(
                limit
            )


            cursor.execute(
                query,
                parameters
            )


            rows = cursor.fetchall()


            candidates = []


            for row in rows:

                candidates.append(
                    {

                        "id":
                            row[0],

                        "user_id":
                            row[1],

                        "name":
                            row[2],

                        "email":
                            row[3],

                        "phone":
                            row[4],

                        "experience":
                            row[5],

                        "skills":
                            row[6],

                        "resume_filename":
                            row[7],

                        "status":
                            (
                                row[8]
                                if row[8]
                                else "New"
                            ),

                        "created_at":
                            (
                                row[9].isoformat()
                                if row[9]
                                else None
                            ),

                    }
                )


            return candidates


    finally:

        connection.close()


# ==================================================
# GET CANDIDATE BY ID
# ==================================================

def get_candidate_by_id(
    candidate_id,
    user_id=None,
    is_admin=False
):

    ensure_candidate_user_column()


    connection = get_connection()


    try:

        with connection.cursor() as cursor:

            query = """
                SELECT
                    id,
                    user_id,
                    name,
                    email,
                    phone,
                    experience,
                    skills,
                    resume_filename,
                    status,
                    created_at
                FROM candidates
                WHERE id = %s
            """


            parameters = [
                candidate_id
            ]


            # --------------------------------------
            # USER OWNERSHIP
            # --------------------------------------

            if not is_admin:

                if user_id is None:

                    return None


                query += """
                    AND user_id = %s
                """

                parameters.append(
                    user_id
                )


            query += ";"


            cursor.execute(
                query,
                parameters
            )


            row = cursor.fetchone()


            if not row:

                return None


            return {

                "id":
                    row[0],

                "user_id":
                    row[1],

                "name":
                    row[2],

                "email":
                    row[3],

                "phone":
                    row[4],

                "experience":
                    row[5],

                "skills":
                    row[6],

                "resume_filename":
                    row[7],

                "status":
                    (
                        row[8]
                        if row[8]
                        else "New"
                    ),

                "created_at":
                    (
                        row[9].isoformat()
                        if row[9]
                        else None
                    ),

            }


    finally:

        connection.close()


# ==================================================
# UPDATE CANDIDATE STATUS
# ==================================================

def update_candidate_status(
    candidate_id,
    status,
    user_id=None,
    is_admin=False
):

    allowed_statuses = [

        "New",

        "Screening",

        "Shortlisted",

        "Interview",

        "Selected",

        "Rejected",

    ]


    if status not in allowed_statuses:

        raise ValueError(
            "Invalid candidate status."
        )


    ensure_candidate_user_column()


    connection = get_connection()


    try:

        with connection.cursor() as cursor:

            query = """
                UPDATE candidates
                SET status = %s
                WHERE id = %s
            """


            parameters = [

                status,

                candidate_id,

            ]


            # --------------------------------------
            # USER OWNERSHIP
            # --------------------------------------

            if not is_admin:

                if user_id is None:

                    return None


                query += """
                    AND user_id = %s
                """

                parameters.append(
                    user_id
                )


            query += """
                RETURNING
                    id,
                    user_id,
                    name,
                    email,
                    phone,
                    experience,
                    skills,
                    resume_filename,
                    status,
                    created_at;
            """


            cursor.execute(
                query,
                parameters
            )


            row = cursor.fetchone()


            if not row:

                return None


        connection.commit()


        return {

            "id":
                row[0],

            "user_id":
                row[1],

            "name":
                row[2],

            "email":
                row[3],

            "phone":
                row[4],

            "experience":
                row[5],

            "skills":
                row[6],

            "resume_filename":
                row[7],

            "status":
                (
                    row[8]
                    if row[8]
                    else "New"
                ),

            "created_at":
                (
                    row[9].isoformat()
                    if row[9]
                    else None
                ),

        }


    finally:

        connection.close()