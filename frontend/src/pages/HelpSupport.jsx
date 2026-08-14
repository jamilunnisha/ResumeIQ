import { useEffect, useRef, useState } from "react";

import {
  HelpCircle,
  Upload,
  Users,
  BarChart3,
  FileText,
  ChevronDown,
  Mail,
  MessageCircle,
  BookOpen,
  Send,
  Bot,
  User,
  Sparkles,
  Trash2,
  Loader2,
  Eye,
  CheckCircle2,
  XCircle,
  Trophy,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

const API_URL = import.meta.env.VITE_API_URL;

function HelpSupport({ onNavigate }) {

  // ==========================================
  // FAQ STATE
  // ==========================================

  const [openFaq, setOpenFaq] =
    useState(null);


  // ==========================================
  // CHAT STATE
  // ==========================================

  const [messages, setMessages] =
    useState([
      {
        role: "assistant",
        content:
          "Hello! 👋 I'm the ResumeIQ AI Assistant. Ask me anything about uploading resumes, managing candidates, analytics, settings, or finding the best candidates for a role.",
        candidates: [],
      },
    ]);


  const [input, setInput] =
    useState("");

  const [chatLoading, setChatLoading] =
    useState(false);

  const [chatError, setChatError] =
    useState("");

  const messagesEndRef =
    useRef(null);


  // ==========================================
  // AUTO SCROLL
  // ==========================================

  useEffect(() => {

    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });

  }, [
    messages,
    chatLoading,
  ]);


  // ==========================================
  // FAQ DATA
  // ==========================================

  const faqs = [

    {
      question:
        "How do I upload a candidate resume?",

      answer:
        "Open Upload Resume from the sidebar, select a PDF resume or drag it into the upload area, and click Process Resume. ResumeIQ will extract candidate information and store the result.",
    },

    {
      question:
        "Which resume format is supported?",

      answer:
        "The current ResumeIQ prototype supports PDF resumes.",
    },

    {
      question:
        "Where can I see processed candidates?",

      answer:
        "Open Candidates from the sidebar. You can view the candidate list, search candidates and open an individual Candidate Profile.",
    },

    {
      question:
        "Can I view the original resume?",

      answer:
        "Yes. Open a Candidate Profile and use the resume preview or download controls provided there.",
    },

    {
      question:
        "Where can I see recruitment statistics?",

      answer:
        "Open Analytics from the sidebar. It displays candidate totals, detected skills, experience distribution and candidate activity.",
    },

    {
      question:
        "Where is candidate information stored?",

      answer:
        "The current application stores structured candidate information in PostgreSQL and generates an Excel export during resume processing.",
    },

  ];


  // ==========================================
  // SEND MESSAGE
  // ==========================================

  const sendMessage = async () => {

    const trimmedMessage =
      input.trim();


    if (
      !trimmedMessage ||
      chatLoading
    ) {
      return;
    }


    // ------------------------------------------
    // USER MESSAGE
    // ------------------------------------------

    const userMessage = {

      role: "user",

      content:
        trimmedMessage,

    };


    // ------------------------------------------
    // CONVERSATION
    // ------------------------------------------

    const conversation =
      messages.map(
        (message) => ({
          role: message.role,
          content: message.content,
        })
      );


    // ------------------------------------------
    // ADD USER MESSAGE
    // ------------------------------------------

    setMessages(
      (previous) => [
        ...previous,
        userMessage,
      ]
    );


    setInput("");

    setChatLoading(true);

    setChatError("");


    try {

      // ========================================
      // CALL BACKEND
      // ========================================

      // ========================================
      // AUTHENTICATION
      // ========================================
      const token =
        localStorage.getItem("resumeiq_token") ||
        localStorage.getItem("token");

      if (!token) {
        throw new Error(
          "Your session has expired. Please log in again."
        );
      }

      const response =
        await fetch(
          `${API_URL}/chat`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
              Authorization:
                `Bearer ${token}`,
            },

            body: JSON.stringify({
              message:
                trimmedMessage,

              conversation,
            }),
          }
        );


      const data =
        await response.json();


      // ========================================
      // ERROR CHECK
      // ========================================

      if (!response.ok) {

        throw new Error(
          data?.detail ||
            "Unable to get a response from the AI assistant."
        );

      }


      // ========================================
      // ANSWER CHECK
      // ========================================

      if (!data?.answer) {

        throw new Error(
          "The AI assistant returned an empty response."
        );

      }


      // ========================================
      // CANDIDATE RESULTS
      // ========================================

      const candidateResults =
        Array.isArray(
          data?.candidates
        )
          ? data.candidates
          : [];


      // ========================================
      // ADD AI RESPONSE
      // ========================================

      setMessages(
        (previous) => [
          ...previous,

          {
            role: "assistant",

            content:
              data.answer,

            candidates:
              candidateResults,
          },
        ]
      );


    } catch (error) {

      console.error(
        "Chat error:",
        error
      );


      setChatError(
        error.message ||
          "Unable to connect to the AI assistant."
      );


    } finally {

      setChatLoading(false);

    }

  };


  // ==========================================
  // ENTER KEY
  // ==========================================

  const handleKeyDown = (
    event
  ) => {

    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {

      event.preventDefault();

      sendMessage();

    }

  };


  // ==========================================
  // CLEAR CHAT
  // ==========================================

  const clearChat = () => {

    setMessages([
      {
        role: "assistant",

        content:
          "Hello! 👋 I'm the ResumeIQ AI Assistant. Ask me anything about uploading resumes, managing candidates, analytics, settings, or finding the best candidates for a role.",

        candidates: [],
      },
    ]);

    setChatError("");

  };


  // ==========================================
  // QUICK QUESTIONS
  // ==========================================

  const quickQuestions = [

    "How do I upload a resume?",

    "Show me all candidates",

    "Find candidates who know Python",

    "Find the best candidate for a Python developer role",

  ];


  const askQuickQuestion = (
    question
  ) => {

    setInput(
      question
    );


    setTimeout(() => {

      const textarea =
        document.getElementById(
          "resumeiq-chat-input"
        );

      textarea?.focus();

    }, 50);

  };


  // ==========================================
  // FAQ TOGGLE
  // ==========================================

  const toggleFaq = (
    index
  ) => {

    setOpenFaq(
      openFaq === index
        ? null
        : index
    );

  };


  // ==========================================
  // OPEN CANDIDATE PROFILE
  // ==========================================

  const handleViewCandidate = (
    candidate
  ) => {

    // Support both possible backend fields
    const candidateId =
      candidate?.id ??
      candidate?.candidate_id;


    if (
      candidateId === null ||
      candidateId === undefined
    ) {

      console.error(
        "Candidate ID is missing:",
        candidate
      );

      return;

    }


    console.log(
      "Opening candidate profile:",
      candidateId
    );


    if (onNavigate) {

      onNavigate(
        "profile",
        candidateId
      );

    }

  };


  // ==========================================
  // UI
  // ==========================================

  return (

    <div className="min-h-screen bg-[#f7f8fc]">

      {/* ======================================
          SIDEBAR
      ======================================= */}

      <Sidebar
        activePage="help"
        onNavigate={
          onNavigate
        }
      />


      {/* ======================================
          MAIN
      ======================================= */}

      <div className="lg:pl-[260px]">

        <Header
          title="Help & Support"
          subtitle="ResumeIQ assistance"
        />


        <main className="mx-auto max-w-[1200px] px-5 py-8 sm:px-7 lg:px-9">

          {/* ==================================
              PAGE HERO
          =================================== */}

          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-indigo-800 px-6 py-8 shadow-xl sm:px-8">

            <div className="pointer-events-none absolute -right-16 -top-20 h-60 w-60 rounded-full bg-indigo-400/20 blur-3xl" />

            <div className="relative">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-indigo-100">

                <HelpCircle
                  size={22}
                />

              </div>


              <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.15em] text-indigo-200">

                Support center

              </p>


              <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">

                How can we help?

              </h1>


              <p className="mt-3 max-w-2xl text-sm leading-6 text-indigo-100/70">

                Get instant assistance from
                ResumeIQ AI or browse the
                resources below.

              </p>

            </div>

          </section>


          {/* ==================================
              AI CHATBOT
          =================================== */}

          <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            {/* CHAT HEADER */}

            <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-indigo-50/70 to-white px-5 py-4 sm:px-6">

              <div className="flex items-center gap-3">

                <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/20">

                  <Bot
                    size={21}
                  />

                  <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />

                </div>


                <div>

                  <div className="flex items-center gap-2">

                    <h2 className="text-sm font-bold text-slate-900">

                      ResumeIQ AI Assistant

                    </h2>


                    <span className="flex items-center gap-1 rounded-full bg-indigo-100 px-2 py-0.5 text-[9px] font-bold text-indigo-600">

                      <Sparkles
                        size={9}
                      />

                      AI

                    </span>

                  </div>


                  <p className="mt-1 text-[10px] text-slate-400">

                    Powered by your local ResumeIQ AI

                  </p>

                </div>

              </div>


              <button
                type="button"
                onClick={
                  clearChat
                }
                title="Clear conversation"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-red-500"
              >

                <Trash2
                  size={16}
                />

              </button>

            </div>


            {/* CHAT BODY */}

            <div className="h-[430px] overflow-y-auto bg-slate-50/50 px-4 py-5 sm:px-6">

              <div className="mx-auto max-w-3xl space-y-5">

                {messages.map(
                  (
                    message,
                    index
                  ) => {

                    const isUser =
                      message.role ===
                      "user";


                    const candidateResults =
                      Array.isArray(
                        message.candidates
                      )
                        ? message.candidates
                        : [];


                    return (

                      <div
                        key={index}
                        className={`flex gap-3 ${
                          isUser
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >

                        {/* AI ICON */}

                        {!isUser && (

                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">

                            <Bot
                              size={15}
                            />

                          </div>

                        )}


                        {/* MESSAGE + RESULTS */}

                        <div
                          className={`max-w-[90%] rounded-2xl px-4 py-3 ${
                            isUser
                              ? "rounded-br-md bg-indigo-600 text-white"
                              : "rounded-bl-md border border-slate-200 bg-white text-slate-600 shadow-sm"
                          }`}
                        >

                          {/* AI TEXT */}

                          <p
                            className={`whitespace-pre-wrap text-xs leading-6 ${
                              isUser
                                ? "text-white"
                                : "text-slate-600"
                            }`}
                          >

                            {
                              message.content
                            }

                          </p>


                          {/* ==================================
                              CANDIDATE RESULTS
                          =================================== */}

                          {!isUser &&
                            candidateResults.length > 0 && (

                              <div className="mt-4 space-y-3">

                                <div className="flex items-center gap-2">

                                  <Trophy
                                    size={13}
                                    className="text-amber-500"
                                  />

                                  <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-500">

                                    Matching Candidates

                                  </p>

                                </div>


                                {candidateResults.map(
                                  (
                                    candidate,
                                    candidateIndex
                                  ) => (

                                    <CandidateMatchCard
                                      key={
                                        candidate.id ??
                                        candidate.candidate_id ??
                                        candidateIndex
                                      }

                                      candidate={
                                        candidate
                                      }

                                      rank={
                                        candidateIndex + 1
                                      }

                                      onViewProfile={
                                        handleViewCandidate
                                      }

                                    />

                                  )
                                )}

                              </div>

                            )}

                        </div>


                        {/* USER ICON */}

                        {isUser && (

                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-white">

                            <User
                              size={15}
                            />

                          </div>

                        )}

                      </div>

                    );

                  }
                )}


                {/* LOADING */}

                {chatLoading && (

                  <div className="flex items-start gap-3">

                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">

                      <Bot
                        size={15}
                      />

                    </div>


                    <div className="rounded-2xl rounded-bl-md border border-slate-200 bg-white px-4 py-3 shadow-sm">

                      <div className="flex items-center gap-2">

                        <Loader2
                          size={14}
                          className="animate-spin text-indigo-500"
                        />

                        <span className="text-xs text-slate-400">

                          ResumeIQ AI is thinking...

                        </span>

                      </div>

                    </div>

                  </div>

                )}


                <div
                  ref={
                    messagesEndRef
                  }
                />

              </div>

            </div>


            {/* QUICK QUESTIONS */}

            <div className="border-t border-slate-100 bg-white px-4 py-3 sm:px-6">

              <div className="flex gap-2 overflow-x-auto pb-1">

                {quickQuestions.map(
                  (
                    question
                  ) => (

                    <button
                      key={
                        question
                      }
                      type="button"
                      onClick={() =>
                        askQuickQuestion(
                          question
                        )
                      }
                      className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[10px] font-medium text-slate-500 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
                    >

                      {question}

                    </button>

                  )
                )}

              </div>

            </div>


            {/* ERROR */}

            {chatError && (

              <div className="border-t border-red-100 bg-red-50 px-4 py-2.5 sm:px-6">

                <p className="text-[11px] font-medium text-red-600">

                  {chatError}

                </p>

              </div>

            )}


            {/* INPUT */}

            <div className="border-t border-slate-200 bg-white p-4 sm:p-5">

              <div className="mx-auto flex max-w-3xl items-end gap-2 rounded-xl border border-slate-200 bg-slate-50 p-1.5 transition focus-within:border-indigo-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-50">

                <textarea
                  id="resumeiq-chat-input"
                  value={
                    input
                  }
                  onChange={(
                    event
                  ) =>
                    setInput(
                      event.target.value
                    )
                  }
                  onKeyDown={
                    handleKeyDown
                  }
                  rows={1}
                  disabled={
                    chatLoading
                  }
                  placeholder="Ask ResumeIQ anything..."
                  className="max-h-28 min-h-[42px] flex-1 resize-none bg-transparent px-3 py-2.5 text-xs text-slate-700 outline-none placeholder:text-slate-400 disabled:opacity-50"
                />


                <button
                  type="button"
                  onClick={
                    sendMessage
                  }
                  disabled={
                    !input.trim() ||
                    chatLoading
                  }
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-md shadow-indigo-500/20 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
                >

                  {chatLoading ? (

                    <Loader2
                      size={16}
                      className="animate-spin"
                    />

                  ) : (

                    <Send
                      size={16}
                    />

                  )}

                </button>

              </div>


              <p className="mx-auto mt-2 max-w-3xl text-center text-[9px] text-slate-400">

                ResumeIQ AI runs locally through
                Ollama. Avoid entering passwords,
                API keys or other sensitive information.

              </p>

            </div>

          </section>


          {/* ==================================
              QUICK HELP
          =================================== */}

          <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            <HelpCard
              icon={
                Upload
              }
              title="Upload Resume"
              description="Learn how to process a new resume."
              onClick={() =>
                onNavigate(
                  "upload"
                )
              }
            />


            <HelpCard
              icon={
                Users
              }
              title="Candidates"
              description="Manage and review candidate profiles."
              onClick={() =>
                onNavigate(
                  "candidates"
                )
              }
            />


            <HelpCard
              icon={
                BarChart3
              }
              title="Analytics"
              description="Understand your recruitment data."
              onClick={() =>
                onNavigate(
                  "analytics"
                )
              }
            />


            <HelpCard
              icon={
                BookOpen
              }
              title="Getting Started"
              description="Understand the ResumeIQ workflow."
              onClick={() =>
                window.scrollTo({
                  top: 850,
                  behavior:
                    "smooth",
                })
              }
            />

          </section>


          {/* ==================================
              HOW IT WORKS
          =================================== */}

          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">

                <FileText
                  size={18}
                />

              </div>


              <div>

                <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-500">

                  Getting started

                </p>


                <h2 className="mt-1 text-lg font-bold text-slate-900">

                  How ResumeIQ works

                </h2>

              </div>

            </div>


            <div className="mt-7 grid gap-4 md:grid-cols-4">

              <WorkflowStep
                number="01"
                title="Upload"
                description="Upload a candidate PDF resume."
              />


              <WorkflowStep
                number="02"
                title="Parse"
                description="ResumeIQ extracts structured information."
              />


              <WorkflowStep
                number="03"
                title="Store"
                description="Candidate data is stored in PostgreSQL."
              />


              <WorkflowStep
                number="04"
                title="Review"
                description="Review candidates and recruitment analytics."
              />

            </div>

          </section>


          {/* ==================================
              FAQ
          =================================== */}

          <section className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="border-b border-slate-100 p-6">

              <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-500">

                Frequently asked questions

              </p>


              <h2 className="mt-1 text-lg font-bold text-slate-900">

                Common questions

              </h2>


              <p className="mt-1 text-xs text-slate-400">

                Quick answers to common
                ResumeIQ questions.

              </p>

            </div>


            <div>

              {faqs.map(
                (
                  faq,
                  index
                ) => {

                  const isOpen =
                    openFaq ===
                    index;


                  return (

                    <div
                      key={
                        faq.question
                      }
                      className="border-b border-slate-100 last:border-b-0"
                    >

                      <button
                        type="button"
                        onClick={() =>
                          toggleFaq(
                            index
                          )
                        }
                        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition hover:bg-slate-50"
                      >

                        <span className="text-sm font-semibold text-slate-700">

                          {
                            faq.question
                          }

                        </span>


                        <ChevronDown
                          size={17}
                          className={`shrink-0 text-slate-400 transition-transform ${
                            isOpen
                              ? "rotate-180 text-indigo-500"
                              : ""
                          }`}
                        />

                      </button>


                      {isOpen && (

                        <div className="px-6 pb-5">

                          <p className="max-w-3xl text-xs leading-6 text-slate-400">

                            {
                              faq.answer
                            }

                          </p>

                        </div>

                      )}

                    </div>

                  );

                }
              )}

            </div>

          </section>


          {/* ==================================
              SUPPORT
          =================================== */}

          <section className="mt-6 grid gap-4 md:grid-cols-2">

            <SupportCard
              icon={
                Mail
              }
              title="Contact support"
              description="Need help with your ResumeIQ setup or workflow?"
              action="Contact support"
              onClick={() => {

                window.location.href =
                  "mailto:support@resumeiq.local";

              }}
            />


            <SupportCard
              icon={
                MessageCircle
              }
              title="Need technical help?"
              description="Check application settings and verify that the backend is running."
              action="Open Settings"
              onClick={() =>
                onNavigate(
                  "settings"
                )
              }
            />

          </section>


          {/* FOOTER */}

          <footer className="mt-8 border-t border-slate-200 py-6">

            <p className="text-center text-[11px] text-slate-400">

              ResumeIQ • Recruitment Intelligence

            </p>

          </footer>


        </main>

      </div>

    </div>

  );

}


// ==================================================
// CANDIDATE MATCH CARD
// ==================================================

function CandidateMatchCard({
  candidate,
  rank,
  onViewProfile,
}) {

  const score =
    typeof candidate.match_score ===
    "number"
      ? candidate.match_score
      : null;


  const matchedSkills =
    Array.isArray(
      candidate.matched_skills
    )
      ? candidate.matched_skills
      : [];


  const missingSkills =
    Array.isArray(
      candidate.missing_skills
    )
      ? candidate.missing_skills
      : [];


  const reasons =
    Array.isArray(
      candidate.match_reasons
    )
      ? candidate.match_reasons
      : [];


  const isTopCandidate =
    rank === 1 &&
    score !== null;


  return (

    <div
      className={`rounded-xl border p-3 transition ${
        isTopCandidate
          ? "border-amber-200 bg-amber-50/40 shadow-sm"
          : "border-slate-200 bg-slate-50 hover:border-indigo-200 hover:bg-indigo-50/40"
      }`}
    >

      <div className="flex items-start gap-3">

        {/* AVATAR */}

        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
            isTopCandidate
              ? "bg-amber-100 text-amber-700"
              : "bg-indigo-100 text-indigo-600"
          }`}
        >

          {getInitials(
            candidate.name
          )}

        </div>


        {/* DETAILS */}

        <div className="min-w-0 flex-1">

          {/* NAME + SCORE */}

          <div className="flex items-start justify-between gap-2">

            <div className="min-w-0">

              {/* UPDATED */}
              {/* Pass the COMPLETE candidate object */}

              <button
                type="button"
                onClick={() =>
                  onViewProfile(
                    candidate
                  )
                }
                className="block max-w-full truncate text-left text-xs font-bold text-slate-800 transition hover:text-indigo-600"
                title="View candidate profile"
              >

                {candidate.name ||
                  "Unknown Candidate"}

              </button>


              {candidate.email && (

                <p className="mt-1 truncate text-[10px] text-slate-400">

                  {candidate.email}

                </p>

              )}

            </div>


            {/* MATCH SCORE */}

            {score !== null && (

              <div
                className={`shrink-0 rounded-lg px-2 py-1 text-right ${
                  score >= 80
                    ? "bg-emerald-100 text-emerald-700"
                    : score >= 60
                    ? "bg-indigo-100 text-indigo-700"
                    : "bg-slate-100 text-slate-600"
                }`}
              >

                <p className="text-[8px] font-semibold uppercase tracking-wider">

                  Match

                </p>

                <p className="text-sm font-extrabold">

                  {score}%

                </p>

              </div>

            )}

          </div>


          {/* TOP MATCH BADGE */}

          {isTopCandidate && (

            <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-[9px] font-bold text-amber-700">

              <Trophy
                size={10}
              />

              Top Match

            </div>

          )}


          {/* EXPERIENCE */}

          {candidate.experience && (

            <p className="mt-2 text-[10px] text-slate-400">

              <span className="font-semibold text-slate-500">
                Experience:
              </span>{" "}

              {candidate.experience}

            </p>

          )}


          {/* MATCHED SKILLS */}

          {matchedSkills.length > 0 && (

            <div className="mt-3">

              <p className="text-[9px] font-bold uppercase tracking-wider text-emerald-600">

                Matched Skills

              </p>


              <div className="mt-1.5 flex flex-wrap gap-1.5">

                {matchedSkills.map(
                  (
                    skill
                  ) => (

                    <span
                      key={
                        skill
                      }
                      className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[9px] font-medium text-emerald-700"
                    >

                      <CheckCircle2
                        size={9}
                      />

                      {skill}

                    </span>

                  )
                )}

              </div>

            </div>

          )}


          {/* MISSING SKILLS */}

          {missingSkills.length > 0 && (

            <div className="mt-3">

              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">

                Missing Skills

              </p>


              <div className="mt-1.5 flex flex-wrap gap-1.5">

                {missingSkills.map(
                  (
                    skill
                  ) => (

                    <span
                      key={
                        skill
                      }
                      className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-[9px] font-medium text-slate-500"
                    >

                      <XCircle
                        size={9}
                      />

                      {skill}

                    </span>

                  )
                )}

              </div>

            </div>

          )}


          {/* WHY MATCH */}

          {reasons.length > 0 && (

            <div className="mt-3 rounded-lg border border-indigo-100 bg-indigo-50/60 p-2.5">

              <p className="text-[9px] font-bold uppercase tracking-wider text-indigo-500">

                Why this candidate

              </p>


              <ul className="mt-1 space-y-1">

                {reasons.map(
                  (
                    reason,
                    index
                  ) => (

                    <li
                      key={
                        index
                      }
                      className="text-[10px] leading-4 text-slate-500"
                    >

                      • {reason}

                    </li>

                  )
                )}

              </ul>

            </div>

          )}


          {/* EXISTING SKILLS FALLBACK */}

          {!matchedSkills.length &&
            candidate.skills && (

              <p className="mt-2 line-clamp-2 text-[10px] text-slate-400">

                <span className="font-semibold text-slate-500">
                  Skills:
                </span>{" "}

                {Array.isArray(
                  candidate.skills
                )
                  ? candidate.skills.join(
                      ", "
                    )
                  : candidate.skills}

              </p>

            )}


          {/* VIEW PROFILE */}

          <button
            type="button"
            onClick={() =>
              onViewProfile(
                candidate
              )
            }
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-2.5 py-1.5 text-[10px] font-semibold text-white transition hover:bg-indigo-700"
          >

            <Eye
              size={11}
            />

            View Profile

          </button>

        </div>

      </div>

    </div>

  );

}


// ==========================================
// GET INITIALS
// ==========================================

function getInitials(
  name
) {

  if (!name) {

    return "??";

  }


  const parts =
    String(name)
      .trim()
      .split(/\s+/)
      .filter(Boolean);


  if (
    parts.length === 1
  ) {

    return parts[0]
      .slice(0, 2)
      .toUpperCase();

  }


  return (
    parts[0][0] +
    parts[
      parts.length - 1
    ][0]
  ).toUpperCase();

}


// ==========================================
// HELP CARD
// ==========================================

function HelpCard({
  icon: Icon,
  title,
  description,
  onClick,
}) {

  return (

    <button
      type="button"
      onClick={
        onClick
      }
      className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
    >

      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">

        <Icon
          size={18}
        />

      </div>


      <h3 className="mt-4 text-sm font-bold text-slate-800 group-hover:text-indigo-600">

        {title}

      </h3>


      <p className="mt-1.5 text-xs leading-5 text-slate-400">

        {description}

      </p>

    </button>

  );

}


// ==========================================
// WORKFLOW STEP
// ==========================================

function WorkflowStep({
  number,
  title,
  description,
}) {

  return (

    <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">

      <span className="text-[10px] font-bold text-indigo-500">

        {number}

      </span>


      <h3 className="mt-2 text-sm font-bold text-slate-800">

        {title}

      </h3>


      <p className="mt-1.5 text-xs leading-5 text-slate-400">

        {description}

      </p>

    </div>

  );

}


// ==========================================
// SUPPORT CARD
// ==========================================

function SupportCard({
  icon: Icon,
  title,
  description,
  action,
  onClick,
}) {

  return (

    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">

        <Icon
          size={18}
        />

      </div>


      <h3 className="mt-4 text-sm font-bold text-slate-800">

        {title}

      </h3>


      <p className="mt-1.5 text-xs leading-5 text-slate-400">

        {description}

      </p>


      <button
        type="button"
        onClick={
          onClick
        }
        className="mt-4 text-xs font-semibold text-indigo-600 transition hover:text-indigo-800"
      >

        {action} →

      </button>

    </div>

  );

}


export default HelpSupport;