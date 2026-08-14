import {
  Search,
  SlidersHorizontal,
  MoreHorizontal,
  Mail,
  Phone,
  FileText,
  ChevronDown,
  Users,
} from "lucide-react";

function CandidateTable({
  candidates = [],
  searchTerm = "",
  onSearchChange,
  loading = false,
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="border-b border-slate-200 p-6">

        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-indigo-500">
              Talent pool
            </p>

            <h3 className="mt-1 text-xl font-bold tracking-tight text-slate-900">
              Candidates
            </h3>

            <p className="mt-1 text-sm text-slate-400">
              Manage and review candidates parsed from resumes.
            </p>
          </div>


          {/* Search */}

          <div className="flex flex-col gap-2 sm:flex-row">

            <div className="flex h-11 w-full items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3.5 transition focus-within:border-indigo-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-500/5 sm:w-72">

              <Search
                size={17}
                className="shrink-0 text-slate-400"
              />

              <input
                type="text"
                value={searchTerm}
                onChange={(event) =>
                  onSearchChange?.(event.target.value)
                }
                placeholder="Search candidates..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
              />

            </div>


            <button
              type="button"
              className="flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              <SlidersHorizontal size={16} />
              Filters
            </button>

          </div>

        </div>


        {/* Filter chips */}

        <div className="mt-5 flex flex-wrap items-center gap-2">

          <FilterButton label="All candidates" active />

          <FilterButton label="Parsed" />

          <FilterButton label="Shortlisted" />

          <FilterButton label="Review" />

        </div>

      </div>


      {/* =================================================
          TABLE
      ================================================= */}

      {loading ? (

        <LoadingState />

      ) : candidates.length === 0 ? (

        <EmptyState />

      ) : (

        <div className="overflow-x-auto">

          <table className="w-full min-w-[950px]">

            <thead>

              <tr className="border-b border-slate-100 bg-slate-50/60">

                <th className="px-6 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                  Candidate
                </th>

                <th className="px-6 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                  Experience
                </th>

                <th className="px-6 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                  Skills
                </th>

                <th className="px-6 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                  Resume
                </th>

                <th className="px-6 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                  Status
                </th>

                <th className="px-6 py-3.5" />

              </tr>

            </thead>


            <tbody>

              {candidates.map((candidate) => (

                <CandidateRow
                  key={candidate.id}
                  candidate={candidate}
                />

              ))}

            </tbody>

          </table>

        </div>

      )}


      {/* =================================================
          FOOTER
      ================================================= */}

      {!loading && candidates.length > 0 && (

        <div className="flex flex-col gap-3 border-t border-slate-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">

          <p className="text-xs text-slate-400">

            Showing{" "}

            <span className="font-semibold text-slate-700">
              {candidates.length}
            </span>{" "}

            candidate
            {candidates.length !== 1 ? "s" : ""}

          </p>


          <button
            type="button"
            className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
          >
            View all candidates

            <ChevronDown
              size={14}
              className="-rotate-90"
            />

          </button>

        </div>

      )}

    </section>
  );
}


/* =====================================================
   CANDIDATE ROW
===================================================== */

function CandidateRow({ candidate }) {

  const skills = normalizeSkills(candidate.skills);

  const initials = getInitials(candidate.name);

  return (
    <tr className="group border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50/70">

      {/* Candidate */}

      <td className="px-6 py-5">

        <div className="flex items-center gap-3.5">

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-xs font-bold text-indigo-600 ring-1 ring-indigo-100">
            {initials}
          </div>


          <div className="min-w-0">

            <p className="truncate text-sm font-semibold text-slate-800">
              {candidate.name || "Unknown Candidate"}
            </p>


            <div className="mt-1 flex items-center gap-3">

              {candidate.email && (
                <span className="flex max-w-[210px] items-center gap-1 truncate text-[11px] text-slate-400">

                  <Mail size={11} />

                  {candidate.email}

                </span>
              )}

            </div>


            {candidate.phone && (

              <span className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-400">

                <Phone size={10} />

                {candidate.phone}

              </span>

            )}

          </div>

        </div>

      </td>


      {/* Experience */}

      <td className="px-6 py-5">

        <span className="text-sm font-medium text-slate-700">

          {candidate.experience || "Not specified"}

        </span>

      </td>


      {/* Skills */}

      <td className="px-6 py-5">

        <div className="flex max-w-[350px] flex-wrap gap-1.5">

          {skills.length > 0 ? (

            skills.slice(0, 4).map((skill, index) => (

              <span
                key={`${skill}-${index}`}
                className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] font-medium text-slate-600"
              >
                {skill}
              </span>

            ))

          ) : (

            <span className="text-xs text-slate-400">
              No skills detected
            </span>

          )}


          {skills.length > 4 && (

            <span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-500">

              +{skills.length - 4}

            </span>

          )}

        </div>

      </td>


      {/* Resume */}

      <td className="px-6 py-5">

        <div className="flex max-w-[190px] items-center gap-2">

          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">

            <FileText size={15} />

          </div>


          <span
            title={candidate.resume_filename}
            className="truncate text-xs font-medium text-slate-600"
          >
            {candidate.resume_filename || "Resume.pdf"}
          </span>

        </div>

      </td>


      {/* Status */}

      <td className="px-6 py-5">

        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700">

          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

          Parsed

        </span>

      </td>


      {/* Actions */}

      <td className="px-6 py-5">

        <button
          type="button"
          className="rounded-lg p-2 text-slate-400 opacity-0 transition hover:bg-white hover:text-slate-700 group-hover:opacity-100"
          title="More options"
        >

          <MoreHorizontal size={18} />

        </button>

      </td>

    </tr>
  );
}


/* =====================================================
   FILTER BUTTON
===================================================== */

function FilterButton({
  label,
  active = false,
}) {
  return (
    <button
      type="button"
      className={`rounded-lg px-3 py-1.5 text-[11px] font-semibold transition ${
        active
          ? "bg-slate-900 text-white"
          : "bg-slate-50 text-slate-500 hover:bg-slate-100"
      }`}
    >
      {label}
    </button>
  );
}


/* =====================================================
   LOADING
===================================================== */

function LoadingState() {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center">

      <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-500" />

      <p className="mt-4 text-sm font-medium text-slate-500">
        Loading candidates...
      </p>

      <p className="mt-1 text-xs text-slate-400">
        Fetching data from PostgreSQL
      </p>

    </div>
  );
}


/* =====================================================
   EMPTY
===================================================== */

function EmptyState() {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">

      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">

        <Users
          size={23}
          className="text-slate-400"
        />

      </div>


      <h4 className="mt-4 text-sm font-semibold text-slate-800">
        No candidates found
      </h4>


      <p className="mt-1.5 max-w-sm text-xs leading-5 text-slate-400">
        Upload a resume to start building your candidate database.
      </p>

    </div>
  );
}


/* =====================================================
   NORMALIZE SKILLS
===================================================== */

function normalizeSkills(skills) {

  if (Array.isArray(skills)) {
    return skills.filter(Boolean);
  }

  if (typeof skills === "string") {

    return skills
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);

  }

  return [];
}


/* =====================================================
   INITIALS
===================================================== */

function getInitials(name) {

  if (!name) {
    return "NA";
  }

  const words = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 1) {

    return words[0]
      .slice(0, 2)
      .toUpperCase();

  }

  return (
    words[0][0] +
    words[words.length - 1][0]
  ).toUpperCase();
}


export default CandidateTable;