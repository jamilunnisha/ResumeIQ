import {
  useEffect,
  useMemo,
  useState,
} from "react";

import API from "../api";

import {
  Users,
  FileText,
  Code2,
  Upload,
  ArrowRight,
  RefreshCw,
  TrendingUp,
  Clock3,
  CheckCircle2,
  XCircle,
  Server,
  Database,
  Cpu,
  Mail,
  Phone,
  Sparkles,
  UserCheck,
  Activity,
  BarChart3,
  Search,
  Star,
  Video,
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


function Dashboard({ onNavigate }) {

  const [candidates, setCandidates] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [healthLoading, setHealthLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  const [systemStatus, setSystemStatus] =
    useState({
      api: false,
      database: false,
      parser: false,
    });


  // ==========================================
  // FETCH CANDIDATES
  // ==========================================

  const fetchCandidates = async () => {

    try {

      setLoading(true);
      setError("");


      const token =
        localStorage.getItem(
          "resumeiq_token"
        );


      if (!token) {

        setError(
          "Authentication required. Please login again."
        );

        return;

      }


      const response =
        await API.get(
          "/candidates"
        );


      setCandidates(
        response.data?.candidates || []
      );


    } catch (err) {

      console.error(
        "Candidate fetch error:",
        err
      );


      if (
        err.response?.status === 401
      ) {

        setError(
          "Your session has expired. Please login again."
        );

      } else {

        setError(
          err.response?.data?.detail ||
          "Unable to connect to the ResumeIQ backend."
        );

      }


    } finally {

      setLoading(false);

    }

  };


  // ==========================================
  // SYSTEM HEALTH
  // ==========================================

  const checkSystemHealth = async () => {

    try {

      setHealthLoading(true);


      const response =
        await API.get(
          "/health",
          {
            timeout: 5000,
          }
        );


      const healthy =
        response.data?.status ===
        "healthy";


      setSystemStatus({
        api: healthy,
        database: healthy,
        parser: healthy,
      });


    } catch (err) {

      console.error(
        "Health check failed:",
        err
      );


      setSystemStatus({
        api: false,
        database: false,
        parser: false,
      });


    } finally {

      setHealthLoading(false);

    }

  };


  // ==========================================
  // REFRESH
  // ==========================================

  const refreshDashboard = async () => {

    await Promise.all([
      fetchCandidates(),
      checkSystemHealth(),
    ]);

  };


  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {

    refreshDashboard();

  }, []);


  // ==========================================
  // STATUS COUNTS
  // ==========================================

  const statusCounts = useMemo(() => {

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


  // ==========================================
  // UNIQUE SKILLS
  // ==========================================

  const uniqueSkills = useMemo(() => {

    const skills =
      new Set();


    candidates.forEach(
      (candidate) => {

        normalizeSkills(
          candidate.skills
        ).forEach(
          (skill) => {

            if (skill.trim()) {

              skills.add(
                skill
                  .trim()
                  .toLowerCase()
              );

            }

          }
        );

      }
    );


    return skills.size;

  }, [candidates]);


  // ==========================================
  // SKILL ANALYTICS
  // ==========================================

  const skillStats = useMemo(() => {

    const skillMap = {};


    candidates.forEach(
      (candidate) => {

        normalizeSkills(
          candidate.skills
        ).forEach(
          (skill) => {

            const cleaned =
              skill.trim();


            if (!cleaned) {

              return;

            }


            const key =
              cleaned.toLowerCase();


            if (!skillMap[key]) {

              skillMap[key] = {
                name: cleaned,
                count: 0,
              };

            }


            skillMap[key].count += 1;

          }
        );

      }
    );


    return Object.values(
      skillMap
    )
      .sort(
        (a, b) =>
          b.count - a.count
      )
      .slice(0, 6);

  }, [candidates]);


  // ==========================================
  // TOP SKILL
  // ==========================================

  const topSkill =
    skillStats.length > 0
      ? skillStats[0]
      : null;


  // ==========================================
  // RECENT CANDIDATES
  // ==========================================

  const recentCandidates =
    useMemo(() => {

      return [...candidates]
        .sort(
          (a, b) => {

            const dateA =
              new Date(
                a.created_at || 0
              ).getTime();


            const dateB =
              new Date(
                b.created_at || 0
              ).getTime();


            return dateB - dateA;

          }
        )
        .slice(0, 5);

    }, [candidates]);


  // ==========================================
  // TODAY'S UPLOADS
  // ==========================================

  const todayUploads =
    useMemo(() => {

      const today =
        new Date();


      return candidates.filter(
        (candidate) => {

          if (!candidate.created_at) {

            return false;

          }


          const created =
            new Date(
              candidate.created_at
            );


          return (
            created.getDate() ===
              today.getDate() &&
            created.getMonth() ===
              today.getMonth() &&
            created.getFullYear() ===
              today.getFullYear()
          );

        }
      ).length;

    }, [candidates]);


  // ==========================================
  // CONTACTED CANDIDATES
  // ==========================================

  const candidatesWithContact =
    useMemo(() => {

      return candidates.filter(
        (candidate) =>
          Boolean(
            candidate.email ||
            candidate.phone
          )
      ).length;

    }, [candidates]);


  // ==========================================
  // SYSTEM ONLINE
  // ==========================================

  const systemOnline =
    systemStatus.api &&
    systemStatus.database &&
    systemStatus.parser;


  // ==========================================
  // PIPELINE PERCENTAGE
  // ==========================================

  const pipelineTotal =
    candidates.length || 1;


  // ==========================================
  // OPEN STATUS FILTER
  // ==========================================

  const openStatus = (status) => {

    onNavigate(
      "candidates"
    );

  };


  // ==========================================
  // UI
  // ==========================================

  return (

    <div className="min-h-screen bg-[#f7f8fc]">


      <Sidebar
        activePage="dashboard"
        onNavigate={onNavigate}
      />


      <div className="lg:pl-[260px]">

        <Header
          title="Dashboard"
          subtitle="Recruitment overview"
          onNavigate={onNavigate}
        />


        <main className="mx-auto max-w-[1600px] px-5 py-8 sm:px-7 lg:px-9">


          {/* HERO */}

          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-indigo-800 px-6 py-8 shadow-xl sm:px-8 lg:px-10">

            <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />

            <div className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-violet-500/10 blur-3xl" />


            <div className="relative z-10 flex flex-col justify-between gap-7 lg:flex-row lg:items-center">


              <div>

                <div className="mb-3 flex items-center gap-2">

                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10">

                    <TrendingUp
                      size={14}
                      className="text-indigo-200"
                    />

                  </span>


                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-200">

                    Recruitment intelligence

                  </span>

                </div>


                <h1 className="max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">

                  Welcome to ResumeIQ

                </h1>


                <p className="mt-3 max-w-xl text-sm leading-6 text-indigo-100/70">

                  Manage candidate resumes,
                  review extracted profiles and
                  make faster recruitment decisions
                  from one intelligent workspace.

                </p>

              </div>


              <div className="flex flex-col gap-3 sm:flex-row">

                <button
                  type="button"
                  onClick={() =>
                    onNavigate("upload")
                  }
                  className="flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 text-xs font-bold text-slate-900 shadow-lg transition hover:-translate-y-0.5 hover:bg-indigo-50"
                >

                  <Upload size={16} />

                  Upload Resume

                  <ArrowRight size={14} />

                </button>


                <button
                  type="button"
                  onClick={() =>
                    onNavigate("help")
                  }
                  className="flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-5 text-xs font-bold text-white transition hover:bg-white/15"
                >

                  <Sparkles size={16} />

                  AI Assistant

                </button>

              </div>

            </div>

          </section>


          {/* ERROR */}

          {error && (

            <div className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">

              <XCircle
                size={17}
                className="mt-0.5 shrink-0 text-red-500"
              />


              <div>

                <p className="text-xs font-bold text-red-700">

                  Connection error

                </p>


                <p className="mt-1 text-xs text-red-600">

                  {error}

                </p>

              </div>

            </div>

          )}


          {/* MAIN STATISTICS */}

          <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

            <DashboardStat
              icon={Users}
              label="Total candidates"
              value={candidates.length}
              description="Candidates in PostgreSQL"
              iconClass="bg-indigo-50 text-indigo-600"
              loading={loading}
            />


            <DashboardStat
              icon={Search}
              label="Screening"
              value={statusCounts.Screening}
              description="Candidates under review"
              iconClass="bg-blue-50 text-blue-600"
              loading={loading}
            />


            <DashboardStat
              icon={Video}
              label="Interviews"
              value={statusCounts.Interview}
              description="Candidates in interview stage"
              iconClass="bg-amber-50 text-amber-600"
              loading={loading}
            />


            <DashboardStat
              icon={CheckCircle2}
              label="Selected"
              value={statusCounts.Selected}
              description="Successfully selected"
              iconClass="bg-emerald-50 text-emerald-600"
              loading={loading}
            />

          </section>


          {/* RECRUITMENT PIPELINE */}

          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">

              <div>

                <div className="flex items-center gap-2">

                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">

                    <Activity size={17} />

                  </div>


                  <div>

                    <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-500">

                      Recruitment pipeline

                    </p>


                    <h2 className="mt-1 text-lg font-bold text-slate-900">

                      Candidate progress

                    </h2>

                  </div>

                </div>


                <p className="mt-3 text-xs text-slate-400">

                  Track candidates across each recruitment stage.

                </p>

              </div>


              <button
                type="button"
                onClick={() =>
                  onNavigate("candidates")
                }
                className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
              >

                Manage candidates

                <ArrowRight size={13} />

              </button>

            </div>


            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">

              {STATUS_OPTIONS.map(
                (status) => (

                  <button
                    key={status}
                    type="button"
                    onClick={() =>
                      openStatus(status)
                    }
                    className={`rounded-xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-sm ${getStatusCardClass(
                      status
                    )}`}
                  >

                    <div className="flex items-center justify-between">

                      <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">

                        {status}

                      </span>


                      <span className="text-xl font-bold">

                        {
                          statusCounts[
                            status
                          ]
                        }

                      </span>

                    </div>


                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-black/5">

                      <div
                        className="h-full rounded-full bg-current transition-all duration-500"
                        style={{
                          width: `${Math.max(
                            (
                              statusCounts[
                                status
                              ] /
                              pipelineTotal
                            ) *
                              100,
                            statusCounts[
                              status
                            ] > 0
                              ? 5
                              : 0
                          )}%`,
                        }}
                      />

                    </div>

                  </button>

                )
              )}

            </div>

          </section>


          {/* TALENT POOL INSIGHTS */}

          <section className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_1fr]">


            {/* SKILL OVERVIEW */}

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

              <div className="flex items-start justify-between">

                <div>

                  <div className="flex items-center gap-2">

                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">

                      <BarChart3 size={17} />

                    </div>


                    <div>

                      <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-500">

                        Talent pool

                      </p>


                      <h2 className="mt-1 text-lg font-bold text-slate-900">

                        Skill overview

                      </h2>

                    </div>

                  </div>


                  <p className="mt-3 text-xs text-slate-400">

                    Most frequently detected skills
                    across your candidate database.

                  </p>

                </div>


                <button
                  type="button"
                  onClick={() =>
                    onNavigate("analytics")
                  }
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                >

                  Analytics →

                </button>

              </div>


              {loading ? (

                <div className="mt-6 space-y-3">

                  {[1, 2, 3, 4].map(
                    (item) => (

                      <div
                        key={item}
                        className="h-10 animate-pulse rounded-xl bg-slate-100"
                      />

                    )
                  )}

                </div>

              ) : skillStats.length === 0 ? (

                <div className="mt-6 rounded-xl bg-slate-50 px-5 py-8 text-center">

                  <Code2
                    size={24}
                    className="mx-auto text-slate-300"
                  />


                  <p className="mt-3 text-xs font-semibold text-slate-600">

                    No skills available yet.

                  </p>


                  <p className="mt-1 text-[10px] text-slate-400">

                    Upload resumes to build your
                    talent skill database.

                  </p>

                </div>

              ) : (

                <div className="mt-6 space-y-3">

                  {skillStats.map(
                    (skill) => {

                      const percentage =
                        candidates.length > 0
                          ? Math.round(
                              (
                                skill.count /
                                candidates.length
                              ) *
                                100
                            )
                          : 0;


                      return (

                        <div
                          key={skill.name}
                        >

                          <div className="mb-1.5 flex items-center justify-between">

                            <span className="text-xs font-semibold capitalize text-slate-700">

                              {skill.name}

                            </span>


                            <span className="text-[10px] font-medium text-slate-400">

                              {skill.count} candidate
                              {skill.count !== 1
                                ? "s"
                                : ""}

                            </span>

                          </div>


                          <div className="h-2 overflow-hidden rounded-full bg-slate-100">

                            <div
                              className="h-full rounded-full bg-indigo-500 transition-all duration-500"
                              style={{
                                width: `${Math.max(
                                  percentage,
                                  4
                                )}%`,
                              }}
                            />

                          </div>

                        </div>

                      );

                    }
                  )}

                </div>

              )}

            </div>


            {/* RECRUITMENT SNAPSHOT */}

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

              <div className="flex items-center gap-2">

                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">

                  <Activity size={17} />

                </div>


                <div>

                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-500">

                    Recruitment snapshot

                  </p>


                  <h2 className="mt-1 text-lg font-bold text-slate-900">

                    Talent pool health

                  </h2>

                </div>

              </div>


              <div className="mt-6 space-y-3">

                <InsightRow
                  icon={UserCheck}
                  label="Candidates with contact"
                  value={`${candidatesWithContact} / ${candidates.length}`}
                  description={
                    candidates.length
                      ? `${Math.round(
                          (
                            candidatesWithContact /
                            candidates.length
                          ) *
                            100
                        )}% of candidates`
                      : "No candidates yet"
                  }
                />


                <InsightRow
                  icon={TrendingUp}
                  label="Top detected skill"
                  value={
                    topSkill
                      ? topSkill.name
                      : "—"
                  }
                  description={
                    topSkill
                      ? `${topSkill.count} candidate${
                          topSkill.count !== 1
                            ? "s"
                            : ""
                        }`
                      : "Upload resumes to generate insights"
                  }
                />


                <InsightRow
                  icon={Clock3}
                  label="Uploaded today"
                  value={todayUploads}
                  description={
                    todayUploads === 1
                      ? "1 new resume today"
                      : `${todayUploads} new resumes today`
                  }
                />


                <InsightRow
                  icon={Star}
                  label="Shortlisted"
                  value={
                    statusCounts.Shortlisted
                  }
                  description="Candidates progressing"
                />

              </div>


              <div className="mt-5 rounded-xl border border-indigo-100 bg-indigo-50/60 p-4">

                <div className="flex items-start gap-3">

                  <Sparkles
                    size={17}
                    className="mt-0.5 shrink-0 text-indigo-600"
                  />


                  <div>

                    <p className="text-xs font-bold text-indigo-900">

                      ResumeIQ AI

                    </p>


                    <p className="mt-1 text-[10px] leading-5 text-indigo-700">

                      Ask the AI Assistant to help you
                      understand candidates or find
                      suitable profiles.

                    </p>


                    <button
                      type="button"
                      onClick={() =>
                        onNavigate("help")
                      }
                      className="mt-2 text-[10px] font-bold text-indigo-600 hover:text-indigo-800"
                    >

                      Open AI Assistant →

                    </button>

                  </div>

                </div>

              </div>

            </div>

          </section>


          {/* RECENT CANDIDATES */}

          <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_380px]">

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">

                <div>

                  <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-500">

                    Candidate activity

                  </p>


                  <h2 className="mt-1 text-lg font-bold text-slate-900">

                    Recent candidates

                  </h2>


                  <p className="mt-1 text-xs text-slate-400">

                    Latest resumes added to your
                    talent pool

                  </p>

                </div>


                <button
                  type="button"
                  onClick={() =>
                    onNavigate("candidates")
                  }
                  className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 transition hover:text-indigo-800"
                >

                  View all

                  <ArrowRight size={13} />

                </button>

              </div>


              {loading ? (

                <DashboardLoading />

              ) : recentCandidates.length === 0 ? (

                <EmptyCandidates
                  onUpload={() =>
                    onNavigate("upload")
                  }
                />

              ) : (

                <div>

                  {recentCandidates.map(
                    (candidate) => (

                      <RecentCandidate
                        key={
                          candidate.id
                        }
                        candidate={
                          candidate
                        }
                        onClick={() =>
                          onNavigate(
                            "profile",
                            candidate.id
                          )
                        }
                      />

                    )
                  )}

                </div>

              )}

            </div>


            {/* RIGHT COLUMN */}

            <div className="space-y-6">


              {/* QUICK ACTIONS */}

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-500">

                  Workspace

                </p>


                <h2 className="mt-1 text-lg font-bold text-slate-900">

                  Quick actions

                </h2>


                <p className="mt-1 text-xs text-slate-400">

                  Jump directly to your most-used
                  tools.

                </p>


                <div className="mt-5 space-y-3">

                  <QuickAction
                    icon={Upload}
                    title="Upload resume"
                    description="Parse a new candidate"
                    onClick={() =>
                      onNavigate("upload")
                    }
                  />


                  <QuickAction
                    icon={Users}
                    title="Browse candidates"
                    description="Review your talent pool"
                    onClick={() =>
                      onNavigate("candidates")
                    }
                  />


                  <QuickAction
                    icon={TrendingUp}
                    title="View analytics"
                    description="Explore recruitment insights"
                    onClick={() =>
                      onNavigate("analytics")
                    }
                  />


                  <QuickAction
                    icon={Sparkles}
                    title="Ask ResumeIQ AI"
                    description="Get help with recruitment"
                    onClick={() =>
                      onNavigate("help")
                    }
                  />

                </div>

              </div>


              {/* SYSTEM STATUS */}

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                <div className="flex items-center justify-between">

                  <div>

                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">

                      System status

                    </p>


                    <h2 className="mt-1 text-base font-bold text-slate-900">

                      ResumeIQ services

                    </h2>

                  </div>


                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                      systemOnline
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-red-50 text-red-500"
                    }`}
                  >

                    {healthLoading ? (

                      <RefreshCw
                        size={17}
                        className="animate-spin"
                      />

                    ) : systemOnline ? (

                      <CheckCircle2
                        size={18}
                      />

                    ) : (

                      <XCircle
                        size={18}
                      />

                    )}

                  </span>

                </div>


                <div className="mt-5 space-y-3">

                  <StatusRow
                    icon={Server}
                    name="Resume API"
                    status={
                      healthLoading
                        ? "Checking..."
                        : systemStatus.api
                          ? "Online"
                          : "Offline"
                    }
                    online={
                      systemStatus.api
                    }
                    loading={
                      healthLoading
                    }
                  />


                  <StatusRow
                    icon={Database}
                    name="PostgreSQL"
                    status={
                      healthLoading
                        ? "Checking..."
                        : systemStatus.database
                          ? "Connected"
                          : "Unavailable"
                    }
                    online={
                      systemStatus.database
                    }
                    loading={
                      healthLoading
                    }
                  />


                  <StatusRow
                    icon={Cpu}
                    name="Resume parser"
                    status={
                      healthLoading
                        ? "Checking..."
                        : systemStatus.parser
                          ? "Operational"
                          : "Unavailable"
                    }
                    online={
                      systemStatus.parser
                    }
                    loading={
                      healthLoading
                    }
                  />

                </div>


                <div
                  className={`mt-5 rounded-xl border px-4 py-3 ${
                    healthLoading
                      ? "border-slate-200 bg-slate-50"
                      : systemOnline
                        ? "border-emerald-100 bg-emerald-50"
                        : "border-red-100 bg-red-50"
                  }`}
                >

                  <div className="flex items-center gap-2">

                    <span
                      className={`h-2 w-2 rounded-full ${
                        healthLoading
                          ? "bg-slate-400"
                          : systemOnline
                            ? "bg-emerald-500"
                            : "bg-red-500"
                      }`}
                    />


                    <span
                      className={`text-[11px] font-bold ${
                        healthLoading
                          ? "text-slate-500"
                          : systemOnline
                            ? "text-emerald-700"
                            : "text-red-700"
                      }`}
                    >

                      {healthLoading
                        ? "Checking system..."
                        : systemOnline
                          ? "All systems operational"
                          : "System requires attention"}

                    </span>

                  </div>

                </div>

              </div>

            </div>

          </section>


          {/* FOOTER */}

          <footer className="mt-7 flex flex-col items-center justify-between gap-3 border-t border-slate-200 py-6 sm:flex-row">

            <p className="text-[11px] text-slate-400">

              ResumeIQ • Recruitment Intelligence

            </p>


            <button
              type="button"
              onClick={
                refreshDashboard
              }
              disabled={
                loading ||
                healthLoading
              }
              className="flex items-center gap-2 text-[11px] font-semibold text-slate-400 transition hover:text-indigo-600 disabled:opacity-50"
            >

              <RefreshCw
                size={12}
                className={
                  loading ||
                  healthLoading
                    ? "animate-spin"
                    : ""
                }
              />

              Refresh dashboard

            </button>

          </footer>

        </main>

      </div>

    </div>

  );

}


// ==================================================
// DASHBOARD STAT
// ==================================================

function DashboardStat({
  icon: Icon,
  label,
  value,
  description,
  iconClass,
  loading,
}) {

  return (

    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

      <div
        className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}
      >

        <Icon size={20} />

      </div>


      <p className="mt-5 text-[10px] font-bold uppercase tracking-wider text-slate-400">

        {label}

      </p>


      {loading ? (

        <div className="mt-2 h-9 w-20 animate-pulse rounded-lg bg-slate-100" />

      ) : (

        <p className="mt-1 text-3xl font-bold tracking-tight text-slate-900">

          {value}

        </p>

      )}


      <p className="mt-2 text-xs text-slate-400">

        {description}

      </p>

    </div>

  );

}


// ==================================================
// INSIGHT ROW
// ==================================================

function InsightRow({
  icon: Icon,
  label,
  value,
  description,
}) {

  return (

    <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3">

      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-indigo-600 shadow-sm">

        <Icon size={16} />

      </div>


      <div className="min-w-0 flex-1">

        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">

          {label}

        </p>


        <p className="mt-0.5 truncate text-sm font-bold text-slate-800">

          {value}

        </p>

      </div>


      <p className="shrink-0 text-[9px] text-slate-400">

        {description}

      </p>

    </div>

  );

}


// ==================================================
// RECENT CANDIDATE
// ==================================================

function RecentCandidate({
  candidate,
  onClick,
}) {

  const skills =
    normalizeSkills(
      candidate.skills
    );


  const status =
    candidate.status ||
    "New";


  return (

    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-center gap-4 border-b border-slate-100 px-6 py-4 text-left transition last:border-b-0 hover:bg-indigo-50/40"
    >

      {/* AVATAR */}

      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-xs font-bold text-indigo-600">

        {getInitials(
          candidate.name
        )}

      </div>


      {/* DETAILS */}

      <div className="min-w-0 flex-1">

        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">

          <p className="truncate text-sm font-semibold text-slate-800">

            {candidate.name ||
              "Unknown Candidate"}

          </p>


          <span className="shrink-0 text-[10px] text-slate-400">

            {formatDate(
              candidate.created_at
            )}

          </span>

        </div>


        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">

          <span className="text-xs text-slate-400">

            {candidate.experience ||
              "Experience not specified"}

          </span>


          {skills.length > 0 && (

            <>

              <span className="h-1 w-1 rounded-full bg-slate-300" />


              <span className="truncate text-xs text-slate-400">

                {skills
                  .slice(0, 3)
                  .join(" • ")}


                {skills.length > 3
                  ? ` +${
                      skills.length - 3
                    }`
                  : ""}

              </span>

            </>

          )}

        </div>


        {/* CONTACT + STATUS */}

        <div className="mt-2 flex flex-wrap items-center gap-3">

          {candidate.email && (

            <span className="flex min-w-0 items-center gap-1 text-[10px] text-slate-400">

              <Mail size={10} />

              <span className="max-w-[180px] truncate">

                {candidate.email}

              </span>

            </span>

          )}


          {candidate.phone && (

            <span className="flex items-center gap-1 text-[10px] text-slate-400">

              <Phone size={10} />

              {candidate.phone}

            </span>

          )}


          <StatusBadge
            status={status}
          />

        </div>

      </div>


      {/* ARROW */}

      <ArrowRight
        size={16}
        className="shrink-0 text-slate-300 transition group-hover:translate-x-1 group-hover:text-indigo-500"
      />

    </button>

  );

}


// ==================================================
// STATUS BADGE
// ==================================================

function StatusBadge({
  status,
}) {

  return (

    <span
      className={`rounded-full border px-2 py-1 text-[9px] font-bold ${getStatusBadgeClass(
        status
      )}`}
    >

      {status}

    </span>

  );

}


// ==================================================
// QUICK ACTION
// ==================================================

function QuickAction({
  icon: Icon,
  title,
  description,
  onClick,
}) {

  return (

    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-left transition hover:border-indigo-200 hover:bg-indigo-50"
    >

      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm">

        <Icon size={17} />

      </div>


      <div className="min-w-0 flex-1">

        <p className="text-xs font-bold text-slate-700 group-hover:text-indigo-700">

          {title}

        </p>


        <p className="mt-0.5 text-[10px] text-slate-400">

          {description}

        </p>

      </div>


      <ArrowRight
        size={14}
        className="text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-indigo-500"
      />

    </button>

  );

}


// ==================================================
// STATUS ROW
// ==================================================

function StatusRow({
  icon: Icon,
  name,
  status,
  online,
  loading,
}) {

  return (

    <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2.5">

      <div className="flex items-center gap-2">

        <Icon
          size={14}
          className="text-slate-400"
        />


        <span className="text-xs font-medium text-slate-600">

          {name}

        </span>

      </div>


      <div className="flex items-center gap-2">

        <span
          className={`h-2 w-2 rounded-full ${
            loading
              ? "animate-pulse bg-slate-300"
              : online
                ? "bg-emerald-500"
                : "bg-red-500"
          }`}
        />


        <span
          className={`text-[10px] font-semibold ${
            loading
              ? "text-slate-400"
              : online
                ? "text-emerald-600"
                : "text-red-500"
          }`}
        >

          {status}

        </span>

      </div>

    </div>

  );

}


// ==================================================
// LOADING
// ==================================================

function DashboardLoading() {

  return (

    <div className="flex min-h-[300px] flex-col items-center justify-center">

      <RefreshCw
        size={25}
        className="animate-spin text-indigo-500"
      />


      <p className="mt-4 text-sm font-medium text-slate-500">

        Loading dashboard...

      </p>


      <p className="mt-1 text-xs text-slate-400">

        Fetching recruitment data

      </p>

    </div>

  );

}


// ==================================================
// EMPTY CANDIDATES
// ==================================================

function EmptyCandidates({
  onUpload,
}) {

  return (

    <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">

      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">

        <FileText
          size={24}
          className="text-slate-400"
        />

      </div>


      <h3 className="mt-4 text-sm font-bold text-slate-800">

        No candidates yet

      </h3>


      <p className="mt-1.5 max-w-sm text-xs leading-5 text-slate-400">

        Upload your first resume to start
        building your recruitment database.

      </p>


      <button
        type="button"
        onClick={onUpload}
        className="mt-5 flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-indigo-600"
      >

        <Upload size={14} />

        Upload first resume

      </button>

    </div>

  );

}


// ==================================================
// STATUS CARD CLASS
// ==================================================

function getStatusCardClass(
  status
) {

  switch (status) {

    case "New":

      return (
        "border-slate-200 " +
        "bg-slate-50 " +
        "text-slate-700"
      );


    case "Screening":

      return (
        "border-blue-200 " +
        "bg-blue-50 " +
        "text-blue-700"
      );


    case "Shortlisted":

      return (
        "border-violet-200 " +
        "bg-violet-50 " +
        "text-violet-700"
      );


    case "Interview":

      return (
        "border-amber-200 " +
        "bg-amber-50 " +
        "text-amber-700"
      );


    case "Selected":

      return (
        "border-emerald-200 " +
        "bg-emerald-50 " +
        "text-emerald-700"
      );


    case "Rejected":

      return (
        "border-red-200 " +
        "bg-red-50 " +
        "text-red-700"
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
// STATUS BADGE CLASS
// ==================================================

function getStatusBadgeClass(
  status
) {

  switch (status) {

    case "New":

      return (
        "border-slate-200 " +
        "bg-slate-50 " +
        "text-slate-600"
      );


    case "Screening":

      return (
        "border-blue-200 " +
        "bg-blue-50 " +
        "text-blue-700"
      );


    case "Shortlisted":

      return (
        "border-violet-200 " +
        "bg-violet-50 " +
        "text-violet-700"
      );


    case "Interview":

      return (
        "border-amber-200 " +
        "bg-amber-50 " +
        "text-amber-700"
      );


    case "Selected":

      return (
        "border-emerald-200 " +
        "bg-emerald-50 " +
        "text-emerald-700"
      );


    case "Rejected":

      return (
        "border-red-200 " +
        "bg-red-50 " +
        "text-red-700"
      );


    default:

      return (
        "border-slate-200 " +
        "bg-slate-50 " +
        "text-slate-600"
      );

  }

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


// ==================================================
// DATE
// ==================================================

function formatDate(
  dateString
) {

  if (!dateString) {

    return "Recently";

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

    return "Recently";

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


export default Dashboard;