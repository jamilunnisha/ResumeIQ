import {
  useEffect,
  useMemo,
  useState,
} from "react";

import API from "../api";

import {
  Search,
  RefreshCw,
  Mail,
  Phone,
  FileText,
  Users,
  SlidersHorizontal,
  X,
  ArrowRight,
  ExternalLink,
  ArrowUpDown,
  BriefcaseBusiness,
  ChevronDown,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";



const STATUS_OPTIONS = [
  "New",
  "Screening",
  "Shortlisted",
  "Interview",
  "Selected",
  "Rejected",
];


// ==================================================
// GET AUTH TOKEN
// ==================================================

function getAuthToken() {

  return (
    localStorage.getItem("resumeiq_token") ||
    localStorage.getItem("resumeiq_access_token") ||
    localStorage.getItem("access_token") ||
    localStorage.getItem("token") ||
    ""
  );

}


// ==================================================
// AUTH HEADERS
// ==================================================

function getAuthHeaders() {

  const token = getAuthToken();

  if (!token) {
    return {};
  }

  return {
    Authorization: `Bearer ${token}`,
  };

}


// ==================================================
// CANDIDATES
// ==================================================

function Candidates({ onNavigate }) {

  const [candidates, setCandidates] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  // ==================================================
  // FILTERS
  // ==================================================

  const [searchTerm, setSearchTerm] =
    useState("");

  const [experienceFilter, setExperienceFilter] =
    useState("all");

  const [skillFilter, setSkillFilter] =
    useState("all");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [sortBy, setSortBy] =
    useState("newest");


  // ==================================================
  // STATUS UPDATE
  // ==================================================

  const [updatingStatusId, setUpdatingStatusId] =
    useState(null);

  const [statusMessage, setStatusMessage] =
    useState("");


  // ==================================================
  // FETCH CANDIDATES
  // ==================================================

  const fetchCandidates = async () => {

    try {

      setLoading(true);

      setError("");


      const token = getAuthToken();


      if (!token) {

        setError(
          "Your login session is missing. Please log in again."
        );

        setCandidates([]);

        return;

      }


      const response =
  await API.get(
    "/candidates",
    {
      headers:
        getAuthHeaders(),
    }
  );


      setCandidates(
        response.data?.candidates || []
      );


    } catch (err) {

      console.error(
        "FETCH CANDIDATES ERROR:",
        err
      );


      if (
        err.response?.status === 401
      ) {

        setError(
          "Your login session has expired. Please log in again."
        );

      } else {

        setError(
          err.response?.data?.detail ||
          "Unable to connect to the ResumeIQ backend."
        );

      }


      setCandidates([]);


    } finally {

      setLoading(false);

    }

  };


  // ==================================================
  // INITIAL LOAD
  // ==================================================

  useEffect(() => {

    fetchCandidates();

  }, []);


  // ==================================================
  // AVAILABLE SKILLS
  // ==================================================

  const availableSkills =
    useMemo(() => {

      const skillSet =
        new Set();


      candidates.forEach(
        (candidate) => {

          const skills =
            normalizeSkills(
              candidate.skills
            );


          skills.forEach(
            (skill) => {

              if (skill) {

                skillSet.add(
                  skill.trim()
                );

              }

            }
          );

        }
      );


      return Array.from(
        skillSet
      ).sort(
        (a, b) =>
          a.localeCompare(b)
      );

    }, [candidates]);


  // ==================================================
  // STATUS COUNTS
  // ==================================================

  const statusCounts =
    useMemo(() => {

      const counts = {

        New: 0,

        Screening: 0,

        Shortlisted: 0,

        Interview: 0,

        Selected: 0,

        Rejected: 0,

      };


      candidates.forEach(
        (candidate) => {

          const status =
            candidate.status ||
            "New";


          if (
            Object.prototype.hasOwnProperty.call(
              counts,
              status
            )
          ) {

            counts[status] += 1;

          } else {

            counts.New += 1;

          }

        }
      );


      return counts;

    }, [candidates]);


  // ==================================================
  // FILTER + SORT
  // ==================================================

  const filteredCandidates =
    useMemo(() => {

      const search =
        searchTerm
          .toLowerCase()
          .trim();


      const filtered =
        candidates.filter(
          (candidate) => {

            const name =
              candidate.name
                ?.toLowerCase() || "";


            const email =
              candidate.email
                ?.toLowerCase() || "";


            const phone =
              candidate.phone
                ?.toLowerCase() || "";


            const experience =
              candidate.experience
                ?.toLowerCase() || "";


            const skills =
              normalizeSkills(
                candidate.skills
              )
                .join(" ")
                .toLowerCase();


            const status =
              (
                candidate.status ||
                "New"
              )
                .toLowerCase();


            const matchesSearch =
              !search ||
              name.includes(search) ||
              email.includes(search) ||
              phone.includes(search) ||
              experience.includes(search) ||
              skills.includes(search) ||
              status.includes(search);


            let matchesExperience =
              true;


            if (
              experienceFilter ===
              "junior"
            ) {

              matchesExperience =
                experience.includes("0") ||
                experience.includes("1") ||
                experience.includes("2");

            }


            if (
              experienceFilter ===
              "mid"
            ) {

              matchesExperience =
                experience.includes("3") ||
                experience.includes("4") ||
                experience.includes("5");

            }


            if (
              experienceFilter ===
              "senior"
            ) {

              matchesExperience =
                experience.includes("6") ||
                experience.includes("7") ||
                experience.includes("8") ||
                experience.includes("9") ||
                experience.includes("10");

            }


            let matchesSkill =
              true;


            if (
              skillFilter !==
              "all"
            ) {

              const candidateSkills =
                normalizeSkills(
                  candidate.skills
                ).map(
                  (skill) =>
                    skill.toLowerCase()
                );


              matchesSkill =
                candidateSkills.includes(
                  skillFilter.toLowerCase()
                );

            }


            const matchesStatus =
              statusFilter ===
              "all" ||
              (
                candidate.status ||
                "New"
              ) === statusFilter;


            return (
              matchesSearch &&
              matchesExperience &&
              matchesSkill &&
              matchesStatus
            );

          }
        );


      // ==================================================
      // SORT
      // ==================================================

      return filtered.sort(
        (a, b) => {

          if (
            sortBy === "name"
          ) {

            return (
              (a.name || "")
                .localeCompare(
                  b.name || ""
                )
            );

          }


          if (
            sortBy === "experience"
          ) {

            return (
              getExperienceNumber(
                b.experience
              ) -
              getExperienceNumber(
                a.experience
              )
            );

          }


          const dateA =
            a.created_at
              ? new Date(
                  a.created_at
                ).getTime()
              : 0;


          const dateB =
            b.created_at
              ? new Date(
                  b.created_at
                ).getTime()
              : 0;


          return dateB - dateA;

        }
      );

    }, [
      candidates,
      searchTerm,
      experienceFilter,
      skillFilter,
      statusFilter,
      sortBy,
    ]);


  // ==================================================
  // CLEAR FILTERS
  // ==================================================

  const clearFilters = () => {

    setSearchTerm("");

    setExperienceFilter(
      "all"
    );

    setSkillFilter(
      "all"
    );

    setStatusFilter(
      "all"
    );

    setSortBy(
      "newest"
    );

  };


  const hasFilters =
    Boolean(searchTerm) ||
    experienceFilter !== "all" ||
    skillFilter !== "all" ||
    statusFilter !== "all";


  // ==================================================
  // OPEN PROFILE
  // ==================================================

  const openProfile = (
    candidateId
  ) => {

    onNavigate(
      "profile",
      candidateId
    );

  };


  // ==================================================
  // OPEN RESUME
  // ==================================================

  const openResume = async (
    filename
  ) => {

    if (!filename) {
      return;
    }


    try {

      const token =
        getAuthToken();


      if (!token) {

        setError(
          "Your login session is missing. Please log in again."
        );

        return;

      }


      // ----------------------------------------------
      // IMPORTANT:
      // The backend now protects /resume/{filename}
      // with JWT authentication.
      //
      // window.open() cannot send Authorization headers,
      // so we fetch the PDF first.
      // ----------------------------------------------

      const response =
  await API.get(
    `/resume/${encodeURIComponent(filename)}`,
    {
      headers:
        getAuthHeaders(),

      responseType:
        "blob",
    }
  );


      const blobUrl =
        URL.createObjectURL(
          response.data
        );


      window.open(
        blobUrl,
        "_blank",
        "noopener,noreferrer"
      );


      setTimeout(
        () => {
          URL.revokeObjectURL(
            blobUrl
          );
        },
        60000
      );


    } catch (err) {

      console.error(
        "OPEN RESUME ERROR:",
        err
      );


      if (
        err.response?.status === 401
      ) {

        setError(
          "Your login session has expired. Please log in again."
        );

      } else {

        setError(
          err.response?.data?.detail ||
          "Unable to open the resume."
        );

      }

    }

  };


  // ==================================================
  // UPDATE STATUS
  // ==================================================

  const updateStatus = async (
    candidateId,
    newStatus
  ) => {

    try {

      setUpdatingStatusId(
        candidateId
      );

      setStatusMessage("");

      setError("");


      const token =
        getAuthToken();


      if (!token) {

        setError(
          "Your login session is missing. Please log in again."
        );

        return;

      }


      const response =
  await API.patch(

    `/candidates/${candidateId}/status`,

    {
      status:
        newStatus,
    },

    {
      headers:
        getAuthHeaders(),
    }

  );


      const updatedCandidate =
        response.data?.candidate;


      setCandidates(
        (previousCandidates) =>
          previousCandidates.map(
            (candidate) => {

              if (
                candidate.id !==
                candidateId
              ) {

                return candidate;

              }


              return {

                ...candidate,

                status:
                  updatedCandidate?.status ||
                  newStatus,

              };

            }
          )
      );


      setStatusMessage(
        `Status changed to ${newStatus}.`
      );


      setTimeout(
        () => {

          setStatusMessage("");

        },
        2500
      );


    } catch (err) {

      console.error(
        "STATUS UPDATE ERROR:",
        err
      );


      if (
        err.response?.status === 401
      ) {

        setError(
          "Your login session has expired. Please log in again."
        );

      } else {

        setError(
          err.response?.data?.detail ||
          "Unable to update candidate status."
        );

      }


    } finally {

      setUpdatingStatusId(
        null
      );

    }

  };


  // ==================================================
  // UI
  // ==================================================

  return (

    <div className="min-h-screen bg-[#f7f8fc]">

      <Sidebar
        activePage="candidates"
        onNavigate={onNavigate}
      />


      <div className="lg:pl-[260px]">

        <Header
          title="Candidates"
          subtitle="Talent management"
          onNavigate={onNavigate}
        />


        <main className="mx-auto max-w-[1600px] px-5 py-7 sm:px-7 lg:px-9">


          {/* ==================================================
              INTRO
          ================================================== */}

          <section className="mb-7">

            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">

              <div>

                <div className="mb-2 flex items-center gap-2">

                  <Users
                    size={15}
                    className="text-indigo-500"
                  />

                  <span className="text-xs font-semibold text-indigo-500">

                    Talent pool

                  </span>

                </div>


                <h1 className="text-3xl font-bold tracking-tight text-slate-900">

                  Candidate database

                </h1>


                <p className="mt-2 text-sm leading-6 text-slate-400">

                  Search, review and manage candidates
                  extracted from uploaded resumes.

                </p>

              </div>


              <button
                type="button"
                onClick={fetchCandidates}
                disabled={loading}
                className="flex h-10 items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:opacity-50 md:self-auto"
              >

                <RefreshCw
                  size={15}
                  className={
                    loading
                      ? "animate-spin"
                      : ""
                  }
                />

                Refresh

              </button>

            </div>

          </section>


          {/* ==================================================
              SUCCESS MESSAGE
          ================================================== */}

          {statusMessage && (

            <div className="mb-6 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">

              <span className="h-2 w-2 rounded-full bg-emerald-500" />

              <p className="text-xs font-semibold text-emerald-700">

                {statusMessage}

              </p>

            </div>

          )}


          {/* ==================================================
              ERROR
          ================================================== */}

          {error && (

            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3">

              <p className="text-xs font-bold text-red-700">

                Connection error

              </p>


              <p className="mt-1 text-xs text-red-600">

                {error}

              </p>

            </div>

          )}


          {/* ==================================================
              SUMMARY
          ================================================== */}

          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

            <SummaryCard
              label="Total candidates"
              value={candidates.length}
              icon={Users}
            />


            <SummaryCard
              label="Screening"
              value={statusCounts.Screening}
              icon={Search}
            />


            <SummaryCard
              label="Interviews"
              value={statusCounts.Interview}
              icon={BriefcaseBusiness}
            />


            <SummaryCard
              label="Selected"
              value={statusCounts.Selected}
              icon={FileText}
            />

          </div>


          {/* ==================================================
              STATUS OVERVIEW
          ================================================== */}

          <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="mb-4">

              <h2 className="text-sm font-bold text-slate-900">

                Recruitment pipeline

              </h2>

              <p className="mt-1 text-xs text-slate-400">

                Current candidate distribution

              </p>

            </div>


            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">

              {STATUS_OPTIONS.map(
                (status) => (

                  <button
                    key={status}
                    type="button"
                    onClick={() =>
                      setStatusFilter(
                        statusFilter === status
                          ? "all"
                          : status
                      )
                    }
                    className={`rounded-xl border p-3 text-left transition ${
                      statusFilter === status
                        ? getStatusOverviewActiveClass(
                            status
                          )
                        : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white"
                    }`}
                  >

                    <div className="flex items-center justify-between">

                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">

                        {status}

                      </span>


                      <span
                        className={`text-lg font-bold ${getStatusTextClass(
                          status
                        )}`}
                      >

                        {statusCounts[status]}

                      </span>

                    </div>

                  </button>

                )
              )}

            </div>

          </section>


          {/* ==================================================
              SEARCH / FILTER
          ================================================== */}

          <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

            <div className="flex flex-col gap-3">


              {/* SEARCH */}

              <div className="flex flex-col gap-3 lg:flex-row">

                <div className="flex h-11 flex-1 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3.5 transition focus-within:border-indigo-300 focus-within:bg-white">

                  <Search
                    size={17}
                    className="text-slate-400"
                  />


                  <input
                    value={searchTerm}
                    onChange={(event) =>
                      setSearchTerm(
                        event.target.value
                      )
                    }
                    placeholder="Search name, email, phone, experience, skills or status..."
                    className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                  />


                  {searchTerm && (

                    <button
                      type="button"
                      onClick={() =>
                        setSearchTerm("")
                      }
                      className="text-slate-400 hover:text-slate-700"
                    >

                      <X size={16} />

                    </button>

                  )}

                </div>


                {/* EXPERIENCE */}

                <div className="relative">

                  <select
                    value={experienceFilter}
                    onChange={(event) =>
                      setExperienceFilter(
                        event.target.value
                      )
                    }
                    className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-10 text-sm font-medium text-slate-600 outline-none transition focus:border-indigo-300 sm:w-52"
                  >

                    <option value="all">
                      All experience
                    </option>

                    <option value="junior">
                      0–2 years
                    </option>

                    <option value="mid">
                      3–5 years
                    </option>

                    <option value="senior">
                      6+ years
                    </option>

                  </select>


                  <SlidersHorizontal
                    size={15}
                    className="pointer-events-none absolute right-3 top-3.5 text-slate-400"
                  />

                </div>

              </div>


              {/* SECOND FILTER ROW */}

              <div className="flex flex-col gap-3 md:flex-row">


                {/* SKILL */}

                <div className="relative flex-1">

                  <select
                    value={skillFilter}
                    onChange={(event) =>
                      setSkillFilter(
                        event.target.value
                      )
                    }
                    className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-10 text-sm font-medium text-slate-600 outline-none transition focus:border-indigo-300"
                  >

                    <option value="all">
                      All skills
                    </option>


                    {availableSkills.map(
                      (skill) => (

                        <option
                          key={skill}
                          value={skill}
                        >

                          {skill}

                        </option>

                      )
                    )}

                  </select>


                  <BriefcaseBusiness
                    size={15}
                    className="pointer-events-none absolute right-3 top-3.5 text-slate-400"
                  />

                </div>


                {/* STATUS */}

                <div className="relative flex-1">

                  <select
                    value={statusFilter}
                    onChange={(event) =>
                      setStatusFilter(
                        event.target.value
                      )
                    }
                    className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-10 text-sm font-medium text-slate-600 outline-none transition focus:border-indigo-300"
                  >

                    <option value="all">
                      All recruitment statuses
                    </option>


                    {STATUS_OPTIONS.map(
                      (status) => (

                        <option
                          key={status}
                          value={status}
                        >

                          {status}

                        </option>

                      )
                    )}

                  </select>


                  <ChevronDown
                    size={15}
                    className="pointer-events-none absolute right-3 top-3.5 text-slate-400"
                  />

                </div>


                {/* SORT */}

                <div className="relative">

                  <select
                    value={sortBy}
                    onChange={(event) =>
                      setSortBy(
                        event.target.value
                      )
                    }
                    className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-10 text-sm font-medium text-slate-600 outline-none transition focus:border-indigo-300 md:w-52"
                  >

                    <option value="newest">
                      Newest first
                    </option>

                    <option value="name">
                      Name A–Z
                    </option>

                    <option value="experience">
                      Most experience
                    </option>

                  </select>


                  <ArrowUpDown
                    size={15}
                    className="pointer-events-none absolute right-3 top-3.5 text-slate-400"
                  />

                </div>


                {/* CLEAR */}

                {hasFilters && (

                  <button
                    type="button"
                    onClick={
                      clearFilters
                    }
                    className="flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-xs font-semibold text-slate-500 transition hover:bg-slate-50"
                  >

                    <X size={15} />

                    Clear

                  </button>

                )}

              </div>

            </div>

          </section>


          {/* ==================================================
              TABLE
          ================================================== */}

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">

              <div>

                <h2 className="text-base font-bold text-slate-900">

                  All candidates

                </h2>


                <p className="mt-1 text-xs text-slate-400">

                  {filteredCandidates.length}{" "}
                  candidate
                  {filteredCandidates.length !== 1
                    ? "s"
                    : ""}{" "}
                  displayed

                </p>

              </div>


              <div className="hidden items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 sm:flex">

                <Users
                  size={14}
                  className="text-slate-400"
                />


                <span className="text-[10px] font-semibold text-slate-500">

                  {candidates.length} total

                </span>

              </div>

            </div>


            {/* LOADING */}

            {loading ? (

              <LoadingState />

            ) : filteredCandidates.length === 0 ? (

              <EmptyState
                hasFilters={
                  hasFilters
                }
                clearFilters={
                  clearFilters
                }
                onNavigate={
                  onNavigate
                }
              />

            ) : (

              <div className="overflow-x-auto">

                <table className="w-full min-w-[1320px]">

                  <thead>

                    <tr className="border-b border-slate-100 bg-slate-50/70">

                      <TableHeader>
                        Candidate
                      </TableHeader>

                      <TableHeader>
                        Experience
                      </TableHeader>

                      <TableHeader>
                        Skills
                      </TableHeader>

                      <TableHeader>
                        Resume
                      </TableHeader>

                      <TableHeader>
                        Contact
                      </TableHeader>

                      <TableHeader>
                        Status
                      </TableHeader>

                      <th className="px-6 py-3.5 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">

                        View

                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {filteredCandidates.map(
                      (candidate) => (

                        <CandidateRow

                          key={
                            candidate.id
                          }

                          candidate={
                            candidate
                          }

                          updatingStatusId={
                            updatingStatusId
                          }

                          onStatusChange={
                            updateStatus
                          }

                          onViewProfile={() =>
                            openProfile(
                              candidate.id
                            )
                          }

                          onOpenResume={() =>
                            openResume(
                              candidate.resume_filename
                            )
                          }

                        />

                      )
                    )}

                  </tbody>

                </table>

              </div>

            )}

          </section>

        </main>

      </div>

    </div>

  );

}


// ==================================================
// TABLE HEADER
// ==================================================

function TableHeader({
  children,
}) {

  return (

    <th className="px-6 py-3.5 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">

      {children}

    </th>

  );

}


// ==================================================
// SUMMARY CARD
// ==================================================

function SummaryCard({
  label,
  value,
  icon: Icon,
}) {

  return (

    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

      <div className="flex items-center justify-between">

        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">

          {label}

        </p>


        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-500">

          <Icon size={15} />

        </div>

      </div>


      <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">

        {value}

      </p>

    </div>

  );

}


// ==================================================
// CANDIDATE ROW
// ==================================================

function CandidateRow({
  candidate,
  updatingStatusId,
  onStatusChange,
  onViewProfile,
  onOpenResume,
}) {

  const skills =
    normalizeSkills(
      candidate.skills
    );


  const currentStatus =
    candidate.status ||
    "New";


  const isUpdating =
    updatingStatusId ===
    candidate.id;


  return (

    <tr className="border-b border-slate-100 transition hover:bg-indigo-50/40">


      {/* CANDIDATE */}

      <td className="px-6 py-5">

        <div className="flex items-center gap-3">

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-xs font-bold text-indigo-600">

            {getInitials(
              candidate.name
            )}

          </div>


          <div className="min-w-0">

            <p className="block max-w-[250px] truncate text-sm font-semibold text-slate-800">

              {candidate.name ||
                "Unknown Candidate"}

            </p>


            <p className="mt-1 truncate text-xs text-slate-400">

              ID #{candidate.id}

            </p>

          </div>

        </div>

      </td>


      {/* EXPERIENCE */}

      <td className="px-6 py-5">

        <span className="text-sm font-medium text-slate-700">

          {candidate.experience ||
            "Not specified"}

        </span>

      </td>


      {/* SKILLS */}

      <td className="px-6 py-5">

        <div className="flex max-w-[320px] flex-wrap gap-1.5">

          {skills
            .slice(0, 5)
            .map(
              (
                skill,
                index
              ) => (

                <span
                  key={`${skill}-${index}`}
                  className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] font-medium text-slate-600"
                >

                  {skill}

                </span>

              )
            )}


          {skills.length === 0 && (

            <span className="text-xs text-slate-400">

              No skills

            </span>

          )}


          {skills.length > 5 && (

            <span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-500">

              +{skills.length - 5}

            </span>

          )}

        </div>

      </td>


      {/* RESUME */}

      <td className="px-6 py-5">

        {candidate.resume_filename ? (

          <button
            type="button"
            onClick={
              onOpenResume
            }
            className="group flex max-w-[210px] items-center gap-2 text-left"
          >

            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 transition group-hover:bg-indigo-50">

              <FileText
                size={15}
                className="text-slate-500 group-hover:text-indigo-500"
              />

            </div>


            <div className="min-w-0">

              <p
                title={
                  candidate.resume_filename
                }
                className="truncate text-xs font-medium text-slate-600 group-hover:text-indigo-600"
              >

                {candidate.resume_filename}

              </p>


              <p className="mt-0.5 flex items-center gap-1 text-[9px] text-slate-400">

                Open PDF

                <ExternalLink
                  size={9}
                />

              </p>

            </div>

          </button>

        ) : (

          <span className="text-xs text-slate-400">

            No resume

          </span>

        )}

      </td>


      {/* CONTACT */}

      <td className="px-6 py-5">

        <div className="space-y-1.5">

          {candidate.email && (

            <div className="flex max-w-[220px] items-center gap-1.5">

              <Mail
                size={12}
                className="shrink-0 text-slate-400"
              />


              <span className="truncate text-xs text-slate-500">

                {candidate.email}

              </span>

            </div>

          )}


          {candidate.phone && (

            <div className="flex items-center gap-1.5">

              <Phone
                size={12}
                className="text-slate-400"
              />


              <span className="text-xs text-slate-500">

                {candidate.phone}

              </span>

            </div>

          )}


          {!candidate.email &&
            !candidate.phone && (

              <span className="text-xs text-slate-400">

                No contact details

              </span>

            )}

        </div>

      </td>


      {/* STATUS */}

      <td className="px-6 py-5">

        <div className="relative">

          <select
            value={currentStatus}
            disabled={isUpdating}
            onChange={(event) =>
              onStatusChange(
                candidate.id,
                event.target.value
              )
            }
            className={`h-9 min-w-[135px] appearance-none rounded-lg border px-3 pr-8 text-xs font-semibold outline-none transition disabled:cursor-wait disabled:opacity-60 ${getStatusSelectClass(
              currentStatus
            )}`}
          >

            {STATUS_OPTIONS.map(
              (status) => (

                <option
                  key={status}
                  value={status}
                >

                  {status}

                </option>

              )
            )}

          </select>


          {isUpdating ? (

            <RefreshCw
              size={13}
              className="pointer-events-none absolute right-2.5 top-3 animate-spin text-slate-500"
            />

          ) : (

            <ChevronDown
              size={13}
              className="pointer-events-none absolute right-2.5 top-3 text-slate-400"
            />

          )}

        </div>

      </td>


      {/* VIEW */}

      <td className="px-6 py-5 text-right">

        <button
          type="button"
          onClick={
            onViewProfile
          }
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[10px] font-semibold text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
        >

          View

          <ArrowRight
            size={13}
          />

        </button>

      </td>

    </tr>

  );

}


