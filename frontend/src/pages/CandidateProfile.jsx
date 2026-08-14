import { useEffect, useState } from "react";

import {
  ArrowLeft,
  Mail,
  Phone,
  FileText,
  Briefcase,
  Code2,
  User,
  CalendarDays,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  Download,
  Maximize2,
  Copy,
  Check,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

import API from "../api";

// ==================================================
// API URL
// ==================================================

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000";

// ==================================================
// GET AUTH TOKEN
// ==================================================

const getAuthToken = () => {
  return (
    localStorage.getItem("resumeiq_token") ||
    sessionStorage.getItem("resumeiq_token")
  );
};

// ==================================================
// AUTH CONFIG
// ==================================================

const getAuthConfig = () => {
  const token = getAuthToken();

  if (!token) {
    return {};
  }

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// ==================================================
// MAIN COMPONENT
// ==================================================

function CandidateProfile({
  candidateId,
  onNavigate,
}) {
  const [candidate, setCandidate] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [copiedField, setCopiedField] =
    useState("");

  const [resumePreviewUrl, setResumePreviewUrl] =
    useState(null);

  const [resumeLoading, setResumeLoading] =
    useState(false);

  const [resumeError, setResumeError] =
    useState("");

  // ==================================================
  // FETCH SINGLE CANDIDATE
  // ==================================================

  const fetchCandidate = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getAuthToken();

      if (!token) {
        setError(
          "Authentication required. Please log in again."
        );
        return;
      }

      // IMPORTANT:
      // Fetch only the selected candidate.
      // Backend endpoint:
      // GET /candidates/{candidate_id}

      const response = await API.get(
        `/candidates/${candidateId}`
      );

      const foundCandidate =
        response.data?.candidate;

      if (!foundCandidate) {
        setError(
          "Candidate could not be found."
        );
        return;
      }

      setCandidate(foundCandidate);

    } catch (err) {
      console.error(
        "Candidate fetch error:",
        err
      );

      if (
        err.response?.status === 401
      ) {
        setError(
          "Your session has expired or authentication is missing. Please log in again."
        );
      } else if (
        err.response?.status === 404
      ) {
        setError(
          "Candidate could not be found."
        );
      } else {
        setError(
          err.response?.data?.detail ||
            "Unable to load candidate information."
        );
      }

    } finally {
      setLoading(false);
    }
  };

  // ==================================================
  // LOAD CANDIDATE
  // ==================================================

  useEffect(() => {
    if (candidateId) {
      fetchCandidate();
    }
  }, [candidateId]);

  // ==================================================
  // LOAD RESUME PREVIEW
  // ==================================================

  const loadResumePreview = async () => {
    if (
      !candidate?.resume_filename
    ) {
      setResumeError(
        "No resume file is available."
      );

      return null;
    }

    try {
      setResumeLoading(true);
      setResumeError("");

      const token =
        getAuthToken();

      if (!token) {
        setResumeError(
          "Authentication required. Please log in again."
        );

        return null;
      }

      /*
       * IMPORTANT:
       *
       * We cannot put /resume/file.pdf directly
       * inside the iframe because the browser will
       * not automatically send the Authorization
       * header.
       *
       * So we request the PDF using Axios with
       * the Bearer token and create a Blob URL.
       */

      const response =
        await API.get(
          `/resume/${encodeURIComponent(
            candidate.resume_filename
          )}`,
          {
            responseType: "blob",
          }
        );

      const contentType =
        response.headers?.[
          "content-type"
        ] ||
        "application/pdf";

      const blob =
        new Blob(
          [response.data],
          {
            type: contentType,
          }
        );

      const blobUrl =
        URL.createObjectURL(
          blob
        );

      setResumePreviewUrl(
        (oldUrl) => {
          if (oldUrl) {
            URL.revokeObjectURL(
              oldUrl
            );
          }

          return blobUrl;
        }
      );

      return blobUrl;

    } catch (err) {
      console.error(
        "Resume preview error:",
        err
      );

      if (
        err.response?.status === 401
      ) {
        setResumeError(
          "Authentication required. Please log in again."
        );
      } else if (
        err.response?.status === 404
      ) {
        setResumeError(
          "Resume file could not be found."
        );
      } else {
        setResumeError(
          err.response?.data?.detail ||
            "Unable to load resume preview."
        );
      }

      return null;

    } finally {
      setResumeLoading(false);
    }
  };

  // ==================================================
  // LOAD PDF AFTER CANDIDATE LOADS
  // ==================================================

  useEffect(() => {
    if (
      candidate?.resume_filename
    ) {
      loadResumePreview();
    }

    return () => {
      if (resumePreviewUrl) {
        URL.revokeObjectURL(
          resumePreviewUrl
        );
      }
    };
  }, [
    candidate?.resume_filename,
  ]);

  // ==================================================
  // OPEN RESUME
  // ==================================================

  const openResume = async () => {
    if (
      !candidate?.resume_filename
    ) {
      return;
    }

    try {
      let url =
        resumePreviewUrl;

      if (!url) {
        url =
          await loadResumePreview();
      }

      if (!url) {
        return;
      }

      window.open(
        url,
        "_blank",
        "noopener,noreferrer"
      );

    } catch (err) {
      console.error(
        "Open resume error:",
        err
      );
    }
  };

  // ==================================================
  // DOWNLOAD RESUME
  // ==================================================

  const downloadResume = async () => {
    if (
      !candidate?.resume_filename
    ) {
      return;
    }

    try {
      const token =
        getAuthToken();

      if (!token) {
        setResumeError(
          "Authentication required. Please log in again."
        );

        return;
      }

      const response =
        await API.get(
          `/resume/${encodeURIComponent(
            candidate.resume_filename
          )}`,
          {
            responseType: "blob",
          }
        );

      const blob =
        new Blob(
          [response.data],
          {
            type:
              response.headers?.[
                "content-type"
              ] ||
              "application/pdf",
          }
        );

      const url =
        URL.createObjectURL(
          blob
        );

      const link =
        document.createElement(
          "a"
        );

      link.href =
        url;

      link.download =
        candidate.resume_filename ||
        "resume.pdf";

      document.body.appendChild(
        link
      );

      link.click();

      document.body.removeChild(
        link
      );

      setTimeout(() => {
        URL.revokeObjectURL(
          url
        );
      }, 1000);

    } catch (err) {
      console.error(
        "Download resume error:",
        err
      );

      if (
        err.response?.status === 401
      ) {
        setResumeError(
          "Authentication required. Please log in again."
        );
      } else {
        setResumeError(
          "Unable to download resume."
        );
      }
    }
  };

  // ==================================================
  // COPY CONTACT
  // ==================================================

  const copyToClipboard = async (
    value,
    field
  ) => {
    if (!value) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        value
      );

      setCopiedField(
        field
      );

      setTimeout(() => {
        setCopiedField("");
      }, 1500);

    } catch (err) {
      console.error(
        "Copy error:",
        err
      );
    }
  };

  // ==================================================
  // DATA
  // ==================================================

  const skills =
    normalizeSkills(
      candidate?.skills
    );

  // ==================================================
  // PAGE
  // ==================================================

  return (
    <div className="min-h-screen bg-[#f7f8fc]">

      {/* ==================================================
          SIDEBAR
      ================================================== */}

      <Sidebar
        activePage="candidates"
        onNavigate={onNavigate}
      />

      {/* ==================================================
          MAIN
      ================================================== */}

      <div className="lg:pl-[260px]">

        {/* HEADER */}

        <Header
          title="Candidate Profile"
          subtitle="Candidate intelligence"
        />

        <main className="mx-auto max-w-[1550px] px-5 py-7 sm:px-7 lg:px-9">

          {/* ==================================================
              BACK
          ================================================== */}

          <button
            type="button"
            onClick={() =>
              onNavigate(
                "candidates"
              )
            }
            className="mb-6 flex items-center gap-2 text-xs font-semibold text-slate-500 transition hover:text-indigo-600"
          >
            <ArrowLeft
              size={15}
            />

            Back to candidates
          </button>

          {/* ==================================================
              LOADING
          ================================================== */}

          {loading && (
            <div className="flex min-h-[550px] items-center justify-center">

              <div className="text-center">

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50">

                  <RefreshCw
                    size={26}
                    className="animate-spin text-indigo-500"
                  />

                </div>

                <p className="mt-5 text-sm font-bold text-slate-700">
                  Loading candidate profile...
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Fetching candidate information
                </p>

              </div>

            </div>
          )}

          {/* ==================================================
              ERROR
          ================================================== */}

          {!loading && error && (
            <div className="rounded-2xl border border-red-200 bg-white p-7 shadow-sm">

              <div className="flex items-start gap-4">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500">

                  <FileText
                    size={20}
                  />

                </div>

                <div>

                  <p className="text-sm font-bold text-red-700">
                    Unable to load candidate
                  </p>

                  <p className="mt-1 text-xs leading-5 text-red-500">
                    {error}
                  </p>

                  <button
                    type="button"
                    onClick={
                      fetchCandidate
                    }
                    className="mt-4 flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-red-700"
                  >

                    <RefreshCw
                      size={13}
                    />

                    Try again

                  </button>

                </div>

              </div>

            </div>
          )}

          {/* ==================================================
              PROFILE
          ================================================== */}

          {!loading &&
            !error &&
            candidate && (
            <>

              {/* ==================================================
                  PROFILE HEADER
              ================================================== */}

              <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

                {/* COVER */}

                <div className="relative h-40 overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-indigo-700">

                  <div className="absolute -right-20 -top-28 h-72 w-72 rounded-full bg-indigo-400/10 blur-3xl" />

                  <div className="absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl" />

                  <div className="absolute left-6 top-6 sm:left-8">

                    <span className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-indigo-100 backdrop-blur-md">
                      Candidate Intelligence
                    </span>

                  </div>

                  <div className="absolute bottom-0 left-0 right-0 h-px bg-white/10" />

                </div>

                {/* PROFILE INFORMATION */}

                <div className="relative px-6 pb-7 sm:px-8">

                  {/* AVATAR */}

                  <div className="-mt-10">

                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-white bg-indigo-100 text-xl font-bold text-indigo-700 shadow-lg">

                      {getInitials(
                        candidate.name
                      )}

                    </div>

                  </div>

                  {/* NAME + STATUS */}

                  <div className="mt-5 flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">

                    {/* LEFT */}

                    <div className="min-w-0">

                      <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">

                        {candidate.name ||
                          "Unknown Candidate"}

                      </h1>

                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2">

                        <span className="text-xs font-medium text-slate-400">

                          Candidate ID #

                          {candidate.id}

                        </span>

                        <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:block" />

                        <span className="text-xs font-medium text-slate-400">

                          Added{" "}

                          {formatDate(
                            candidate.created_at
                          )}

                        </span>

                      </div>

                    </div>

                    {/* RIGHT - STATUS */}

                    <div className="flex flex-wrap items-center gap-2">

                      <span className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">

                        <span className="h-2 w-2 rounded-full bg-emerald-500" />

                        Parsed successfully

                      </span>

                      <span className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700">

                        <CheckCircle2
                          size={13}
                        />

                        Profile ready

                      </span>

                    </div>

                  </div>

                </div>

              </section>

              {/* ==================================================
                  QUICK STATS
              ================================================== */}

              <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">

                <QuickStat
                  icon={Briefcase}
                  label="Experience"
                  value={
                    candidate.experience ||
                    "Not specified"
                  }
                  iconClass="bg-indigo-50 text-indigo-600"
                />

                <QuickStat
                  icon={Code2}
                  label="Skills detected"
                  value={
                    skills.length
                  }
                  iconClass="bg-violet-50 text-violet-600"
                />

                <QuickStat
                  icon={FileText}
                  label="Resume"
                  value={
                    candidate.resume_filename
                      ? "Available"
                      : "Unavailable"
                  }
                  iconClass="bg-emerald-50 text-emerald-600"
                />

              </section>

              {/* ==================================================
                  MAIN CONTENT
              ================================================== */}

              <section className="mt-6 grid gap-6 xl:grid-cols-[410px_1fr]">

                {/* ==================================================
                    LEFT COLUMN
                ================================================== */}

                <div className="space-y-6">

                  {/* CONTACT */}

                  <ProfileCard
                    title="Contact information"
                    subtitle="Candidate contact details"
                  >

                    <div className="space-y-3">

                      <ContactRow
                        icon={Mail}
                        label="Email"
                        value={
                          candidate.email ||
                          "Not available"
                        }
                        copied={
                          copiedField ===
                          "email"
                        }
                        onCopy={() =>
                          copyToClipboard(
                            candidate.email,
                            "email"
                          )
                        }
                      />

                      <ContactRow
                        icon={Phone}
                        label="Phone"
                        value={
                          candidate.phone ||
                          "Not available"
                        }
                        copied={
                          copiedField ===
                          "phone"
                        }
                        onCopy={() =>
                          copyToClipboard(
                            candidate.phone,
                            "phone"
                          )
                        }
                      />

                    </div>

                  </ProfileCard>

                  {/* EXPERIENCE */}

                  <ProfileCard
                    title="Professional experience"
                    subtitle="Experience detected from resume"
                  >

                    <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-5">

                      <div className="flex items-center gap-4">

                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm">

                          <Briefcase
                            size={21}
                          />

                        </div>

                        <div>

                          <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                            Total experience
                          </p>

                          <p className="mt-1 text-xl font-bold text-slate-900">

                            {candidate.experience ||
                              "Not specified"}

                          </p>

                        </div>

                      </div>

                    </div>

                  </ProfileCard>

                  {/* SKILLS */}

                  <ProfileCard
                    title="Technical skills"
                    subtitle="Skills extracted from the resume"
                  >

                    {skills.length > 0 ? (

                      <div className="flex flex-wrap gap-2">

                        {skills.map(
                          (
                            skill,
                            index
                          ) => (

                            <span
                              key={`${skill}-${index}`}
                              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                            >
                              {skill}
                            </span>

                          )
                        )}

                      </div>

                    ) : (

                      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-5 text-center">

                        <Code2
                          size={22}
                          className="mx-auto text-slate-300"
                        />

                        <p className="mt-2 text-xs font-semibold text-slate-500">
                          No technical skills detected
                        </p>

                      </div>

                    )}

                  </ProfileCard>

                  {/* RECORD */}

                  <ProfileCard
                    title="Record information"
                    subtitle="ResumeIQ database"
                  >

                    <div className="space-y-4">

                      <RecordRow
                        icon={User}
                        label="Candidate ID"
                        value={`#${candidate.id}`}
                      />

                      <RecordRow
                        icon={CalendarDays}
                        label="Created"
                        value={formatDate(
                          candidate.created_at
                        )}
                      />

                      <RecordRow
                        icon={CheckCircle2}
                        label="Processing"
                        value="Successful"
                      />

                    </div>

                  </ProfileCard>

                </div>

                {/* ==================================================
                    RIGHT COLUMN
                ================================================== */}

                <div className="min-w-0">

                  {/* RESUME */}

                  <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                    {/* RESUME HEADER */}

                    <div className="border-b border-slate-200 px-5 py-5">

                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                        <div className="flex min-w-0 items-center gap-3">

                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500">

                            <FileText
                              size={20}
                            />

                          </div>

                          <div className="min-w-0">

                            <div className="flex items-center gap-2">

                              <h2 className="text-sm font-bold text-slate-900">
                                Resume Preview
                              </h2>

                              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-600">
                                PDF
                              </span>

                            </div>

                            <p
                              title={
                                candidate.resume_filename
                              }
                              className="mt-1 truncate text-xs text-slate-400"
                            >

                              {candidate.resume_filename ||
                                "Resume.pdf"}

                            </p>

                          </div>

                        </div>

                        {/* ACTIONS */}

                        <div className="flex gap-2">

                          <button
                            type="button"
                            onClick={
                              openResume
                            }
                            disabled={
                              !candidate.resume_filename ||
                              resumeLoading
                            }
                            className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-[11px] font-semibold text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-40"
                          >

                            <ExternalLink
                              size={14}
                            />

                            Open

                          </button>

                          <button
                            type="button"
                            onClick={
                              downloadResume
                            }
                            disabled={
                              !candidate.resume_filename
                            }
                            className="flex h-9 items-center gap-2 rounded-lg bg-slate-900 px-3 text-[11px] font-semibold text-white transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-40"
                          >

                            <Download
                              size={14}
                            />

                            Download

                          </button>

                        </div>

                      </div>

                    </div>

                    {/* ==================================================
                        PDF PREVIEW
                    ================================================== */}

                    <div className="bg-slate-100 p-3 sm:p-5">

                      {candidate.resume_filename ? (

                        <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

                          {/* FULLSCREEN */}

                          <button
                            type="button"
                            onClick={
                              openResume
                            }
                            title="Open PDF in new tab"
                            disabled={
                              resumeLoading ||
                              !resumePreviewUrl
                            }
                            className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white/95 text-slate-500 shadow-sm backdrop-blur transition hover:bg-indigo-50 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-40"
                          >

                            <Maximize2
                              size={15}
                            />

                          </button>

                          {/* ==================================================
                              LOADING
                          ================================================== */}

                          {resumeLoading && (

                            <div className="flex h-[700px] items-center justify-center bg-white sm:h-[800px]">

                              <div className="text-center">

                                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50">

                                  <RefreshCw
                                    size={25}
                                    className="animate-spin text-indigo-500"
                                  />

                                </div>

                                <p className="mt-4 text-sm font-bold text-slate-700">
                                  Loading resume preview...
                                </p>

                                <p className="mt-1 text-xs text-slate-400">
                                  Connecting to the resume file
                                </p>

                              </div>

                            </div>

                          )}

                          {/* ==================================================
                              RESUME ERROR
                          ================================================== */}

                          {!resumeLoading &&
                            resumeError && (

                            <div className="flex h-[700px] items-center justify-center bg-white px-6 sm:h-[800px]">

                              <div className="max-w-md text-center">

                                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">

                                  <FileText
                                    size={25}
                                  />

                                </div>

                                <h3 className="mt-4 text-sm font-bold text-slate-800">
                                  Unable to load resume
                                </h3>

                                <p className="mt-2 text-xs leading-5 text-slate-500">
                                  {resumeError}
                                </p>

                                <button
                                  type="button"
                                  onClick={
                                    loadResumePreview
                                  }
                                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700"
                                >

                                  <RefreshCw
                                    size={13}
                                  />

                                  Try again

                                </button>

                              </div>

                            </div>

                          )}

                          {/* ==================================================
                              PDF
                          ================================================== */}

                          {!resumeLoading &&
                            !resumeError &&
                            resumePreviewUrl && (

                            <iframe
                              src={
                                resumePreviewUrl
                              }
                              title="Resume PDF Preview"
                              className="h-[700px] w-full border-0 sm:h-[800px]"
                            />

                          )}

                        </div>

                      ) : (

                        <div className="flex h-[500px] items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white">

                          <div className="text-center">

                            <FileText
                              size={35}
                              className="mx-auto text-slate-300"
                            />

                            <p className="mt-3 text-sm font-semibold text-slate-500">
                              Resume unavailable
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              No resume file is associated with this candidate.
                            </p>

                          </div>

                        </div>

                      )}

                    </div>

                    {/* ==================================================
                        RESUME FOOTER
                    ================================================== */}

                    <div className="flex flex-col gap-4 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

                      <div className="flex items-center gap-3">

                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">

                          <FileText
                            size={15}
                            className="text-slate-500"
                          />

                        </div>

                        <div>

                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Original document
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            Uploaded resume PDF
                          </p>

                        </div>

                      </div>

                      <div className="flex items-center gap-4">

                        <button
                          type="button"
                          onClick={
                            openResume
                          }
                          disabled={
                            !resumePreviewUrl
                          }
                          className="flex items-center gap-2 text-xs font-semibold text-indigo-600 transition hover:text-indigo-800 disabled:text-slate-300"
                        >

                          Open in new tab

                          <ExternalLink
                            size={13}
                          />

                        </button>

                        <button
                          type="button"
                          onClick={
                            downloadResume
                          }
                          disabled={
                            !candidate.resume_filename
                          }
                          className="flex items-center gap-2 text-xs font-semibold text-slate-500 transition hover:text-slate-800 disabled:text-slate-300"
                        >

                          Download

                          <Download
                            size={13}
                          />

                        </button>

                      </div>

                    </div>

                  </section>

                  {/* SYSTEM NOTE */}

                  <div className="mt-6 rounded-2xl border border-indigo-100 bg-indigo-50 p-5">

                    <div className="flex items-center gap-2">

                      <Code2
                        size={16}
                        className="text-indigo-600"
                      />

                      <p className="text-xs font-bold text-indigo-700">
                        ResumeIQ parsing
                      </p>

                    </div>

                    <p className="mt-2 text-xs leading-5 text-indigo-600">
                      This candidate profile was automatically generated from the uploaded resume.
                    </p>

                  </div>

                </div>

              </section>

            </>
          )}

        </main>

      </div>

    </div>
  );
}

