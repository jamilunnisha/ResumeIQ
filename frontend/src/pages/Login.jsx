import { useState } from "react";

import {
  FileText,
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  ShieldCheck,
  AlertCircle,
  User,
  UserPlus,
} from "lucide-react";


const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000";


function Login({ onLogin }) {

  // ==========================================
  // MODE
  // ==========================================

  const [isRegistering, setIsRegistering] =
    useState(false);


  // ==========================================
  // FORM DATA
  // ==========================================

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");


  // ==========================================
  // UI STATE
  // ==========================================

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);


  // ==========================================
  // SWITCH MODE
  // ==========================================

  const switchMode = (
    registerMode
  ) => {

    setIsRegistering(
      registerMode
    );

    setName("");

    setEmail("");

    setPassword("");

    setConfirmPassword("");

    setError("");

    setShowPassword(false);

    setShowConfirmPassword(false);

  };


  // ==========================================
  // LOGIN
  // ==========================================

  const handleLogin = async () => {

    const cleanEmail =
      email.trim().toLowerCase();


    // ----------------------------------------
    // VALIDATION
    // ----------------------------------------

    if (!cleanEmail) {

      setError(
        "Please enter your email address."
      );

      return;

    }


    if (!password) {

      setError(
        "Please enter your password."
      );

      return;

    }


    setLoading(true);

    setError("");


    try {

      // ======================================
      // LOGIN API
      // ======================================

      const response =
        await fetch(
          `${API_BASE_URL}/auth/login`,
          {

            method: "POST",

            headers: {

              "Content-Type":
                "application/json",

            },

            body:
              JSON.stringify({

                email:
                  cleanEmail,

                password:
                  password,

              }),

          }
        );


      let data = null;


      try {

        data =
          await response.json();

      } catch {

        data = null;

      }


      // ======================================
      // ERROR
      // ======================================

      if (!response.ok) {

        setError(

          data?.detail ||

          "Invalid email or password."

        );

        return;

      }


      // ======================================
      // SAVE AUTH DATA
      // ======================================

      localStorage.setItem(

        "resumeiq_authenticated",

        "true"

      );


      if (data?.token) {

        localStorage.setItem(

          "resumeiq_token",

          data.token

        );

      }


      if (data?.user) {

        localStorage.setItem(

          "resumeiq_user",

          JSON.stringify(
            data.user
          )

        );


        localStorage.setItem(

          "resumeiq_admin_profile",

          JSON.stringify({

            name:
              data.user.name,

            email:
              data.user.email,

            role:
              data.user.role,

          })

        );

      }


      // ======================================
      // LOGIN COMPLETE
      // ======================================

      if (onLogin) {

        onLogin(
          data.user
        );

      }

    } catch (error) {

      console.error(
        "Login error:",
        error
      );


      setError(

        "Unable to connect to the ResumeIQ server. Please make sure the backend is running."

      );

    } finally {

      setLoading(false);

    }

  };


  // ==========================================
  // REGISTER
  // ==========================================

  const handleRegister = async () => {

    const cleanName =
      name.trim();

    const cleanEmail =
      email.trim().toLowerCase();


    // ----------------------------------------
    // VALIDATION
    // ----------------------------------------

    if (!cleanName) {

      setError(
        "Please enter your full name."
      );

      return;

    }


    if (cleanName.length < 2) {

      setError(
        "Name must contain at least 2 characters."
      );

      return;

    }


    if (!cleanEmail) {

      setError(
        "Please enter your email address."
      );

      return;

    }


    if (!cleanEmail.includes("@")) {

      setError(
        "Please enter a valid email address."
      );

      return;

    }


    if (!password) {

      setError(
        "Please enter a password."
      );

      return;

    }


    if (password.length < 8) {

      setError(
        "Password must contain at least 8 characters."
      );

      return;

    }


    if (!confirmPassword) {

      setError(
        "Please confirm your password."
      );

      return;

    }


    if (
      password !==
      confirmPassword
    ) {

      setError(
        "Passwords do not match."
      );

      return;

    }


    setLoading(true);

    setError("");


    try {

      // ======================================
      // REGISTER API
      // ======================================

      const response =
        await fetch(
          `${API_BASE_URL}/auth/register`,
          {

            method: "POST",

            headers: {

              "Content-Type":
                "application/json",

            },

            body:
              JSON.stringify({

                name:
                  cleanName,

                email:
                  cleanEmail,

                password:
                  password,

                confirm_password:
                  confirmPassword,

              }),

          }
        );


      let data = null;


      try {

        data =
          await response.json();

      } catch {

        data = null;

      }


      // ======================================
      // ERROR
      // ======================================

      if (!response.ok) {

        setError(

          data?.detail ||

          "Unable to create your account."

        );

        return;

      }


      // ======================================
      // SAVE AUTH DATA
      // ======================================

      localStorage.setItem(

        "resumeiq_authenticated",

        "true"

      );


      if (data?.token) {

        localStorage.setItem(

          "resumeiq_token",

          data.token

        );

      }


      if (data?.user) {

        localStorage.setItem(

          "resumeiq_user",

          JSON.stringify(
            data.user
          )

        );


        localStorage.setItem(

          "resumeiq_admin_profile",

          JSON.stringify({

            name:
              data.user.name,

            email:
              data.user.email,

            role:
              data.user.role,

          })

        );

      }


      // ======================================
      // LOGIN AFTER REGISTRATION
      // ======================================

      if (onLogin) {

        onLogin(
          data.user
        );

      }

    } catch (error) {

      console.error(
        "Registration error:",
        error
      );


      setError(

        "Unable to connect to the ResumeIQ server. Please make sure the backend is running."

      );

    } finally {

      setLoading(false);

    }

  };


  // ==========================================
  // FORM SUBMIT
  // ==========================================

  const handleSubmit = (
    event
  ) => {

    event.preventDefault();


    if (loading) {

      return;

    }


    if (isRegistering) {

      handleRegister();

    } else {

      handleLogin();

    }

  };


  // ==========================================
  // RENDER
  // ==========================================

  return (

    <div className="min-h-screen bg-slate-950">


      {/* ======================================
          BACKGROUND
      ======================================= */}

      <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-10">


        <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl" />


        <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-violet-600/15 blur-3xl" />


        {/* ====================================
            LOGIN CARD
        ===================================== */}

        <div className="relative z-10 w-full max-w-[430px]">


          {/* ==================================
              BRAND
          =================================== */}

          <div className="mb-7 text-center">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500 text-white shadow-xl shadow-indigo-500/20">

              <FileText
                size={27}
                strokeWidth={2.5}
              />

            </div>


            <h1 className="mt-5 text-2xl font-bold tracking-tight text-white">

              ResumeIQ

            </h1>


            <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">

              Talent Intelligence

            </p>

          </div>


          {/* ==================================
              CARD
          =================================== */}

          <div className="rounded-3xl border border-slate-800 bg-slate-900/95 p-7 shadow-2xl shadow-black/30 sm:p-8">


            {/* =================================
                TITLE
            ================================== */}

            <div className="mb-7">

              <h2 className="text-xl font-bold text-white">

                {isRegistering
                  ? "Create your account"
                  : "Welcome back"}

              </h2>


              <p className="mt-2 text-sm leading-5 text-slate-400">

                {isRegistering
                  ? "Create your ResumeIQ recruitment account."
                  : "Sign in to access your ResumeIQ recruitment workspace."}

              </p>

            </div>


            {/* =================================
                ERROR
            ================================== */}

            {error && (

              <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">

                <AlertCircle
                  size={16}
                  className="mt-0.5 shrink-0 text-red-400"
                />


                <p className="text-xs leading-5 text-red-300">

                  {error}

                </p>

              </div>

            )}


            {/* =================================
                FORM
            ================================== */}

            <form
              onSubmit={
                handleSubmit
              }
              className="space-y-5"
            >


              {/* ===============================
                  NAME
              ================================ */}

              {isRegistering && (

                <div>

                  <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-slate-400">

                    Full name

                  </label>


                  <div className="relative">

                    <User
                      size={16}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                    />


                    <input
                      type="text"
                      value={name}
                      onChange={(
                        event
                      ) => {

                        setName(
                          event.target.value
                        );

                        setError("");

                      }}
                      placeholder="Enter your full name"
                      autoComplete="name"
                      className="h-12 w-full rounded-xl border border-slate-700 bg-slate-800/70 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500 focus:bg-slate-800 focus:ring-4 focus:ring-indigo-500/10"
                    />

                  </div>

                </div>

              )}


              {/* ===============================
                  EMAIL
              ================================ */}

              <div>

                <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-slate-400">

                  Email address

                </label>


                <div className="relative">

                  <Mail
                    size={16}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                  />


                  <input
                    type="email"
                    value={email}
                    onChange={(
                      event
                    ) => {

                      setEmail(
                        event.target.value
                      );

                      setError("");

                    }}
                    placeholder="you@example.com"
                    autoComplete="email"
                    className="h-12 w-full rounded-xl border border-slate-700 bg-slate-800/70 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500 focus:bg-slate-800 focus:ring-4 focus:ring-indigo-500/10"
                  />

                </div>

              </div>


              {/* ===============================
                  PASSWORD
              ================================ */}

              <div>

                <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-slate-400">

                  Password

                </label>


                <div className="relative">

                  <Lock
                    size={16}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                  />


                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={password}
                    onChange={(
                      event
                    ) => {

                      setPassword(
                        event.target.value
                      );

                      setError("");

                    }}
                    placeholder={
                      isRegistering
                        ? "Minimum 8 characters"
                        : "Enter your password"
                    }
                    autoComplete={
                      isRegistering
                        ? "new-password"
                        : "current-password"
                    }
                    className="h-12 w-full rounded-xl border border-slate-700 bg-slate-800/70 pl-11 pr-12 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500 focus:bg-slate-800 focus:ring-4 focus:ring-indigo-500/10"
                  />


                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (
                          previous
                        ) =>
                          !previous
                      )
                    }
                    className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-700 hover:text-slate-300"
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >

                    {showPassword ? (

                      <EyeOff
                        size={16}
                      />

                    ) : (

                      <Eye
                        size={16}
                      />

                    )}

                  </button>

                </div>

              </div>


              {/* ===============================
                  CONFIRM PASSWORD
              ================================ */}

              {isRegistering && (

                <div>

                  <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-slate-400">

                    Confirm password

                  </label>


                  <div className="relative">

                    <Lock
                      size={16}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                    />


                    <input
                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }
                      value={
                        confirmPassword
                      }
                      onChange={(
                        event
                      ) => {

                        setConfirmPassword(
                          event.target.value
                        );

                        setError("");

                      }}
                      placeholder="Re-enter your password"
                      autoComplete="new-password"
                      className="h-12 w-full rounded-xl border border-slate-700 bg-slate-800/70 pl-11 pr-12 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500 focus:bg-slate-800 focus:ring-4 focus:ring-indigo-500/10"
                    />


                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(
                          (
                            previous
                          ) =>
                            !previous
                        )
                      }
                      className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-700 hover:text-slate-300"
                      aria-label={
                        showConfirmPassword
                          ? "Hide password"
                          : "Show password"
                      }
                    >

                      {showConfirmPassword ? (

                        <EyeOff
                          size={16}
                        />

                      ) : (

                        <Eye
                          size={16}
                        />

                      )}

                    </button>

                  </div>

                </div>

              )}


              {/* ===============================
                  SUBMIT
              ================================ */}

              <button
                type="submit"
                disabled={loading}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-indigo-500 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
              >

                {loading ? (

                  <>

                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                    {isRegistering
                      ? "Creating account..."
                      : "Signing in..."}

                  </>

                ) : (

                  <>

                    {isRegistering ? (

                      <UserPlus
                        size={16}
                      />

                    ) : (

                      <LogIn
                        size={16}
                      />

                    )}

                    {isRegistering
                      ? "Create Account"
                      : "Sign In"}

                  </>

                )}

              </button>

            </form>


            {/* =================================
                SWITCH LOGIN / REGISTER
            ================================== */}

            <div className="mt-6 border-t border-slate-800 pt-5 text-center">

              <p className="text-xs text-slate-500">

                {isRegistering
                  ? "Already have an account?"
                  : "Don't have a ResumeIQ account?"}

              </p>


              <button
                type="button"
                onClick={() =>
                  switchMode(
                    !isRegistering
                  )
                }
                disabled={loading}
                className="mt-2 text-xs font-bold text-indigo-400 transition hover:text-indigo-300 disabled:cursor-not-allowed disabled:opacity-50"
              >

                {isRegistering
                  ? "Sign in instead"
                  : "Create an account"}

              </button>

            </div>


            {/* =================================
                SECURITY
            ================================== */}

            <div className="mt-6 flex items-center justify-center gap-2 border-t border-slate-800 pt-5">

              <ShieldCheck
                size={13}
                className="text-emerald-500"
              />


              <p className="text-[10px] text-slate-500">

                Secure ResumeIQ account access

              </p>

            </div>


            {/* =================================
                PROTOTYPE NOTE
            ================================== */}

            <div className="mt-5 rounded-xl border border-amber-500/10 bg-amber-500/5 px-4 py-3">

              <p className="text-center text-[10px] leading-4 text-amber-400/70">

                New accounts are created as
                Recruiter accounts.

              </p>

            </div>

          </div>


          {/* ==================================
              FOOTER
          =================================== */}

          <p className="mt-6 text-center text-[10px] text-slate-600">

            ResumeIQ R&D • Prototype v1.0

          </p>

        </div>

      </div>

    </div>

  );

}


export default Login;