// ==================================================
// STATUS TEXT CLASS
// ==================================================

function getStatusTextClass(
  status
) {

  switch (status) {

    case "New":
      return "text-slate-600";

    case "Screening":
      return "text-blue-600";

    case "Shortlisted":
      return "text-violet-600";

    case "Interview":
      return "text-amber-600";

    case "Selected":
      return "text-emerald-600";

    case "Rejected":
      return "text-red-600";

    default:
      return "text-slate-600";

  }

}


// ==================================================
// STATUS SELECT CLASS
// ==================================================

function getStatusSelectClass(
  status
) {

  switch (status) {

    case "New":

      return (
        "border-slate-200 " +
        "bg-slate-50 " +
        "text-slate-700 " +
        "focus:border-slate-300"
      );


    case "Screening":

      return (
        "border-blue-200 " +
        "bg-blue-50 " +
        "text-blue-700 " +
        "focus:border-blue-300"
      );


    case "Shortlisted":

      return (
        "border-violet-200 " +
        "bg-violet-50 " +
        "text-violet-700 " +
        "focus:border-violet-300"
      );


    case "Interview":

      return (
        "border-amber-200 " +
        "bg-amber-50 " +
        "text-amber-700 " +
        "focus:border-amber-300"
      );


    case "Selected":

      return (
        "border-emerald-200 " +
        "bg-emerald-50 " +
        "text-emerald-700 " +
        "focus:border-emerald-300"
      );


    case "Rejected":

      return (
        "border-red-200 " +
        "bg-red-50 " +
        "text-red-700 " +
        "focus:border-red-300"
      );


    default:

      return (
        "border-slate-200 " +
        "bg-slate-50 " +
        "text-slate-700"
      );

  }

}


