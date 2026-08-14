import { useState } from "react";

import Dashboard from "./pages/Dashboard";
import Candidates from "./pages/Candidates";
import UploadResume from "./pages/UploadResume";
import Analytics from "./pages/Analytics";
import CandidateProfile from "./pages/CandidateProfile";
import AdminProfile from "./pages/AdminProfile";
import Settings from "./pages/Settings";
import HelpSupport from "./pages/HelpSupport";
import Login from "./pages/Login";


const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000";


function App() {

  // ==========================================
  // AUTHENTICATION
  // ==========================================

  const [authenticated, setAuthenticated] =
    useState(() => {

      return (
        localStorage.getItem(
          "resumeiq_token"
        ) !== null
      );

    });


  // ==========================================
  // CURRENT USER
  // ==========================================

  const [currentUser, setCurrentUser] =
    useState(() => {

      try {

        const savedUser =
          localStorage.getItem(
            "resumeiq_user"
          );

        return savedUser
          ? JSON.parse(savedUser)
          : null;

      } catch {

        return null;

      }

    });


  // ==========================================
  // CURRENT PAGE
  // ==========================================

  const [currentPage, setCurrentPage] =
    useState("dashboard");


  // ==========================================
  // SELECTED CANDIDATE
  // ==========================================

  const [selectedCandidateId, setSelectedCandidateId] =
    useState(null);


  // ==========================================
  // LOGIN
  // ==========================================

  const handleLogin = (user) => {

    setAuthenticated(true);

    setCurrentUser(user || null);

    setCurrentPage("dashboard");

  };


  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = () => {

    localStorage.removeItem(
      "resumeiq_token"
    );

    localStorage.removeItem(
      "resumeiq_authenticated"
    );

    localStorage.removeItem(
      "resumeiq_user"
    );


    setAuthenticated(false);

    setCurrentUser(null);

    setCurrentPage("dashboard");

    setSelectedCandidateId(null);

  };


  // ==========================================
  // NAVIGATION
  // ==========================================

  const handleNavigate = (
    page,
    candidateId = null
  ) => {

    // ------------------------------------------
    // LOGOUT
    // ------------------------------------------

    if (page === "logout") {

      handleLogout();

      return;

    }


    // ------------------------------------------
    // ADMIN PROFILE
    // ------------------------------------------

    if (
      page === "admin-profile"
    ) {

      setCurrentPage(
        "admin-profile"
      );

      return;

    }


    // ------------------------------------------
    // NORMAL PAGE
    // ------------------------------------------

    setCurrentPage(page);


    // ------------------------------------------
    // SELECTED CANDIDATE
    // ------------------------------------------

    if (
      candidateId !== null &&
      candidateId !== undefined
    ) {

      setSelectedCandidateId(
        candidateId
      );

    }

  };


  // ==========================================
  // CHECK AUTHENTICATION
  // ==========================================

  const verifyAuthentication = async () => {

    const token =
      localStorage.getItem(
        "resumeiq_token"
      );


    if (!token) {

      return false;

    }


    try {

      const response = await fetch(
        `${API_BASE_URL}/auth/me`,
        {

          method: "GET",

          headers: {

            Authorization:
              `Bearer ${token}`,

          },

        }
      );


      if (!response.ok) {

        return false;

      }


      const data =
        await response.json();


      if (
        data.user
      ) {

        localStorage.setItem(

          "resumeiq_user",

          JSON.stringify(
            data.user
          )

        );

        setCurrentUser(
          data.user
        );

      }


      return true;


    } catch (error) {

      console.error(
        "AUTH CHECK ERROR:",
        error
      );

      return false;

    }

  };


  // ==========================================
  // LOGIN SCREEN
  // ==========================================

  if (!authenticated) {

    return (
      <Login
        onLogin={handleLogin}
      />
    );

  }


  // ==========================================
  // PAGE ROUTING
  // ==========================================

  switch (currentPage) {


    // ========================================
    // DASHBOARD
    // ========================================

    case "dashboard":

      return (
        <Dashboard
          onNavigate={
            handleNavigate
          }
        />
      );


    // ========================================
    // CANDIDATES
    // ========================================

    case "candidates":

      return (
        <Candidates
          onNavigate={
            handleNavigate
          }
        />
      );


    // ========================================
    // UPLOAD
    // ========================================

    case "upload":

      return (
        <UploadResume
          onNavigate={
            handleNavigate
          }
        />
      );


    // ========================================
    // ANALYTICS
    // ========================================

    case "analytics":

      return (
        <Analytics
          onNavigate={
            handleNavigate
          }
        />
      );


    // ========================================
    // CANDIDATE PROFILE
    // ========================================

    case "profile":

      return (
        <CandidateProfile
          candidateId={
            selectedCandidateId
          }

          onNavigate={
            handleNavigate
          }
        />
      );


    // ========================================
    // ADMIN PROFILE
    // ========================================

    case "admin-profile":

      return (
        <AdminProfile
          onNavigate={
            handleNavigate
          }
        />
      );


    // ========================================
    // SETTINGS
    // ========================================

    case "settings":

      return (
        <Settings
          onNavigate={
            handleNavigate
          }
        />
      );


    // ========================================
    // HELP & SUPPORT
    // ========================================

    case "help":

      return (
        <HelpSupport
          onNavigate={
            handleNavigate
          }
        />
      );


    // ========================================
    // SECURITY
    // ========================================

    case "security":

      return (

        <div className="min-h-screen bg-slate-50 p-8">

          <div className="mx-auto max-w-4xl">


            <button
              type="button"

              onClick={() =>
                handleNavigate(
                  "admin-profile"
                )
              }

              className="mb-6 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
            >

              ← Back to Admin Profile

            </button>


            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">


              <h1 className="text-xl font-bold text-slate-900">

                Security Settings

              </h1>


              <p className="mt-2 text-sm text-slate-500">

                ResumeIQ authentication is
                connected to the backend.

              </p>


              <div className="mt-6 rounded-xl border border-emerald-100 bg-emerald-50 p-4">


                <p className="text-xs font-semibold text-emerald-800">

                  Authentication Active

                </p>


                <p className="mt-1 text-xs leading-5 text-emerald-700">

                  Your account is authenticated
                  through the ResumeIQ backend
                  and PostgreSQL user database.

                </p>

              </div>


              {currentUser && (

                <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">

                  <p className="text-xs font-semibold text-slate-700">

                    Current Account

                  </p>


                  <div className="mt-3 space-y-2 text-sm">

                    <p>

                      <span className="font-medium text-slate-500">
                        Name:
                      </span>{" "}

                      <span className="text-slate-800">
                        {currentUser.name}
                      </span>

                    </p>


                    <p>

                      <span className="font-medium text-slate-500">
                        Email:
                      </span>{" "}

                      <span className="text-slate-800">
                        {currentUser.email}
                      </span>

                    </p>


                    <p>

                      <span className="font-medium text-slate-500">
                        Role:
                      </span>{" "}

                      <span className="text-slate-800">
                        {currentUser.role}
                      </span>

                    </p>

                  </div>

                </div>

              )}


              <button
                type="button"

                onClick={
                  handleLogout
                }

                className="mt-6 rounded-xl bg-red-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-600"
              >

                Sign Out

              </button>


            </div>

          </div>

        </div>

      );


    // ========================================
    // DEFAULT
    // ========================================

    default:

      return (
        <Dashboard
          onNavigate={
            handleNavigate
          }
        />
      );

  }

}


export default App;