// ==================================================
// QUICK STAT
// ==================================================

function QuickStat({
  icon: Icon,
  label,
  value,
  iconClass,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

      <div
        className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconClass}`}
      >

        <Icon
          size={18}
        />

      </div>

      <p className="mt-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-1 truncate text-lg font-bold text-slate-900">
        {value}
      </p>

    </div>
  );
}

// ==================================================
// PROFILE CARD
// ==================================================

function ProfileCard({
  title,
  subtitle,
  children,
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

      <div className="mb-5">

        <h2 className="text-base font-bold text-slate-900">
          {title}
        </h2>

        <p className="mt-1 text-xs text-slate-400">
          {subtitle}
        </p>

      </div>

      {children}

    </section>
  );
}

// ==================================================
// CONTACT ROW
// ==================================================

function ContactRow({
  icon: Icon,
  label,
  value,
  copied,
  onCopy,
}) {
  const unavailable =
    !value ||
    value === "Not available";

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

      <div className="flex items-center justify-between gap-3">

        <div className="flex min-w-0 items-center gap-3">

          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-indigo-500 shadow-sm">

            <Icon
              size={15}
            />

          </div>

          <div className="min-w-0">

            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {label}
            </p>

            <p className="mt-1 break-all text-xs font-semibold text-slate-700">
              {value}
            </p>

          </div>

        </div>

        {!unavailable && (

          <button
            type="button"
            onClick={
              onCopy
            }
            title={`Copy ${label}`}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 transition hover:border-indigo-200 hover:text-indigo-600"
          >

            {copied ? (

              <Check
                size={14}
              />

            ) : (

              <Copy
                size={14}
              />

            )}

          </button>

        )}

      </div>

    </div>
  );
}

// ==================================================
// RECORD ROW
// ==================================================

function RecordRow({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="flex items-center justify-between gap-3">

      <div className="flex items-center gap-2">

        <Icon
          size={14}
          className="text-slate-400"
        />

        <span className="text-xs text-slate-400">
          {label}
        </span>

      </div>

      <span className="text-xs font-semibold text-slate-700">
        {value}
      </span>

    </div>
  );
}

// ==================================================
// GET INITIALS
// ==================================================

function getInitials(
  name
) {
  if (!name) {
    return "NA";
  }

  const words =
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean);

  if (
    words.length === 1
  ) {
    return words[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return (
    words[0][0] +
    words[
      words.length - 1
    ][0]
  ).toUpperCase();
}

// ==================================================
// NORMALIZE SKILLS
// ==================================================

function normalizeSkills(
  skills
) {
  if (
    Array.isArray(skills)
  ) {
    return skills.filter(
      Boolean
    );
  }

  if (
    typeof skills ===
    "string"
  ) {
    return skills
      .split(",")
      .map(
        (skill) =>
          skill.trim()
      )
      .filter(Boolean);
  }

  return [];
}

// ==================================================
// FORMAT DATE
// ==================================================

function formatDate(
  dateString
) {
  if (!dateString) {
    return "Not available";
  }

  const date =
    new Date(
      dateString
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return dateString;
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}

export default CandidateProfile;