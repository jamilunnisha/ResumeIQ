import { useEffect, useMemo, useState } from "react";

import {
  BarChart3,
  FileText,
  Users,
  Code2,
  Briefcase,
  RefreshCw,
  TrendingUp,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

import API from "../api";


// ==================================================
// AUTH TOKEN
// ==================================================

const getAuthToken = () => {

  return localStorage.getItem(
    "resumeiq_token"
  );

};


// ==================================================
// AUTH CONFIG
// ==================================================

const getAuthConfig = () => {

  const token =
    getAuthToken();


  if (!token) {

    return {};

  }


  return {
    headers: {
      Authorization:
        `Bearer ${token}`,
    },
  };

};


// ==================================================
// MAIN ANALYTICS
// ==================================================

function Analytics({
  onNavigate,
}) {

  const [candidates, setCandidates] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  // ==================================================
  // FETCH CANDIDATES
  // ==================================================

  const fetchCandidates = async () => {

    try {

      setLoading(true);

      setError("");


      const token =
        getAuthToken();


      if (!token) {

        setError(
          "Authentication required. Please log in again."
        );

        return;

      }


      const response =
        await API.get(
          "/candidates",
          getAuthConfig()
        );


      setCandidates(
        response.data?.candidates ||
        []
      );

    } catch (err) {

      console.error(
        "Analytics fetch error:",
        err
      );


      if (
        err.response?.status === 401
      ) {

        setError(
          "Your session has expired or authentication is missing. Please log in again."
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


  // ==================================================
  // INITIAL LOAD
  // ==================================================

  useEffect(() => {

    fetchCandidates();

  }, []);


  // ==================================================
  // SKILL ANALYSIS
  // ==================================================

  const skillStats = useMemo(() => {

    const counts = {};


    candidates.forEach(
      (candidate) => {

        const skills =
          normalizeSkills(
            candidate.skills
          );


        skills.forEach(
          (skill) => {

            const cleanSkill =
              skill.trim();


            if (!cleanSkill) {

              return;

            }


            const key =
              cleanSkill.toLowerCase();


            if (!counts[key]) {

              counts[key] = {
                name: cleanSkill,
                count: 0,
              };

            }


            counts[key].count += 1;

          }
        );

      }
    );


    return Object.values(counts)
      .sort(
        (a, b) =>
          b.count - a.count
      )
      .slice(0, 8);

  }, [candidates]);


  // ==================================================
  // EXPERIENCE ANALYSIS
  // ==================================================

  const experienceStats =
    useMemo(() => {

      const stats = {

        "0–2 years": 0,

        "3–5 years": 0,

        "6–9 years": 0,

        "10+ years": 0,

        "Not specified": 0,

      };


      candidates.forEach(
        (candidate) => {

          const experience =
            String(
              candidate.experience ||
                ""
            ).toLowerCase();


          const numbers =
            experience.match(
              /\d+(\.\d+)?/g
            );


          if (
            !numbers ||
            numbers.length === 0
          ) {

            stats[
              "Not specified"
            ] += 1;

            return;

          }


          const years =
            Number(
              numbers[0]
            );


          if (years <= 2) {

            stats[
              "0–2 years"
            ] += 1;

          } else if (
            years <= 5
          ) {

            stats[
              "3–5 years"
            ] += 1;

          } else if (
            years <= 9
          ) {

            stats[
              "6–9 years"
            ] += 1;

          } else {

            stats[
              "10+ years"
            ] += 1;

          }

        }
      );


      return Object.entries(
        stats
      ).map(
        ([label, count]) => ({
          label,
          count,
        })
      );

    }, [candidates]);


  // ==================================================
  // TOTAL UNIQUE SKILLS
  // ==================================================

  const totalSkills =
    useMemo(() => {

      const unique =
        new Set();


      candidates.forEach(
        (candidate) => {

          normalizeSkills(
            candidate.skills
          ).forEach(
            (skill) => {

              const clean =
                skill.trim().toLowerCase();


              if (clean) {

                unique.add(
                  clean
                );

              }

            }
          );

        }
      );


      return unique.size;

    }, [candidates]);


  // ==================================================
  // TOTAL PARSED
  // ==================================================

  const totalParsed =
    candidates.length;


  // ==================================================
  // MAX SKILL COUNT
  // ==================================================

  const maxSkillCount =
    skillStats.length > 0
      ? Math.max(
          ...skillStats.map(
            (item) =>
              item.count
          )
        )
      : 1;


  // ==================================================
  // MAX EXPERIENCE COUNT
  // ==================================================

  const maxExperienceCount =
    Math.max(
      ...experienceStats.map(
        (item) =>
          item.count
      ),
      1
    );


  // ==================================================
  // RENDER
  // ==================================================

  return (

    <div className="min-h-screen bg-[#f7f8fc]">


      {/* ==================================================
          SIDEBAR
      ================================================== */}

      <Sidebar
        activePage="analytics"
        onNavigate={onNavigate}
      />


      {/* ==================================================
          MAIN
      ================================================== */}

      <div className="lg:pl-[260px]">


        {/* HEADER */}

        <Header
          title="Analytics"
          subtitle="Recruitment intelligence"
        />


        <main className="mx-auto max-w-[1600px] px-5 py-8 sm:px-7 lg:px-9">


          {/* ==================================================
              INTRO
          ================================================== */}

          <section className="mb-7">

            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">

              <div>

                <div className="mb-2 flex items-center gap-2">

                  <BarChart3
                    size={15}
                    className="text-indigo-500"
                  />


                  <span className="text-xs font-semibold text-indigo-500">

                    Recruitment intelligence

                  </span>

                </div>


                <h1 className="text-3xl font-bold tracking-tight text-slate-900">

                  Recruitment analytics

                </h1>


                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">

                  Understand your candidate pool,
                  technical skills and experience
                  distribution.

                </p>

              </div>


              <button
                type="button"
                onClick={
                  fetchCandidates
                }
                disabled={
                  loading
                }
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

                Refresh analytics

              </button>

            </div>

          </section>


          {/* ==================================================
              ERROR
          ================================================== */}

          {error && (

            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3">

              <p className="text-xs font-bold text-red-700">

                Analytics error

              </p>


              <p className="mt-1 text-xs text-red-600">

                {error}

              </p>


              <button
                type="button"
                onClick={
                  fetchCandidates
                }
                className="mt-3 flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-700"
              >

                <RefreshCw
                  size={13}
                />

                Try again

              </button>

            </div>

          )}


          {/* ==================================================
              TOP STATISTICS
          ================================================== */}

          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

            <MetricCard
              icon={Users}
              label="Total candidates"
              value={
                totalParsed
              }
              description="Candidates in database"
              iconClass="bg-indigo-50 text-indigo-600"
            />


            <MetricCard
              icon={FileText}
              label="Resumes processed"
              value={
                totalParsed
              }
              description="Successfully parsed"
              iconClass="bg-emerald-50 text-emerald-600"
            />


            <MetricCard
              icon={Code2}
              label="Unique skills"
              value={
                totalSkills
              }
              description="Skills detected"
              iconClass="bg-violet-50 text-violet-600"
            />


            <MetricCard
              icon={TrendingUp}
              label="Parsing rate"
              value={
                totalParsed > 0
                  ? "100%"
                  : "0%"
              }
              description="Current prototype rate"
              iconClass="bg-amber-50 text-amber-600"
            />

          </section>


          {/* ==================================================
              CHART AREA
          ================================================== */}

          <section className="mt-6 grid gap-6 xl:grid-cols-2">


            {/* ==================================================
                TOP SKILLS
            ================================================== */}

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

              <div className="flex items-start justify-between">

                <div>

                  <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-500">

                    Technical profile

                  </p>


                  <h2 className="mt-1 text-lg font-bold text-slate-900">

                    Most common skills

                  </h2>


                  <p className="mt-1 text-xs text-slate-400">

                    Skills appearing across candidate resumes

                  </p>

                </div>


                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">

                  <Code2
                    size={19}
                  />

                </div>

              </div>


              <div className="mt-7">

                {loading ? (

                  <ChartLoading />

                ) : skillStats.length === 0 ? (

                  <ChartEmpty
                    message="No skill data available yet."
                  />

                ) : (

                  <div className="space-y-5">

                    {skillStats.map(
                      (
                        skill
                      ) => {

                        const percentage =
                          (
                            skill.count /
                            maxSkillCount
                          ) *
                          100;


                        return (

                          <div
                            key={
                              skill.name
                            }
                          >

                            <div className="mb-2 flex items-center justify-between">

                              <span className="text-xs font-semibold text-slate-600">

                                {
                                  skill.name
                                }

                              </span>


                              <span className="text-[11px] font-bold text-slate-400">

                                {
                                  skill.count
                                }{" "}

                                candidate

                                {skill.count !==
                                1
                                  ? "s"
                                  : ""}

                              </span>

                            </div>


                            <div className="h-2 overflow-hidden rounded-full bg-slate-100">

                              <div
                                className="h-full rounded-full bg-indigo-500 transition-all duration-700"
                                style={{
                                  width:
                                    `${percentage}%`,
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

            </div>


            {/* ==================================================
                EXPERIENCE
            ================================================== */}

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

              <div className="flex items-start justify-between">

                <div>

                  <p className="text-[10px] font-bold uppercase tracking-wider text-violet-500">

                    Candidate seniority

                  </p>


                  <h2 className="mt-1 text-lg font-bold text-slate-900">

                    Experience distribution

                  </h2>


                  <p className="mt-1 text-xs text-slate-400">

                    Candidates grouped by years of experience

                  </p>

                </div>


                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">

                  <Briefcase
                    size={19}
                  />

                </div>

              </div>


              <div className="mt-8">

                {loading ? (

                  <ChartLoading />

                ) : (

                  <div className="flex h-[245px] items-end justify-between gap-3 border-b border-slate-100 px-2">

                    {experienceStats.map(
                      (
                        item
                      ) => {

                        const height =
                          item.count ===
                          0
                            ? 4
                            : Math.max(
                                (
                                  item.count /
                                  maxExperienceCount
                                ) *
                                  100,
                                8
                              );


                        return (

                          <div
                            key={
                              item.label
                            }
                            className="flex h-full flex-1 flex-col items-center justify-end"
                          >

                            <span className="mb-2 text-[11px] font-bold text-slate-500">

                              {
                                item.count
                              }

                            </span>


                            <div className="flex h-[190px] w-full items-end justify-center">

                              <div
                                className="w-full max-w-[55px] rounded-t-xl bg-violet-500 transition-all duration-700"
                                style={{
                                  height:
                                    `${height}%`,
                                }}
                              />

                            </div>


                            <span className="mt-3 text-center text-[9px] font-semibold text-slate-400">

                              {
                                item.label
                              }

                            </span>

                          </div>

                        );

                      }
                    )}

                  </div>

                )}

              </div>

            </div>

          </section>


          {/* ==================================================
              INSIGHTS
          ================================================== */}

          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">

                <TrendingUp
                  size={18}
                />

              </div>


              <div>

                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">

                  Recruitment insights

                </p>


                <h2 className="mt-1 text-lg font-bold text-slate-900">

                  Candidate pool overview

                </h2>

              </div>

            </div>


            <div className="mt-6 grid gap-4 md:grid-cols-3">

              <InsightCard
                title="Strongest skill"
                value={
                  skillStats[0]?.name ||
                  "No data"
                }
                description={
                  skillStats[0]
                    ? `${skillStats[0].count} candidate${
                        skillStats[0].count !==
                        1
                          ? "s"
                          : ""
                      } currently list this skill.`
                    : "Upload resumes to generate insights."
                }
              />


              <InsightCard
                title="Largest experience group"
                value={
                  getLargestGroup(
                    experienceStats
                  )
                }
                description="Largest candidate seniority segment."
              />


              <InsightCard
                title="Skills detected"
                value={
                  totalSkills
                }
                description="Unique technical skills identified."
              />

            </div>

          </section>


          {/* ==================================================
              FOOTER
          ================================================== */}

          <footer className="mt-5 flex flex-col items-center justify-between gap-3 border-t border-slate-200 py-6 sm:flex-row">

            <p className="text-[11px] text-slate-400">

              ResumeIQ • Recruitment Intelligence

            </p>


            <p className="text-[11px] text-slate-400">

              Data powered by PostgreSQL

            </p>

          </footer>

        </main>

      </div>

    </div>

  );

}


// ==================================================
// METRIC CARD
// ==================================================

function MetricCard({
  icon: Icon,
  label,
  value,
  description,
  iconClass,
}) {

  return (

    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

      <div className="flex items-start justify-between">

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}
        >

          <Icon
            size={20}
          />

        </div>

      </div>


      <p className="mt-5 text-[10px] font-bold uppercase tracking-wider text-slate-400">

        {label}

      </p>


      <p className="mt-1 text-3xl font-bold tracking-tight text-slate-900">

        {value}

      </p>


      <p className="mt-2 text-xs text-slate-400">

        {description}

      </p>

    </div>

  );

}


// ==================================================
// INSIGHT CARD
// ==================================================

function InsightCard({
  title,
  value,
  description,
}) {

  return (

    <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">

      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">

        {title}

      </p>


      <p className="mt-2 text-xl font-bold text-slate-900">

        {value}

      </p>


      <p className="mt-1.5 text-xs leading-5 text-slate-400">

        {description}

      </p>

    </div>

  );

}


// ==================================================
// LOADING
// ==================================================

function ChartLoading() {

  return (

    <div className="flex h-[220px] items-center justify-center">

      <RefreshCw
        size={24}
        className="animate-spin text-indigo-500"
      />

    </div>

  );

}


// ==================================================
// EMPTY
// ==================================================

function ChartEmpty({
  message,
}) {

  return (

    <div className="flex h-[220px] items-center justify-center text-center">

      <p className="text-xs text-slate-400">

        {message}

      </p>

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
// LARGEST EXPERIENCE GROUP
// ==================================================

function getLargestGroup(
  groups
) {

  if (
    !groups ||
    groups.length === 0
  ) {

    return "No data";

  }


  const largest =
    groups.reduce(
      (
        current,
        item
      ) =>
        item.count >
        current.count
          ? item
          : current,
      groups[0]
    );


  return largest.count > 0
    ? largest.label
    : "No data";

}


export default Analytics;