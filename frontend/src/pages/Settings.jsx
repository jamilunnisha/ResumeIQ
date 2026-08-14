import { useEffect, useState } from "react";

import {
  Settings as SettingsIcon,
  User,
  Bell,
  FileText,
  ShieldCheck,
  Save,
  RotateCcw,
  CheckCircle2,
  Mail,
  Building2,
  LockKeyhole,
  HelpCircle,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";


const DEFAULT_SETTINGS = {
  candidateNotifications: true,
  uploadNotifications: true,
  autoRefresh: true,
  emailNotifications: false,
  resumeParsing: true,
};


function Settings({ onNavigate }) {

  const [saved, setSaved] =
    useState(false);


  const [settings, setSettings] =
    useState(() => {

      try {

        const stored =
          localStorage.getItem(
            "resumeiq_settings"
          );

        if (stored) {

          return {
            ...DEFAULT_SETTINGS,
            ...JSON.parse(stored),
          };

        }

      } catch (error) {

        console.error(
          "Could not load settings:",
          error
        );

      }

      return DEFAULT_SETTINGS;

    });


  // ==========================================
  // TOGGLE
  // ==========================================

  const handleToggle = (key) => {

    setSettings((previous) => ({
      ...previous,
      [key]: !previous[key],
    }));

    setSaved(false);

  };


  // ==========================================
  // SAVE
  // ==========================================

  const handleSave = () => {

    try {

      localStorage.setItem(
        "resumeiq_settings",
        JSON.stringify(settings)
      );

      setSaved(true);

      setTimeout(() => {
        setSaved(false);
      }, 3000);

    } catch (error) {

      console.error(
        "Could not save settings:",
        error
      );

    }

  };


  // ==========================================
  // RESET
  // ==========================================

  const handleReset = () => {

    const confirmed =
      window.confirm(
        "Reset all ResumeIQ settings to their default values?"
      );

    if (!confirmed) {
      return;
    }


    setSettings(
      DEFAULT_SETTINGS
    );


    try {

      localStorage.setItem(
        "resumeiq_settings",
        JSON.stringify(
          DEFAULT_SETTINGS
        )
      );

    } catch (error) {

      console.error(
        "Could not reset settings:",
        error
      );

    }


    setSaved(false);

  };


  // ==========================================
  // RETURN
  // ==========================================

  return (

    <div className="min-h-screen bg-[#f7f8fc]">


      {/* ======================================
          SIDEBAR
      ======================================= */}

      <Sidebar
        activePage="settings"
        onNavigate={onNavigate}
      />


      {/* ======================================
          MAIN
      ======================================= */}

      <div className="lg:pl-[260px]">


        {/* ====================================
            HEADER
        ===================================== */}

        <Header
          title="Settings"
          subtitle="Application preferences"
          onNavigate={onNavigate}
        />


        <main className="mx-auto max-w-[1250px] px-5 py-8 sm:px-7 lg:px-9">


          {/* ==================================
              PAGE INTRO
          =================================== */}

          <section className="mb-8">

            <div className="flex items-center gap-2">

              <SettingsIcon
                size={15}
                className="text-indigo-500"
              />

              <span className="text-xs font-bold uppercase tracking-[0.12em] text-indigo-500">

                Workspace configuration

              </span>

            </div>


            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">

              Settings

            </h1>


            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">

              Manage your ResumeIQ workspace,
              administrator preferences,
              notifications and resume
              processing options.

            </p>

          </section>


          {/* ==================================
              SUCCESS MESSAGE
          =================================== */}

          {saved && (

            <div className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4">

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-emerald-600">

                <CheckCircle2 size={18} />

              </div>


              <div>

                <p className="text-sm font-bold text-emerald-700">

                  Settings saved

                </p>


                <p className="mt-0.5 text-xs text-emerald-600">

                  Your ResumeIQ preferences have
                  been updated successfully.

                </p>

              </div>

            </div>

          )}


          {/* ==================================
              CONTENT
          =================================== */}

          <div className="grid gap-6 lg:grid-cols-[1fr_340px]">


            {/* =================================
                MAIN SETTINGS
            ================================== */}

            <div className="space-y-6">


              {/* =================================
                  ADMIN ACCOUNT
              ================================== */}

              <SettingsSection
                icon={User}
                title="Administrator Account"
                description="Information about the current ResumeIQ administrator."
              >

                <div className="flex flex-col gap-5 sm:flex-row sm:items-center">


                  {/* AVATAR */}

                  <div className="relative shrink-0">

                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-600 text-xl font-bold text-white shadow-lg shadow-indigo-500/20">

                      A

                    </div>


                    <span className="absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-white bg-emerald-500" />

                  </div>


                  {/* INFO */}

                  <div className="min-w-0 flex-1">

                    <p className="text-base font-bold text-slate-900">

                      Admin

                    </p>


                    <p className="mt-1 text-xs text-slate-400">

                      Recruiter • Administrator

                    </p>


                    <div className="mt-2 flex flex-wrap gap-2">

                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-600">

                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

                        Active account

                      </span>

                    </div>

                  </div>


                  {/* PROFILE */}

                  <button
                    type="button"
                    onClick={() =>
                      onNavigate(
                        "admin-profile"
                      )
                    }
                    className="flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
                  >

                    <User size={14} />

                    View Profile

                  </button>

                </div>


                <div className="mt-6 grid gap-4 sm:grid-cols-2">

                  <InputField
                    label="Admin name"
                    value="Admin"
                    readOnly
                  />


                  <InputField
                    label="Email address"
                    value="admin@resumeiq.com"
                    readOnly
                  />


                  <InputField
                    label="Role"
                    value="Recruiter"
                    readOnly
                  />


                  <InputField
                    label="Workspace"
                    value="ResumeIQ R&D"
                    readOnly
                  />

                </div>

              </SettingsSection>


              {/* =================================
                  WORKSPACE
              ================================== */}

              <SettingsSection
                icon={Building2}
                title="Workspace"
                description="Basic information about your ResumeIQ recruitment environment."
              >

                <div className="grid gap-4 sm:grid-cols-2">

                  <InputField
                    label="Workspace name"
                    value="ResumeIQ R&D"
                    readOnly
                  />


                  <InputField
                    label="Workspace type"
                    value="Talent Intelligence"
                    readOnly
                  />


                  <InputField
                    label="Application version"
                    value="Prototype v1.0"
                    readOnly
                  />


                  <InputField
                    label="Environment"
                    value="Local Development"
                    readOnly
                  />

                </div>

              </SettingsSection>


              {/* =================================
                  RESUME PROCESSING
              ================================== */}

              <SettingsSection
                icon={FileText}
                title="Resume Processing"
                description="Configure how ResumeIQ handles candidate resumes."
              >

                <ToggleRow
                  title="Resume parsing"
                  description="Enable automatic extraction of candidate information from uploaded resumes."
                  enabled={
                    settings.resumeParsing
                  }
                  onToggle={() =>
                    handleToggle(
                      "resumeParsing"
                    )
                  }
                />


                <Divider />


                <ToggleRow
                  title="Automatic dashboard refresh"
                  description="Refresh candidate information when the dashboard is opened."
                  enabled={
                    settings.autoRefresh
                  }
                  onToggle={() =>
                    handleToggle(
                      "autoRefresh"
                    )
                  }
                />

              </SettingsSection>


              {/* =================================
                  NOTIFICATIONS
              ================================== */}

              <SettingsSection
                icon={Bell}
                title="Notifications"
                description="Choose which events should display notifications."
              >

                <ToggleRow
                  title="New candidate notifications"
                  description="Show a notification when a new candidate is successfully added."
                  enabled={
                    settings.candidateNotifications
                  }
                  onToggle={() =>
                    handleToggle(
                      "candidateNotifications"
                    )
                  }
                />


                <Divider />


                <ToggleRow
                  title="Resume upload notifications"
                  description="Show a notification after a resume has been processed successfully."
                  enabled={
                    settings.uploadNotifications
                  }
                  onToggle={() =>
                    handleToggle(
                      "uploadNotifications"
                    )
                  }
                />


                <Divider />


                <ToggleRow
                  title="Email notifications"
                  description="Enable email notifications for important recruitment events."
                  enabled={
                    settings.emailNotifications
                  }
                  onToggle={() =>
                    handleToggle(
                      "emailNotifications"
                    )
                  }
                />

              </SettingsSection>


              {/* =================================
                  SECURITY
              ================================== */}

              <SettingsSection
                icon={ShieldCheck}
                title="Security"
                description="Review security information for your current ResumeIQ environment."
              >

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">


                    <div className="flex items-start gap-3">

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-indigo-600 shadow-sm">

                        <LockKeyhole size={17} />

                      </div>


                      <div>

                        <p className="text-xs font-bold text-slate-700">

                          Account security

                        </p>


                        <p className="mt-1 text-[11px] leading-5 text-slate-400">

                          Manage administrator security
                          information and authentication
                          options.

                        </p>

                      </div>

                    </div>


                    <button
                      type="button"
                      onClick={() =>
                        onNavigate(
                          "security"
                        )
                      }
                      className="flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-xs font-semibold text-white transition hover:bg-indigo-600"
                    >

                      <ShieldCheck size={14} />

                      Security

                    </button>

                  </div>


                  <div className="mt-4 flex items-center gap-2 rounded-lg border border-amber-100 bg-amber-50 px-3 py-2.5">

                    <span className="h-2 w-2 rounded-full bg-amber-500" />

                    <p className="text-[10px] font-semibold text-amber-700">

                      Authentication is currently
                      in prototype mode.

                    </p>

                  </div>

                </div>

              </SettingsSection>

            </div>


            {/* ==================================
                SIDE PANEL
            ================================== */}

            <div className="space-y-6">


              {/* =================================
                  PREFERENCES
              ================================== */}

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">

                  <SettingsIcon size={20} />

                </div>


                <h2 className="mt-5 text-base font-bold text-slate-900">

                  ResumeIQ Preferences

                </h2>


                <p className="mt-2 text-xs leading-5 text-slate-400">

                  These settings control the behaviour
                  of your current ResumeIQ workspace.

                </p>


                <div className="mt-6 space-y-3">

                  <PreferenceStatus
                    label="Resume parsing"
                    enabled={
                      settings.resumeParsing
                    }
                  />


                  <PreferenceStatus
                    label="Auto refresh"
                    enabled={
                      settings.autoRefresh
                    }
                  />


                  <PreferenceStatus
                    label="Candidate alerts"
                    enabled={
                      settings.candidateNotifications
                    }
                  />


                  <PreferenceStatus
                    label="Upload alerts"
                    enabled={
                      settings.uploadNotifications
                    }
                  />


                  <PreferenceStatus
                    label="Email notifications"
                    enabled={
                      settings.emailNotifications
                    }
                  />

                </div>

              </div>


              {/* =================================
                  ADMIN PROFILE
              ================================== */}

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                <div className="flex items-center gap-3">

                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-50 text-sm font-bold text-indigo-600">

                    A

                  </div>


                  <div>

                    <p className="text-sm font-bold text-slate-800">

                      Admin

                    </p>


                    <p className="text-[10px] text-slate-400">

                      Administrator / Recruiter

                    </p>

                  </div>

                </div>


                <div className="mt-5 space-y-2">

                  <ProfileInfo
                    icon={Mail}
                    label="Email"
                    value="admin@resumeiq.com"
                  />


                  <ProfileInfo
                    icon={ShieldCheck}
                    label="Status"
                    value="Active"
                    active
                  />

                </div>


                <button
                  type="button"
                  onClick={() =>
                    onNavigate(
                      "admin-profile"
                    )
                  }
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-semibold text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
                >

                  <User size={14} />

                  Open Admin Profile

                </button>

              </div>


              {/* =================================
                  HELP
              ================================== */}

              <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-6">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-indigo-600">

                  <HelpCircle size={18} />

                </div>


                <p className="mt-4 text-xs font-bold text-indigo-700">

                  Need help?

                </p>


                <p className="mt-2 text-xs leading-5 text-indigo-600/70">

                  If you're unsure about any ResumeIQ
                  setting, visit Help & Support for
                  guidance.

                </p>


                <button
                  type="button"
                  onClick={() =>
                    onNavigate("help")
                  }
                  className="mt-4 flex items-center gap-2 text-xs font-bold text-indigo-600 transition hover:text-indigo-800"
                >

                  Open Help & Support

                  <span>→</span>

                </button>

              </div>

            </div>

          </div>


          {/* ==================================
              ACTIONS
          =================================== */}

          <div className="mt-6 flex flex-col justify-end gap-3 border-t border-slate-200 pt-6 sm:flex-row">

            <button
              type="button"
              onClick={handleReset}
              className="flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
            >

              <RotateCcw size={15} />

              Reset

            </button>


            <button
              type="button"
              onClick={handleSave}
              className="flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 text-xs font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-700"
            >

              <Save size={15} />

              Save Changes

            </button>

          </div>


          {/* ==================================
              FOOTER
          =================================== */}

          <div className="mt-6 flex items-center justify-center gap-2 text-[10px] text-slate-400">

            <CheckCircle2
              size={12}
              className="text-emerald-500"
            />

            ResumeIQ preferences are stored
            locally on this device.

          </div>

        </main>

      </div>

    </div>

  );

}


// ==================================================
// SETTINGS SECTION
// ==================================================

function SettingsSection({
  icon: Icon,
  title,
  description,
  children,
}) {

  return (

    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

      <div className="flex items-start gap-3">

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-500">

          <Icon size={18} />

        </div>


        <div>

          <h2 className="text-sm font-bold text-slate-900">

            {title}

          </h2>


          <p className="mt-1 text-xs leading-5 text-slate-400">

            {description}

          </p>

        </div>

      </div>


      <div className="mt-6">

        {children}

      </div>

    </section>

  );

}


// ==================================================
// INPUT FIELD
// ==================================================

function InputField({
  label,
  value,
  readOnly,
}) {

  return (

    <div>

      <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-slate-400">

        {label}

      </label>


      <input
        value={value}
        readOnly={readOnly}
        className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-xs font-medium text-slate-600 outline-none"
      />

    </div>

  );

}


// ==================================================
// TOGGLE
// ==================================================

function ToggleRow({
  title,
  description,
  enabled,
  onToggle,
}) {

  return (

    <div className="flex items-center justify-between gap-5">

      <div className="min-w-0">

        <p className="text-xs font-bold text-slate-700">

          {title}

        </p>


        <p className="mt-1 max-w-xl text-[11px] leading-5 text-slate-400">

          {description}

        </p>

      </div>


      <button
        type="button"
        onClick={onToggle}
        aria-pressed={enabled}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          enabled
            ? "bg-indigo-600"
            : "bg-slate-300"
        }`}
      >

        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
            enabled
              ? "left-6"
              : "left-1"
          }`}
        />

      </button>

    </div>

  );

}


// ==================================================
// DIVIDER
// ==================================================

function Divider() {

  return (

    <div className="my-5 h-px bg-slate-100" />

  );

}


// ==================================================
// PREFERENCE STATUS
// ==================================================

function PreferenceStatus({
  label,
  enabled,
}) {

  return (

    <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2.5">

      <span className="text-[11px] font-medium text-slate-600">

        {label}

      </span>


      <span
        className={`text-[10px] font-bold ${
          enabled
            ? "text-emerald-600"
            : "text-slate-400"
        }`}
      >

        {enabled
          ? "Enabled"
          : "Disabled"}

      </span>

    </div>

  );

}


// ==================================================
// PROFILE INFO
// ==================================================

function ProfileInfo({
  icon: Icon,
  label,
  value,
  active = false,
}) {

  return (

    <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2.5">

      <div className="flex items-center gap-2">

        <Icon
          size={13}
          className="text-slate-400"
        />

        <span className="text-[10px] font-medium text-slate-500">

          {label}

        </span>

      </div>


      <span
        className={`max-w-[150px] truncate text-[10px] font-semibold ${
          active
            ? "text-emerald-600"
            : "text-slate-600"
        }`}
      >

        {value}

      </span>

    </div>

  );

}


export default Settings;