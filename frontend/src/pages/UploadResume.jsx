import { useState } from "react";
import axios from "axios";

import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  LoaderCircle,
  User,
  Mail,
  Phone,
  Briefcase,
  Code2,
  ArrowRight,
  X,
  Database,
  FileSpreadsheet,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";


const API_URL = "http://127.0.0.1:8000";


// ==================================================
// GET AUTH TOKEN
// ==================================================

function getAuthToken() {

  const possibleKeys = [
    "resumeiq_token",
    "access_token",
    "token",
    "resumeiq_access_token",
  ];


  for (const key of possibleKeys) {

    const token =
      localStorage.getItem(key) ||
      sessionStorage.getItem(key);

    if (token) {
      return token;
    }

  }


  // Support JSON user/session objects
  const possibleObjects = [
    "resumeiq_user",
    "resumeiq_session",
    "user",
  ];


  for (const key of possibleObjects) {

    const value =
      localStorage.getItem(key) ||
      sessionStorage.getItem(key);

    if (!value) {
      continue;
    }


    try {

      const parsed = JSON.parse(value);


      if (parsed?.access_token) {
        return parsed.access_token;
      }


      if (parsed?.token) {
        return parsed.token;
      }

    } catch {

      // Ignore invalid JSON

    }

  }


  return null;
}


// ==================================================
// UPLOAD RESUME PAGE
// ==================================================

