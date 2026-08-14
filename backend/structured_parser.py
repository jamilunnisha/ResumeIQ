import re


def extract_email(text: str):
    match = re.search(
        r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}",
        text
    )

    return match.group(0) if match else None


def extract_phone(text: str):
    match = re.search(
        r"(?:\+91[\s-]?)?[6-9]\d{9}",
        text
    )

    return match.group(0) if match else None


def extract_name(text: str):
    lines = [
        line.strip()
        for line in text.splitlines()
        if line.strip()
    ]

    if lines:
        return lines[0]

    return None


def extract_experience(text: str):
    match = re.search(
        r"(\d+(?:\.\d+)?\+?)\s*(?:years?|yrs?)",
        text,
        re.IGNORECASE
    )

    return match.group(0) if match else None


def extract_skills(text: str):

    skills_database = [
        "Python",
        "Java",
        "JavaScript",
        "React",
        "Angular",
        "TypeScript",
        "HTML",
        "CSS",
        "Bootstrap",
        "Spring Boot",
        "Microservices",
        "Django",
        "Flask",
        "SQL",
        "MongoDB",
        "MySQL",
        "PostgreSQL",
        "AWS",
        "Azure",
        "Docker",
        "Jenkins",
        "Linux",
        "Terraform",
        "SAP",
        "FICO",
        "ABAP"
    ]

    found_skills = []

    text_lower = text.lower()

    for skill in skills_database:
        if skill.lower() in text_lower:
            found_skills.append(skill)

    return found_skills


def parse_resume(text: str):

    return {
        "name": extract_name(text),
        "email": extract_email(text),
        "phone": extract_phone(text),
        "experience": extract_experience(text),
        "skills": extract_skills(text)
    }