// ==================================================
// STATUS OVERVIEW ACTIVE CLASS
// ==================================================

function getStatusOverviewActiveClass(
  status
) {

  switch (status) {

    case "New":
      return "border-slate-300 bg-slate-100";

    case "Screening":
      return "border-blue-300 bg-blue-50";

    case "Shortlisted":
      return "border-violet-300 bg-violet-50";

    case "Interview":
      return "border-amber-300 bg-amber-50";

    case "Selected":
      return "border-emerald-300 bg-emerald-50";

    case "Rejected":
      return "border-red-300 bg-red-50";

    default:
      return "border-indigo-300 bg-indigo-50";

  }

}


// ==================================================
// LOADING
// ==================================================

function LoadingState() {

  return (

    <div className="flex min-h-64 flex-col items-center justify-center">

      <RefreshCw
        size={25}
        className="animate-spin text-indigo-500"
      />


      <p className="mt-4 text-sm font-medium text-slate-500">

        Loading candidates...

      </p>


      <p className="mt-1 text-xs text-slate-400">

        Fetching data from PostgreSQL

      </p>

    </div>

  );

}


// ==================================================
// EMPTY STATE
// ==================================================

function EmptyState({
  hasFilters,
  clearFilters,
  onNavigate,
}) {

  return (

    <div className="flex min-h-72 flex-col items-center justify-center px-6 text-center">

      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">

        <Users
          size={24}
          className="text-slate-400"
        />

      </div>


      <h3 className="mt-4 text-sm font-bold text-slate-800">

        No candidates found

      </h3>


      <p className="mt-1.5 max-w-sm text-xs leading-5 text-slate-400">

        {hasFilters
          ? "Try changing your search or filters."
          : "Upload a resume to start building your candidate database."}

      </p>


      {hasFilters ? (

        <button
          type="button"
          onClick={
            clearFilters
          }
          className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white"
        >

          Clear filters

        </button>

      ) : (

        <button
          type="button"
          onClick={() =>
            onNavigate(
              "upload"
            )
          }
          className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700"
        >

          Upload Resume

        </button>

      )}

    </div>

  );

}


// ==================================================
// NORMALIZE SKILLS
// ==================================================

function normalizeSkills(
  skills
) {

  if (
    Array.isArray(
      skills
    )
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
// EXPERIENCE NUMBER
// ==================================================

function getExperienceNumber(
  experience
) {

  if (!experience) {

    return 0;

  }


  const match =
    String(experience).match(
      /\d+(?:\.\d+)?/
    );


  if (!match) {

    return 0;

  }


  return Number(
    match[0]
  );

}


// ==================================================
// INITIALS
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


export default Candidates;