function UploadResume({ onNavigate }) {

  const [file, setFile] =
    useState(null);

  const [dragging, setDragging] =
    useState(false);

  const [uploading, setUploading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [result, setResult] =
    useState(null);


  // ==================================================
  // SELECT FILE
  // ==================================================

  const selectFile = (selectedFile) => {

    if (!selectedFile) {
      return;
    }


    setError("");
    setResult(null);


    // PDF validation

    if (
      selectedFile.type !== "application/pdf" &&
      !selectedFile.name
        .toLowerCase()
        .endsWith(".pdf")
    ) {

      setError(
        "Only PDF resumes are supported."
      );

      return;

    }


    // File size validation

    if (
      selectedFile.size >
      10 * 1024 * 1024
    ) {

      setError(
        "File size must be less than 10 MB."
      );

      return;

    }


    setFile(selectedFile);

  };


  // ==================================================
  // FILE INPUT
  // ==================================================

  const handleFileChange = (event) => {

    const selectedFile =
      event.target.files?.[0];


    selectFile(selectedFile);


    // Allow selecting the same file again

    event.target.value = "";

  };


  // ==================================================
  // DRAG OVER
  // ==================================================

  const handleDragOver = (event) => {

    event.preventDefault();


    if (!uploading) {
      setDragging(true);
    }

  };


  // ==================================================
  // DRAG LEAVE
  // ==================================================

  const handleDragLeave = () => {

    setDragging(false);

  };


  // ==================================================
  // DROP
  // ==================================================

  const handleDrop = (event) => {

    event.preventDefault();

    setDragging(false);


    if (uploading) {
      return;
    }


    const droppedFile =
      event.dataTransfer.files?.[0];


    selectFile(droppedFile);

  };


  // ==================================================
  // UPLOAD RESUME
  // ==================================================

  const handleUpload = async () => {

    if (!file) {

      setError(
        "Please select a PDF resume first."
      );

      return;

    }


    // ----------------------------------------------
    // GET JWT TOKEN
    // ----------------------------------------------

    const token = getAuthToken();


    if (!token) {

      setError(
        "Authentication required. Please log in again."
      );

      return;

    }


    try {

      setUploading(true);

      setError("");

      setResult(null);


      const formData =
        new FormData();


      formData.append(
        "file",
        file
      );


      // ----------------------------------------------
      // AUTHENTICATED API REQUEST
      // ----------------------------------------------

      const response =
        await axios.post(
          `${API_URL}/upload-resume`,
          formData,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );


      console.log(
        "Resume upload response:",
        response.data
      );


      setResult(
        response.data
      );


    } catch (err) {

      console.error(
        "Resume upload failed:",
        err
      );


      // ----------------------------------------------
      // AUTHENTICATION ERROR
      // ----------------------------------------------

      if (
        err.response?.status === 401
      ) {

        setError(
          "Your session has expired. Please log in again."
        );


        localStorage.removeItem(
          "resumeiq_authenticated"
        );


      } else {

        setError(
          err.response?.data?.detail ||
          "Unable to process the resume. Please try again."
        );

      }


    } finally {

      setUploading(false);

    }

  };


  // ==================================================
  // RESET
  // ==================================================

  const handleReset = () => {

    setFile(null);

    setResult(null);

    setError("");

    setDragging(false);

  };


  // ==================================================
  // EXTRACTED DATA
  // ==================================================

  const data =
    result?.data || {};


  const skills =
    Array.isArray(data.skills)
      ? data.skills
      : [];


  // ==================================================
  // VIEW PROFILE
  // ==================================================

  const handleViewProfile = () => {

    if (!result?.candidate_id) {
      return;
    }


    onNavigate(
      "profile",
      result.candidate_id
    );

  };


  // ==================================================
  // UI
  // ==================================================

  return (

    <div className="min-h-screen bg-[#f7f8fc]">


      {/* ======================================
          SIDEBAR
      ======================================= */}

      <Sidebar
        activePage="upload"
        onNavigate={onNavigate}
      />


      {/* ======================================
          MAIN
      ======================================= */}

      <div className="lg:pl-[260px]">

        <Header
          title="Upload Resume"
          subtitle="Resume ingestion"
        />


        <main className="mx-auto max-w-[1250px] px-5 py-8 sm:px-7 lg:px-9">


          {/* ==================================
              PAGE INTRO
          =================================== */}

          <section className="mb-8">

            <div className="flex items-center gap-2">

              <Sparkles
                size={15}
                className="text-indigo-500"
              />

              <span className="text-xs font-bold uppercase tracking-[0.12em] text-indigo-500">

                Intelligent parsing

              </span>

            </div>


            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">

              Upload candidate resume

            </h1>


            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">

              Upload a PDF resume and ResumeIQ
              will extract candidate information,
              structure the data and store it
              in your recruitment database.

            </p>

          </section>


          {/* ==================================
              ERROR
          =================================== */}

          {error && (

            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4">

              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-red-500">

                <AlertCircle size={18} />

              </div>


              <div className="min-w-0 flex-1">

                <div className="flex items-center justify-between gap-3">

                  <p className="text-sm font-bold text-red-700">

                    Upload error

                  </p>


                  <button
                    type="button"
                    onClick={() =>
                      setError("")
                    }
                    className="text-red-400 transition hover:text-red-700"
                  >

                    <X size={16} />

                  </button>

                </div>


                <p className="mt-1 text-xs leading-5 text-red-600">

                  {error}

                </p>

              </div>

            </div>

          )}


          {/* ==================================
              SUCCESS
          =================================== */}

          {result && (

            <div className="mb-6 overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-sm">

              <div className="flex items-center gap-4 bg-emerald-50 px-5 py-4">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm">

                  <CheckCircle2 size={22} />

                </div>


                <div className="min-w-0 flex-1">

                  <p className="text-sm font-bold text-emerald-700">

                    Resume processed successfully

                  </p>


                  <p className="mt-1 text-xs text-emerald-600">

                    Candidate information has been
                    parsed and stored successfully.

                  </p>

                </div>

              </div>


              <div className="grid grid-cols-1 border-t border-emerald-100 sm:grid-cols-3">

                <SuccessItem
                  icon={Database}
                  label="Database"
                  value="PostgreSQL"
                />


                <SuccessItem
                  icon={FileSpreadsheet}
                  label="Export"
                  value="Excel generated"
                />


                <SuccessItem
                  icon={ShieldCheck}
                  label="Status"
                  value="Successfully parsed"
                />

              </div>

            </div>

          )}


          {/* ==================================
              MAIN GRID
          =================================== */}

          <div className="grid gap-6 lg:grid-cols-[1fr_370px]">


            {/* =================================
                UPLOAD CARD
            ================================== */}

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

              <div className="mb-5 flex items-start justify-between gap-4">

                <div>

                  <h2 className="text-base font-bold text-slate-900">

                    Resume file

                  </h2>


                  <p className="mt-1 text-xs text-slate-400">

                    PDF files only • Maximum size
                    10 MB

                  </p>

                </div>


                <div className="hidden items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 sm:flex">

                  <FileText
                    size={14}
                    className="text-slate-400"
                  />

                  <span className="text-[10px] font-semibold text-slate-500">

                    PDF

                  </span>

                </div>

              </div>


              {/* =================================
                  DROP AREA
              ================================== */}

              <label
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative flex min-h-[380px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed px-6 text-center transition-all ${
                  dragging
                    ? "border-indigo-500 bg-indigo-50"
                    : file
                      ? "border-indigo-200 bg-indigo-50/40"
                      : "border-slate-200 bg-slate-50/60 hover:border-indigo-300 hover:bg-indigo-50/30"
                }`}
              >

                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleFileChange}
                  disabled={uploading}
                  className="hidden"
                />


                {/* BACKGROUND */}

                <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-indigo-100/40 blur-3xl" />

                <div className="pointer-events-none absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-violet-100/30 blur-3xl" />


                {/* ICON */}

                <div
                  className={`relative flex h-20 w-20 items-center justify-center rounded-2xl shadow-sm transition ${
                    dragging
                      ? "bg-indigo-600 text-white"
                      : file
                        ? "bg-indigo-100 text-indigo-600"
                        : "bg-white text-indigo-600"
                  }`}
                >

                  {uploading ? (

                    <LoaderCircle
                      size={34}
                      className="animate-spin"
                    />

                  ) : file ? (

                    <FileText size={34} />

                  ) : (

                    <UploadCloud size={34} />

                  )}

                </div>


                {/* TEXT */}

                {file ? (

                  <>

                    <h3 className="relative mt-6 max-w-[500px] truncate text-sm font-bold text-slate-800">

                      {file.name}

                    </h3>


                    <p className="relative mt-2 text-xs text-slate-400">

                      {(file.size / 1024 / 1024).toFixed(
                        2
                      )}{" "}
                      MB • PDF document

                    </p>


                    {!uploading && !result && (

                      <p className="relative mt-3 text-[11px] font-medium text-indigo-500">

                        Click to choose a different
                        resume

                      </p>

                    )}

                  </>

                ) : (

                  <>

                    <h3 className="relative mt-6 text-sm font-bold text-slate-800">

                      {dragging
                        ? "Drop your resume here"
                        : "Drag & drop your resume"}

                    </h3>


                    <p className="relative mt-2 text-xs text-slate-400">

                      or click anywhere to browse
                      your computer

                    </p>


                    {!uploading && (

                      <span className="relative mt-6 rounded-xl bg-slate-950 px-6 py-3 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-600">

                        Browse Resume

                      </span>

                    )}

                  </>

                )}

              </label>


              {/* =================================
                  SELECTED FILE INFO
              ================================== */}

              {file && !result && (

                <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">

                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-indigo-500 shadow-sm">

                      <FileText size={17} />

                    </div>


                    <div className="min-w-0 flex-1">

                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">

                        Selected file

                      </p>


                      <p
                        title={file.name}
                        className="mt-1 truncate text-xs font-semibold text-slate-700"
                      >

                        {file.name}

                      </p>

                    </div>


                    {!uploading && (

                      <button
                        type="button"
                        onClick={handleReset}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 transition hover:border-red-200 hover:text-red-500"
                        title="Remove file"
                      >

                        <X size={15} />

                      </button>

                    )}

                  </div>

                </div>

              )}


              {/* =================================
                  PROCESS BUTTON
              ================================== */}

              {file && !result && (

                <div className="mt-5 flex flex-col gap-3 sm:flex-row">

                  <button
                    type="button"
                    onClick={handleUpload}
                    disabled={uploading}
                    className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                  >

                    {uploading ? (

                      <>

                        <LoaderCircle
                          size={18}
                          className="animate-spin"
                        />

                        Processing resume...

                      </>

                    ) : (

                      <>

                        Process resume

                        <ArrowRight
                          size={17}
                        />

                      </>

                    )}

                  </button>


                  {!uploading && (

                    <button
                      type="button"
                      onClick={handleReset}
                      className="h-12 rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                    >

                      Remove

                    </button>

                  )}

                </div>

              )}


              {/* =================================
                  PROCESSING STATUS
              ================================== */}

              {uploading && (

                <div className="mt-5 overflow-hidden rounded-xl border border-indigo-100 bg-indigo-50">

                  <div className="flex items-center gap-3 px-4 py-4">

                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-indigo-600">

                      <LoaderCircle
                        size={18}
                        className="animate-spin"
                      />

                    </div>


                    <div>

                      <p className="text-xs font-bold text-indigo-700">

                        Processing resume

                      </p>


                      <p className="mt-0.5 text-[11px] text-indigo-500">

                        Extracting, parsing and
                        storing candidate information...

                      </p>

                    </div>

                  </div>


                  <div className="h-1.5 bg-indigo-100">

                    <div className="h-full w-2/3 animate-pulse rounded-r-full bg-indigo-500" />

                  </div>

                </div>

              )}

            </section>


            {/* =================================
                INFORMATION CARD
            ================================== */}

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">

                  <Sparkles size={19} />

                </div>


                <div>

                  <h2 className="text-sm font-bold text-slate-900">

                    What ResumeIQ extracts

                  </h2>


                  <p className="mt-0.5 text-xs text-slate-400">

                    Structured candidate information

                  </p>

                </div>

              </div>


              <div className="mt-6 space-y-3">

                <InfoItem
                  icon={User}
                  label="Candidate name"
                  description="Identifies the candidate"
                />


                <InfoItem
                  icon={Mail}
                  label="Email address"
                  description="Extracts contact email"
                />


                <InfoItem
                  icon={Phone}
                  label="Phone number"
                  description="Extracts contact number"
                />


                <InfoItem
                  icon={Briefcase}
                  label="Experience"
                  description="Detects professional experience"
                />


                <InfoItem
                  icon={Code2}
                  label="Technical skills"
                  description="Identifies relevant skills"
                />

              </div>


              {/* PIPELINE */}

              <div className="mt-7 border-t border-slate-100 pt-5">

                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">

                  Processing pipeline

                </p>


                <div className="mt-4 space-y-3">

                  <PipelineStep
                    number="01"
                    label="PDF upload"
                    active={!!file}
                  />


                  <PipelineStep
                    number="02"
                    label="Text extraction"
                    active={
                      uploading ||
                      !!result
                    }
                  />


                  <PipelineStep
                    number="03"
                    label="Structured parsing"
                    active={
                      uploading ||
                      !!result
                    }
                  />


                  <PipelineStep
                    number="04"
                    label="PostgreSQL storage"
                    active={!!result}
                  />


                  <PipelineStep
                    number="05"
                    label="Excel export"
                    active={!!result}
                  />

                </div>

              </div>

            </section>

          </div>


          {/* ==================================
              EXTRACTED DATA
          =================================== */}

          {result && (

            <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">


              {/* HEADER */}

              <div className="flex flex-col justify-between gap-4 border-b border-slate-200 px-6 py-6 sm:flex-row sm:items-center">

                <div>

                  <div className="flex items-center gap-2">

                    <CheckCircle2
                      size={17}
                      className="text-emerald-500"
                    />

                    <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-500">

                      Parsed successfully

                    </p>

                  </div>


                  <h2 className="mt-1 text-xl font-bold text-slate-900">

                    Extracted candidate information

                  </h2>


                  <p className="mt-1 text-xs text-slate-400">

                    Candidate ID #
                    {result.candidate_id}

                  </p>

                </div>


                <div className="flex flex-col gap-2 sm:flex-row">

                  <button
                    type="button"
                    onClick={handleViewProfile}
                    className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-indigo-700"
                  >

                    View candidate profile

                    <ArrowRight
                      size={15}
                    />

                  </button>


                  <button
                    type="button"
                    onClick={handleReset}
                    className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                  >

                    Upload another

                  </button>

                </div>

              </div>


              {/* DATA CARDS */}

              <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4">

                <DataCard
                  icon={User}
                  label="Name"
                  value={
                    data.name ||
                    "Not detected"
                  }
                />


                <DataCard
                  icon={Mail}
                  label="Email"
                  value={
                    data.email ||
                    "Not detected"
                  }
                />


                <DataCard
                  icon={Phone}
                  label="Phone"
                  value={
                    data.phone ||
                    "Not detected"
                  }
                />


                <DataCard
                  icon={Briefcase}
                  label="Experience"
                  value={
                    data.experience ||
                    "Not detected"
                  }
                />

              </div>


              {/* SKILLS */}

              <div className="px-6 pb-6">

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">

                  <div className="flex items-center gap-2">

                    <Code2
                      size={17}
                      className="text-indigo-500"
                    />

                    <p className="text-xs font-bold text-slate-700">

                      Detected skills

                    </p>


                    <span className="rounded-full bg-white px-2 py-0.5 text-[9px] font-bold text-slate-400">

                      {skills.length}

                    </span>

                  </div>


                  <div className="mt-4 flex flex-wrap gap-2">

                    {skills.length > 0 ? (

                      skills.map(
                        (skill, index) => (

                          <span
                            key={`${skill}-${index}`}
                            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                          >

                            {skill}

                          </span>

                        )
                      )

                    ) : (

                      <span className="text-xs text-slate-400">

                        No skills detected

                      </span>

                    )}

                  </div>

                </div>

              </div>

            </section>

          )}


          {/* ==================================
              SECURITY NOTE
          =================================== */}

          {!result && (

            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-5">

              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">

                <ShieldCheck size={17} />

              </div>


              <div>

                <p className="text-xs font-bold text-slate-700">

                  Secure resume processing

                </p>


                <p className="mt-1 text-xs leading-5 text-slate-400">

                  Your PDF is processed by the
                  authenticated ResumeIQ backend.
                  Candidate information is stored
                  securely in the recruitment database
                  for your account.

                </p>

              </div>

            </div>

          )}

        </main>

      </div>

    </div>

  );

}


// ==================================================
// SUCCESS ITEM
// ==================================================

function SuccessItem({
  icon: Icon,
  label,
  value,
}) {

  return (

    <div className="flex items-center gap-3 px-5 py-4">

      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-50 text-slate-500">

        <Icon size={15} />

      </div>


      <div>

        <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">

          {label}

        </p>


        <p className="mt-0.5 text-xs font-semibold text-slate-700">

          {value}

        </p>

      </div>

    </div>

  );

}


// ==================================================
// INFORMATION ITEM
// ==================================================

function InfoItem({
  icon: Icon,
  label,
  description,
}) {

  return (

    <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-3.5 py-3">

      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-slate-500 shadow-sm">

        <Icon size={15} />

      </div>


      <div>

        <p className="text-xs font-semibold text-slate-700">

          {label}

        </p>


        <p className="mt-0.5 text-[10px] text-slate-400">

          {description}

        </p>

      </div>

    </div>

  );

}


// ==================================================
// PIPELINE STEP
// ==================================================

function PipelineStep({
  number,
  label,
  active,
}) {

  return (

    <div className="flex items-center gap-3">

      <span
        className={`flex h-7 w-7 items-center justify-center rounded-lg text-[9px] font-bold ${
          active
            ? "bg-indigo-600 text-white"
            : "bg-slate-100 text-slate-400"
        }`}
      >

        {active ? (

          <CheckCircle2 size={13} />

        ) : (

          number

        )}

      </span>


      <span
        className={`text-xs font-medium ${
          active
            ? "text-slate-700"
            : "text-slate-400"
        }`}
      >

        {label}

      </span>

    </div>

  );

}


// ==================================================
// DATA CARD
// ==================================================

function DataCard({
  icon: Icon,
  label,
  value,
}) {

  return (

    <div className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-indigo-100 hover:shadow-sm">

      <div className="flex items-center gap-2">

        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-500">

          <Icon size={15} />

        </div>


        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">

          {label}

        </span>

      </div>


      <p className="mt-3 break-words text-sm font-semibold text-slate-800">

        {value}

      </p>

    </div>

  );

}


export default UploadResume;