import { useState } from "react";

import {
  User,
  Mail,
  ShieldCheck,
  Briefcase,
  CheckCircle2,
  ArrowLeft,
  Pencil,
  Building2,
  Save,
  X,
  LockKeyhole,
  AlertCircle,
} from "lucide-react";


const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000";


const DEFAULT_PROFILE = {
  name: "Admin",
  email: "admin@resumeiq.com",
  role: "Admin",
};


function AdminProfile({
  onNavigate,
}) {

  // ==========================================
  // LOAD PROFILE
  // ==========================================

  const [profile, setProfile] =
    useState(() => {

      try {

        // --------------------------------------
        // FIRST: SAVED ADMIN PROFILE
        // --------------------------------------

        const savedProfile =
          localStorage.getItem(
            "resumeiq_admin_profile"
          );


        if (savedProfile) {

          return {
            ...DEFAULT_PROFILE,
            ...JSON.parse(
              savedProfile
            ),
          };

        }


        // --------------------------------------
        // SECOND: LOGGED-IN USER
        // --------------------------------------

        const savedUser =
          localStorage.getItem(
            "resumeiq_user"
          );


        if (savedUser) {

          const user =
            JSON.parse(
              savedUser
            );


          return {

            name:
              user.name ||
              DEFAULT_PROFILE.name,

            email:
              user.email ||
              DEFAULT_PROFILE.email,

            role:
              user.role ||
              DEFAULT_PROFILE.role,

          };

        }

      } catch (error) {

        console.error(
          "Could not load profile:",
          error
        );

      }


      return DEFAULT_PROFILE;

    });


  // ==========================================
  // EDIT STATE
  // ==========================================

  const [editing, setEditing] =
    useState(false);


  const [formData, setFormData] =
    useState(profile);


  // ==========================================
  // SAVE STATE
  // ==========================================

  const [saved, setSaved] =
    useState(false);


  const [loading, setLoading] =
    useState(false);


  const [error, setError] =
    useState("");


  // ==========================================
  // START EDITING
  // ==========================================

  const handleEdit = () => {

    setFormData({
      ...profile,
    });

    setEditing(true);

    setSaved(false);

    setError("");

  };


  // ==========================================
  // CANCEL EDITING
  // ==========================================

  const handleCancel = () => {

    setFormData({
      ...profile,
    });

    setEditing(false);

    setSaved(false);

    setError("");

  };


  // ==========================================
  // FORM CHANGE
  // ==========================================

  const handleChange = (
    field,
    value
  ) => {

    setFormData(
      (previous) => ({

        ...previous,

        [field]: value,

      })
    );

    setSaved(false);

    setError("");

  };


  // ==========================================
  // GET AUTH TOKEN
  // ==========================================

  const getAuthToken = () => {

    const possibleKeys = [

      "resumeiq_token",

      "resumeiq_access_token",

      "access_token",

      "token",

    ];


    for (
      const key of possibleKeys
    ) {

      const token =
        localStorage.getItem(
          key
        );


      if (token) {

        return token;

      }

    }


    return null;

  };


  // ==========================================
  // SAVE PROFILE
  // ==========================================

  const handleSave = async () => {

    setError("");

    setSaved(false);


    // ----------------------------------------
    // CLEAN DATA
    // ----------------------------------------

    const cleanedProfile = {

      name:
        formData.name.trim() ||
        DEFAULT_PROFILE.name,

      email:
        formData.email.trim().toLowerCase() ||
        DEFAULT_PROFILE.email,

      role:
        formData.role.trim() ||
        DEFAULT_PROFILE.role,

    };


    // ----------------------------------------
    // BASIC VALIDATION
    // ----------------------------------------

    if (!cleanedProfile.name) {

      setError(
        "Please enter your name."
      );

      return;

    }


    if (!cleanedProfile.email) {

      setError(
        "Please enter your email address."
      );

      return;

    }


    if (!cleanedProfile.email.includes("@")) {

      setError(
        "Please enter a valid email address."
      );

      return;

    }


    if (!cleanedProfile.role) {

      setError(
        "Please enter your role."
      );

      return;

    }


    // ----------------------------------------
    // GET TOKEN
    // ----------------------------------------

    const token =
      getAuthToken();


    if (!token) {

      setError(
        "Your login session has expired. Please log in again."
      );

      return;

    }


    // ----------------------------------------
    // START LOADING
    // ----------------------------------------

    setLoading(true);


    try {

      // ======================================
      // CALL BACKEND
      // ======================================

      const response =
        await fetch(
          `${API_BASE_URL}/auth/profile`,
          {

            method: "PUT",

            headers: {

              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,

            },

            body:
              JSON.stringify(
                cleanedProfile
              ),

          }
        );


      // ======================================
      // READ RESPONSE
      // ======================================

      let data = null;


      try {

        data =
          await response.json();

      } catch {

        data = null;

      }


      // ======================================
      // HANDLE AUTH ERROR
      // ======================================

      if (
        response.status === 401
      ) {

        setError(
          "Your login session has expired. Please log in again."
        );

        return;

      }


      // ======================================
      // HANDLE DUPLICATE EMAIL
      // ======================================

      if (
        response.status === 409
      ) {

        setError(
          data?.detail ||
          "That email address is already in use."
        );

        return;

      }


      // ======================================
      // HANDLE OTHER ERRORS
      // ======================================

      if (!response.ok) {

        setError(
          data?.detail ||
          "Could not update your profile. Please try again."
        );

        return;

      }


      // ======================================
      // UPDATED USER
      // ======================================

      const updatedUser =
        data?.user || {
          ...cleanedProfile,
        };


      // ======================================
      // NEW TOKEN
      // ======================================

      if (data?.token) {

        localStorage.setItem(
          "resumeiq_token",
          data.token
        );

      }


      // ======================================
      // PROFILE TO STORE
      // ======================================

      const updatedProfile = {

        name:
          updatedUser.name ||
          cleanedProfile.name,

        email:
          updatedUser.email ||
          cleanedProfile.email,

        role:
          updatedUser.role ||
          cleanedProfile.role,

      };


      // ======================================
      // UPDATE REACT STATE
      // ======================================

      setProfile(
        updatedProfile
      );


      setFormData(
        updatedProfile
      );


      // ======================================
      // UPDATE LOCAL STORAGE
      // ======================================

      localStorage.setItem(

        "resumeiq_admin_profile",

        JSON.stringify(
          updatedProfile
        )

      );


      localStorage.setItem(

        "resumeiq_user",

        JSON.stringify(
          updatedProfile
        )

      );


      // ======================================
      // NOTIFY OTHER COMPONENTS
      // ======================================

      window.dispatchEvent(
        new Event(
          "resumeiq-profile-updated"
        )
      );


      // ======================================
      // UI STATE
      // ======================================

      setEditing(false);

      setSaved(true);

      setError("");


      // ======================================
      // HIDE SUCCESS MESSAGE
      // ======================================

      setTimeout(() => {

        setSaved(false);

      }, 3000);

    } catch (error) {

      console.error(
        "Profile update error:",
        error
      );


      setError(
        "Unable to connect to the ResumeIQ server. Make sure the backend is running on port 8000."
      );

    } finally {

      setLoading(false);

    }

  };


  // ==========================================
  // INITIALS
  // ==========================================

  const getInitials = (
    name
  ) => {

    if (!name) {

      return "A";

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

  };


  const initials =
    getInitials(
      profile.name
    );


  return (

    <div className="min-h-screen bg-slate-50">


      {/* =========================================
          HEADER
      ========================================== */}

      <div className="border-b border-slate-200 bg-white">

        <div className="mx-auto max-w-6xl px-6 py-6 md:px-8">


          {/* BACK */}

          <button
            type="button"

            onClick={() =>
              onNavigate(
                "dashboard"
              )
            }

            className="mb-5 flex items-center gap-2 text-xs font-semibold text-slate-500 transition hover:text-indigo-600"
          >

            <ArrowLeft size={15} />

            Back to Dashboard

          </button>


          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">

            Account

          </p>


          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">

            Admin Profile

          </h1>


          <p className="mt-1 text-sm text-slate-500">

            Manage your ResumeIQ administrator
            profile.

          </p>

        </div>

      </div>


      {/* =========================================
          CONTENT
      ========================================== */}

      <main className="mx-auto max-w-6xl px-6 py-8 md:px-8">


        {/* =======================================
            ERROR MESSAGE
        ======================================== */}

        {error && (

          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4">

            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-red-500">

              <AlertCircle
                size={18}
              />

            </div>


            <div>

              <p className="text-sm font-bold text-red-700">

                Profile update failed

              </p>


              <p className="mt-0.5 text-xs leading-5 text-red-600">

                {error}

              </p>

            </div>

          </div>

        )}


        {/* =======================================
            SUCCESS MESSAGE
        ======================================== */}

        {saved && (

          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4">

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-emerald-600">

              <CheckCircle2
                size={18}
              />

            </div>


            <div>

              <p className="text-sm font-bold text-emerald-700">

                Profile updated

              </p>


              <p className="mt-0.5 text-xs text-emerald-600">

                Your administrator information has
                been saved successfully.

              </p>

            </div>

          </div>

        )}


        <div className="grid gap-6 lg:grid-cols-[340px_1fr]">


          {/* =====================================
              PROFILE CARD
          ====================================== */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex flex-col items-center text-center">


              {/* AVATAR */}

              <div className="relative">

                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-indigo-600 text-3xl font-bold text-white shadow-lg shadow-indigo-500/20">

                  {initials}

                </div>


                <span className="absolute bottom-1 right-1 h-5 w-5 rounded-full border-4 border-white bg-emerald-500" />

              </div>


              {/* NAME */}

              <h2 className="mt-5 text-lg font-bold text-slate-900">

                {profile.name}

              </h2>


              {/* ROLE */}

              <p className="mt-1 text-sm text-slate-500">

                {profile.role}

              </p>


              {/* STATUS */}

              <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5">

                <CheckCircle2
                  size={13}
                  className="text-emerald-600"
                />


                <span className="text-[11px] font-semibold text-emerald-700">

                  Active Account

                </span>

              </div>


              <div className="my-6 h-px w-full bg-slate-100" />


              {/* WORKSPACE */}

              <div className="flex w-full items-center gap-3 rounded-xl bg-slate-50 p-3 text-left">

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">

                  <Building2
                    size={17}
                  />

                </div>


                <div>

                  <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">

                    Workspace

                  </p>


                  <p className="mt-0.5 text-xs font-semibold text-slate-700">

                    ResumeIQ R&D

                  </p>

                </div>

              </div>


              {/* EMAIL */}

              <div className="mt-3 flex w-full items-center gap-3 rounded-xl bg-slate-50 p-3 text-left">

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">

                  <Mail
                    size={17}
                  />

                </div>


                <div className="min-w-0">

                  <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">

                    Email

                  </p>


                  <p className="mt-0.5 truncate text-xs font-semibold text-slate-700">

                    {profile.email}

                  </p>

                </div>

              </div>

            </div>

          </div>


          {/* =====================================
              INFORMATION
          ====================================== */}

          <div className="space-y-6">


            {/* ===================================
                PERSONAL INFORMATION
            ==================================== */}

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">


              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">


                <div>

                  <h3 className="text-sm font-bold text-slate-900">

                    Personal Information

                  </h3>


                  <p className="mt-1 text-xs text-slate-400">

                    Your administrator account details.

                  </p>

                </div>


                {/* =================================
                    EDIT / SAVE / CANCEL
                ================================== */}

                {!editing ? (

                  <button
                    type="button"

                    onClick={
                      handleEdit
                    }

                    className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-[11px] font-semibold text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
                  >

                    <Pencil
                      size={13}
                    />

                    Edit Profile

                  </button>

                ) : (

                  <div className="flex gap-2">


                    {/* CANCEL */}

                    <button
                      type="button"

                      onClick={
                        handleCancel
                      }

                      disabled={
                        loading
                      }

                      className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-[11px] font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >

                      <X
                        size={13}
                      />

                      Cancel

                    </button>


                    {/* SAVE */}

                    <button
                      type="button"

                      onClick={
                        handleSave
                      }

                      disabled={
                        loading
                      }

                      className="flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-[11px] font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >

                      {loading ? (

                        <>

                          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                          Saving...

                        </>

                      ) : (

                        <>

                          <Save
                            size={13}
                          />

                          Save

                        </>

                      )}

                    </button>

                  </div>

                )}

              </div>


              <div className="mt-6 grid gap-5 sm:grid-cols-2">


                {/* NAME */}

                <ProfileField
                  icon={User}
                  label="Full Name"
                  value={
                    formData.name
                  }
                  editing={
                    editing
                  }
                  onChange={(
                    value
                  ) =>
                    handleChange(
                      "name",
                      value
                    )
                  }
                />


                {/* EMAIL */}

                <ProfileField
                  icon={Mail}
                  label="Email Address"
                  value={
                    formData.email
                  }
                  editing={
                    editing
                  }
                  type="email"
                  onChange={(
                    value
                  ) =>
                    handleChange(
                      "email",
                      value
                    )
                  }
                />


                {/* ROLE */}

                <ProfileField
                  icon={Briefcase}
                  label="Role"
                  value={
                    formData.role
                  }
                  editing={
                    editing
                  }
                  onChange={(
                    value
                  ) =>
                    handleChange(
                      "role",
                      value
                    )
                  }
                />


                {/* STATUS */}

                <div>

                  <div className="mb-2 flex items-center gap-2">

                    <ShieldCheck
                      size={14}
                      className="text-slate-400"
                    />


                    <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">

                      Account Status

                    </span>

                  </div>


                  <div className="flex items-center gap-2">

                    <span className="h-2 w-2 rounded-full bg-emerald-500" />


                    <p className="text-sm font-semibold text-emerald-600">

                      Active

                    </p>

                  </div>

                </div>

              </div>

            </section>


            {/* ===================================
                ACCOUNT INFORMATION
            ==================================== */}

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

              <h3 className="text-sm font-bold text-slate-900">

                Account Information

              </h3>


              <p className="mt-1 text-xs text-slate-400">

                Information about your ResumeIQ
                workspace.

              </p>


              <div className="mt-5 grid gap-4 sm:grid-cols-2">


                <AccountInfoCard
                  label="Workspace"
                  value="ResumeIQ R&D"
                />


                <AccountInfoCard
                  label="Version"
                  value="Prototype v1.0"
                />


                <AccountInfoCard
                  label="Access Level"
                  value={
                    profile.role
                  }
                />


                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">

                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">

                    Status

                  </p>


                  <div className="mt-2 flex items-center gap-2">

                    <span className="h-2 w-2 rounded-full bg-emerald-500" />


                    <span className="text-sm font-bold text-emerald-600">

                      Active

                    </span>

                  </div>

                </div>

              </div>

            </section>


            {/* ===================================
                SECURITY
            ==================================== */}

            <section className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-6">

              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

                <div>

                  <div className="flex items-center gap-2">

                    <ShieldCheck
                      size={17}
                      className="text-indigo-600"
                    />


                    <h3 className="text-sm font-bold text-slate-900">

                      Account Security

                    </h3>

                  </div>


                  <p className="mt-1 text-xs text-slate-500">

                    Manage security options for your
                    administrator account.

                  </p>

                </div>


                <button
                  type="button"

                  onClick={() =>
                    onNavigate(
                      "security"
                    )
                  }

                  className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700"
                >

                  <LockKeyhole
                    size={14}
                  />

                  Security Settings

                </button>

              </div>

            </section>


            {/* ===================================
                STORAGE
            ==================================== */}

            <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400">

              <CheckCircle2
                size={12}
                className="text-emerald-500"
              />

              Profile information is saved to
              your ResumeIQ account.

            </div>

          </div>

        </div>

      </main>

    </div>

  );

}


// ==================================================
// PROFILE FIELD
// ==================================================

function ProfileField({
  icon: Icon,
  label,
  value,
  editing,
  type = "text",
  onChange,
}) {

  return (

    <div>

      <div className="mb-2 flex items-center gap-2">

        <Icon
          size={14}
          className="text-slate-400"
        />


        <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">

          {label}

        </span>

      </div>


      {editing ? (

        <input
          type={type}
          value={value}
          onChange={(event) =>
            onChange(
              event.target.value
            )
          }
          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10"
        />

      ) : (

        <p className="text-sm font-semibold text-slate-800">

          {value || "—"}

        </p>

      )}

    </div>

  );

}


// ==================================================
// ACCOUNT INFO CARD
// ==================================================

function AccountInfoCard({
  label,
  value,
}) {

  return (

    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">

      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">

        {label}

      </p>


      <p className="mt-2 text-sm font-bold text-slate-800">

        {value}

      </p>

    </div>

  );

}


export default AdminProfile;