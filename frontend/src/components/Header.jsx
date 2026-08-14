import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Bell,
  Search,
  ChevronDown,
  Command,
  User,
  Settings,
  ShieldCheck,
  LogOut,
  FileText,
  UserPlus,
  CheckCircle,
  Clock,
  X,
} from "lucide-react";

import API from "../api";


function Header({
  title = "Dashboard",
  subtitle = "Recruitment workspace",
  onNavigate,
}) {

  // =========================================
  // PROFILE MENU
  // =========================================

  const [profileOpen, setProfileOpen] =
    useState(false);

  const profileRef = useRef(null);


  // =========================================
  // SEARCH
  // =========================================

  const [searchQuery, setSearchQuery] =
    useState("");

  const [searchResults, setSearchResults] =
    useState([]);

  const [searchOpen, setSearchOpen] =
    useState(false);

  const [searchLoading, setSearchLoading] =
    useState(false);

  const searchRef = useRef(null);


  // =========================================
  // NOTIFICATIONS
  // =========================================

  const [notificationsOpen, setNotificationsOpen] =
    useState(false);

  const [notifications, setNotifications] =
    useState([]);

  const [notificationsLoading, setNotificationsLoading] =
    useState(false);

  const [notificationsRead, setNotificationsRead] =
    useState(() => {

      try {

        return (
          localStorage.getItem(
            "resumeiq_notifications_read"
          ) === "true"
        );

      } catch {

        return false;

      }

    });

  const notificationsRef = useRef(null);


  // =========================================
  // CURRENT USER
  // =========================================

  const [user, setUser] =
    useState(() => {

      try {

        const savedUser =
          localStorage.getItem(
            "resumeiq_user"
          );

        if (savedUser) {

          return JSON.parse(
            savedUser
          );

        }

      } catch (error) {

        console.error(
          "Could not load user:",
          error
        );

      }


      return {
        name: "Admin",
        email: "admin@resumeiq.com",
        role: "Admin",
      };

    });


  // =========================================
  // UPDATE USER WHEN STORAGE CHANGES
  // =========================================

  useEffect(() => {

    const loadUser = () => {

      try {

        const savedUser =
          localStorage.getItem(
            "resumeiq_user"
          );

        if (savedUser) {

          setUser(
            JSON.parse(
              savedUser
            )
          );

        }

      } catch (error) {

        console.error(
          "Could not refresh user:",
          error
        );

      }

    };


    window.addEventListener(
      "storage",
      loadUser
    );


    window.addEventListener(
      "resumeiq-user-updated",
      loadUser
    );


    return () => {

      window.removeEventListener(
        "storage",
        loadUser
      );

      window.removeEventListener(
        "resumeiq-user-updated",
        loadUser
      );

    };

  }, []);


  // =========================================
  // GET INITIALS
  // =========================================

  const getInitials = (name) => {

    if (!name) {

      return "A";

    }


    const words =
      name
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
      words[
        words.length - 1
      ][0]
    ).toUpperCase();

  };


  const initials =
    getInitials(
      user?.name
    );


  // =========================================
  // AUTH HEADERS
  // =========================================

  const getAuthHeaders = () => {

    const token =
      localStorage.getItem(
        "resumeiq_token"
      );


    if (!token) {

      return {};

    }


    return {
      Authorization:
        `Bearer ${token}`,
    };

  };


  // =========================================
  // CLOSE MENUS OUTSIDE
  // =========================================

  useEffect(() => {

    const handleClickOutside = (
      event
    ) => {

      if (
        profileRef.current &&
        !profileRef.current.contains(
          event.target
        )
      ) {

        setProfileOpen(false);

      }


      if (
        searchRef.current &&
        !searchRef.current.contains(
          event.target
        )
      ) {

        setSearchOpen(false);

      }


      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(
          event.target
        )
      ) {

        setNotificationsOpen(false);

      }

    };


    document.addEventListener(
      "mousedown",
      handleClickOutside
    );


    return () => {

      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );

    };

  }, []);


  // =========================================
  // NAVIGATION
  // =========================================

  const handleNavigation = (
    page
  ) => {

    setProfileOpen(false);
    setNotificationsOpen(false);
    setSearchOpen(false);

    if (onNavigate) {

      onNavigate(page);

    }

  };


  // =========================================
  // LOGOUT
  // =========================================

  const handleLogout = () => {

    setProfileOpen(false);


    const confirmed =
      window.confirm(
        "Are you sure you want to logout?"
      );


    if (!confirmed) {

      return;

    }


    localStorage.removeItem(
      "resumeiq_token"
    );


    localStorage.removeItem(
      "resumeiq_authenticated"
    );


    localStorage.removeItem(
      "resumeiq_user"
    );


    localStorage.removeItem(
      "resumeiq_admin_profile"
    );


    if (onNavigate) {

      onNavigate(
        "logout"
      );

    }

  };


  // =========================================
  // SEARCH CANDIDATES
  // =========================================

  useEffect(() => {

    const query =
      searchQuery.trim();


    if (!query) {

      setSearchResults([]);
      setSearchOpen(false);

      return;

    }


    let cancelled = false;


    const timer =
      setTimeout(
        async () => {

          try {

            setSearchLoading(true);
            setSearchOpen(true);


            const response =
              await API.get(
                "/candidates",
                {
                  params: {
                    limit: 100,
                  },

                  headers:
                    getAuthHeaders(),
                }
              );


            if (cancelled) {

              return;

            }


            const candidates =
              Array.isArray(
                response.data
              )
                ? response.data
                : [];


            const lowerQuery =
              query.toLowerCase();


            const filtered =
              candidates.filter(
                (candidate) => {

                  const searchableText =
                    [
                      candidate?.name,
                      candidate?.email,
                      candidate?.phone,
                      candidate?.skills,
                      candidate?.status,
                      candidate?.experience,
                    ]
                      .filter(Boolean)
                      .join(" ")
                      .toLowerCase();


                  return searchableText.includes(
                    lowerQuery
                  );

                }
              );


            setSearchResults(
              filtered.slice(0, 8)
            );

          } catch (error) {

            console.error(
              "Global search error:",
              error
            );


            if (!cancelled) {

              setSearchResults([]);

            }

          } finally {

            if (!cancelled) {

              setSearchLoading(false);

            }

          }

        },
        300
      );


    return () => {

      cancelled = true;

      clearTimeout(timer);

    };

  }, [searchQuery]);


  // =========================================
  // OPEN SEARCH RESULT
  // =========================================

  const handleSearchResult = (
    candidate
  ) => {

    setSearchQuery("");
    setSearchOpen(false);


    try {

      localStorage.setItem(
        "resumeiq_selected_candidate",
        String(candidate.id)
      );

    } catch {

      // Ignore storage errors

    }


    if (onNavigate) {

      onNavigate(
        "candidate-profile",
        candidate.id
      );

    }

  };


  // =========================================
  // SEARCH KEYBOARD
  // =========================================

  const handleSearchKeyDown = (
    event
  ) => {

    if (
      event.key === "Escape"
    ) {

      setSearchQuery("");
      setSearchOpen(false);

    }


    if (
      event.key === "Enter" &&
      searchQuery.trim()
    ) {

      if (
        searchResults.length > 0
      ) {

        handleSearchResult(
          searchResults[0]
        );

      } else {

        handleNavigation(
          "candidates"
        );

      }

    }

  };


  // =========================================
  // LOAD NOTIFICATIONS
  // =========================================

  const loadNotifications =
    async () => {

      try {

        setNotificationsLoading(
          true
        );


        const response =
          await API.get(
            "/candidates",
            {
              params: {
                limit: 20,
              },

              headers:
                getAuthHeaders(),
            }
          );


        const candidates =
          Array.isArray(
            response.data
          )
            ? response.data
            : [];


        const generatedNotifications =
          [];


        candidates
          .slice(0, 10)
          .forEach(
            (candidate) => {

              generatedNotifications.push(
                {
                  id:
                    `candidate-${candidate.id}`,

                  type:
                    "candidate",

                  title:
                    "New candidate added",

                  message:
                    `${candidate.name || "Candidate"} is available in your candidate pool.`,

                  candidateId:
                    candidate.id,

                  createdAt:
                    candidate.created_at,

                  icon:
                    UserPlus,
                }
              );


              if (
                candidate.status &&
                candidate.status !== "New"
              ) {

                generatedNotifications.push(
                  {
                    id:
                      `status-${candidate.id}-${candidate.status}`,

                    type:
                      "status",

                    title:
                      "Candidate status updated",

                    message:
                      `${candidate.name || "Candidate"} is now ${candidate.status}.`,

                    candidateId:
                      candidate.id,

                    createdAt:
                      candidate.created_at,

                    icon:
                      CheckCircle,
                  }
                );

              }

            }
          );


        setNotifications(
          generatedNotifications.slice(
            0,
            8
          )
        );

      } catch (error) {

        console.error(
          "Notification loading error:",
          error
        );


        setNotifications([]);

      } finally {

        setNotificationsLoading(
          false
        );

      }

    };


  // =========================================
  // OPEN NOTIFICATIONS
  // =========================================

  const handleNotifications =
    async () => {

      const nextState =
        !notificationsOpen;


      setNotificationsOpen(
        nextState
      );

      setProfileOpen(false);


      if (nextState) {

        setNotificationsRead(
          true
        );


        localStorage.setItem(
          "resumeiq_notifications_read",
          "true"
        );


        await loadNotifications();

      }

    };


  // =========================================
  // CLEAR NOTIFICATIONS
  // =========================================

  const clearNotifications = () => {

    setNotifications([]);

    setNotificationsRead(
      true
    );


    localStorage.setItem(
      "resumeiq_notifications_read",
      "true"
    );

  };


  // =========================================
  // NOTIFICATION TIME
  // =========================================

  const getNotificationTime = (
    date
  ) => {

    if (!date) {

      return "Recently";

    }


    const timestamp =
      new Date(
        date
      ).getTime();


    if (
      Number.isNaN(timestamp)
    ) {

      return "Recently";

    }


    const difference =
      Date.now() -
      timestamp;


    const minutes =
      Math.floor(
        difference /
        60000
      );


    if (
      minutes < 1
    ) {

      return "Just now";

    }


    if (
      minutes < 60
    ) {

      return `${minutes}m ago`;

    }


    const hours =
      Math.floor(
        minutes / 60
      );


    if (
      hours < 24
    ) {

      return `${hours}h ago`;

    }


    const days =
      Math.floor(
        hours / 24
      );


    if (
      days < 7
    ) {

      return `${days}d ago`;

    }


    return new Date(
      date
    ).toLocaleDateString();

  };


  // =========================================
  // NOTIFICATION COUNT
  // =========================================

  const unreadCount =
    notificationsRead
      ? 0
      : notifications.length > 0
        ? Math.min(
            notifications.length,
            9
          )
        : 1;


  // =========================================
  // RENDER
  // =========================================

  return (

    <header
      className="
        sticky
        top-0
        z-30
        flex
        h-[82px]
        items-center
        justify-between
        border-b
        border-slate-200
        bg-white/95
        px-6
        backdrop-blur
        md:px-8
      "
    >

      {/* =====================================
          PAGE TITLE
      ====================================== */}

      <div className="min-w-0">

        <p
          className="
            text-[11px]
            font-semibold
            uppercase
            tracking-[0.12em]
            text-slate-400
          "
        >

          {subtitle}

        </p>


        <h2
          className="
            mt-1
            truncate
            text-xl
            font-bold
            tracking-tight
            text-slate-900
          "
        >

          {title}

        </h2>

      </div>


      {/* =====================================
          RIGHT SIDE
      ====================================== */}

      <div
        className="
          flex
          items-center
          gap-3
        "
      >

        {/* ===================================
            SEARCH
        ==================================== */}

        <div
          ref={searchRef}
          className="relative hidden md:block"
        >

          <div
            className="
              flex
              items-center
              gap-2
              rounded-xl
              border
              border-slate-200
              bg-slate-50
              px-3.5
              py-2.5
              transition
              focus-within:border-indigo-300
              focus-within:bg-white
              focus-within:ring-4
              focus-within:ring-indigo-500/5
            "
          >

            <Search
              size={17}
              className="shrink-0 text-slate-400"
            />


            <input
              type="text"
              value={searchQuery}
              onChange={(event) => {

                setSearchQuery(
                  event.target.value
                );

              }}
              onFocus={() => {

                if (
                  searchQuery.trim()
                ) {

                  setSearchOpen(true);

                }

              }}
              onKeyDown={
                handleSearchKeyDown
              }
              placeholder="Search..."
              autoComplete="off"
              className="
                w-36
                bg-transparent
                text-sm
                text-slate-700
                outline-none
                placeholder:text-slate-400
                lg:w-48
              "
            />


            {searchQuery && (

              <button
                type="button"
                onClick={() => {

                  setSearchQuery("");
                  setSearchOpen(false);

                }}
                className="
                  flex
                  h-5
                  w-5
                  items-center
                  justify-center
                  rounded
                  text-slate-400
                  hover:bg-slate-200
                  hover:text-slate-700
                "
                aria-label="Clear search"
              >

                <X size={12} />

              </button>

            )}


            {!searchQuery && (

              <div
                className="
                  hidden
                  items-center
                  gap-1
                  rounded-md
                  border
                  border-slate-200
                  bg-white
                  px-1.5
                  py-0.5
                  text-[10px]
                  font-medium
                  text-slate-400
                  lg:flex
                "
              >

                <Command size={10} />

                K

              </div>

            )}

          </div>


          {/* SEARCH RESULTS */}

          {searchOpen && (

            <div
              className="
                absolute
                right-0
                top-[calc(100%+10px)]
                z-50
                w-[360px]
                overflow-hidden
                rounded-2xl
                border
                border-slate-200
                bg-white
                shadow-xl
                shadow-slate-900/10
              "
            >

              <div
                className="
                  border-b
                  border-slate-100
                  px-4
                  py-3
                "
              >

                <p
                  className="
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-wider
                    text-slate-400
                  "
                >

                  Search candidates

                </p>

              </div>


              {searchLoading ? (

                <div
                  className="
                    flex
                    items-center
                    justify-center
                    gap-2
                    px-4
                    py-6
                    text-xs
                    text-slate-400
                  "
                >

                  <span
                    className="
                      h-4
                      w-4
                      animate-spin
                      rounded-full
                      border-2
                      border-slate-200
                      border-t-indigo-500
                    "
                  />

                  Searching candidates...

                </div>

              ) : searchResults.length > 0 ? (

                <div className="max-h-[360px] overflow-y-auto p-2">

                  {searchResults.map(
                    (candidate) => (

                      <button
                        key={
                          candidate.id
                        }
                        type="button"
                        onClick={() =>
                          handleSearchResult(
                            candidate
                          )
                        }
                        className="
                          flex
                          w-full
                          items-center
                          gap-3
                          rounded-xl
                          px-3
                          py-3
                          text-left
                          transition
                          hover:bg-slate-50
                        "
                      >

                        <div
                          className="
                            flex
                            h-9
                            w-9
                            shrink-0
                            items-center
                            justify-center
                            rounded-full
                            bg-indigo-50
                            text-xs
                            font-bold
                            text-indigo-600
                          "
                        >

                          {getInitials(
                            candidate.name
                          )}

                        </div>


                        <div className="min-w-0 flex-1">

                          <p
                            className="
                              truncate
                              text-xs
                              font-semibold
                              text-slate-800
                            "
                          >

                            {candidate.name ||
                              "Unnamed candidate"}

                          </p>


                          <p
                            className="
                              mt-0.5
                              truncate
                              text-[10px]
                              text-slate-400
                            "
                          >

                            {candidate.email ||
                              candidate.phone ||
                              "Candidate profile"}

                          </p>


                          {candidate.status && (

                            <span
                              className="
                                mt-1
                                inline-block
                                rounded-full
                                bg-slate-100
                                px-2
                                py-0.5
                                text-[9px]
                                font-semibold
                                text-slate-500
                              "
                            >

                              {candidate.status}

                            </span>

                          )}

                        </div>


                        <FileText
                          size={15}
                          className="shrink-0 text-slate-300"
                        />

                      </button>

                    )
                  )}

                </div>

              ) : (

                <div
                  className="
                    px-4
                    py-7
                    text-center
                  "
                >

                  <Search
                    size={24}
                    className="
                      mx-auto
                      text-slate-300
                    "
                  />


                  <p
                    className="
                      mt-2
                      text-xs
                      font-semibold
                      text-slate-600
                    "
                  >

                    No candidates found

                  </p>


                  <p
                    className="
                      mt-1
                      text-[10px]
                      text-slate-400
                    "
                  >

                    Try a name, email, phone or skill.

                  </p>

                </div>

              )}

            </div>

          )}

        </div>


        {/* ===================================
            NOTIFICATIONS
        ==================================== */}

        <div
          ref={notificationsRef}
          className="relative"
        >

          <button
            type="button"
            onClick={
              handleNotifications
            }
            className="
              relative
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              border
              border-slate-200
              bg-white
              text-slate-500
              transition
              hover:border-slate-300
              hover:bg-slate-50
              hover:text-slate-900
            "
            aria-label="Notifications"
            aria-expanded={
              notificationsOpen
            }
          >

            <Bell size={18} />


            {unreadCount > 0 && (

              <span
                className="
                  absolute
                  right-1.5
                  top-1.5
                  flex
                  h-4
                  min-w-4
                  items-center
                  justify-center
                  rounded-full
                  bg-indigo-500
                  px-1
                  text-[8px]
                  font-bold
                  text-white
                  ring-2
                  ring-white
                "
              >

                {unreadCount > 9
                  ? "9+"
                  : unreadCount}

              </span>

            )}

          </button>


          {/* NOTIFICATION PANEL */}

          {notificationsOpen && (

            <div
              className="
                absolute
                right-0
                top-[calc(100%+10px)]
                z-50
                w-[360px]
                overflow-hidden
                rounded-2xl
                border
                border-slate-200
                bg-white
                shadow-xl
                shadow-slate-900/10
              "
            >

              <div
                className="
                  flex
                  items-center
                  justify-between
                  border-b
                  border-slate-100
                  px-4
                  py-3
                "
              >

                <div>

                  <p
                    className="
                      text-sm
                      font-bold
                      text-slate-900
                    "
                  >

                    Notifications

                  </p>


                  <p
                    className="
                      mt-0.5
                      text-[10px]
                      text-slate-400
                    "
                  >

                    Recruitment activity

                  </p>

                </div>


                {notifications.length > 0 && (

                  <button
                    type="button"
                    onClick={
                      clearNotifications
                    }
                    className="
                      text-[10px]
                      font-semibold
                      text-indigo-600
                      hover:text-indigo-700
                    "
                  >

                    Mark all read

                  </button>

                )}

              </div>


              {notificationsLoading ? (

                <div
                  className="
                    flex
                    items-center
                    justify-center
                    gap-2
                    px-4
                    py-8
                    text-xs
                    text-slate-400
                  "
                >

                  <span
                    className="
                      h-4
                      w-4
                      animate-spin
                      rounded-full
                      border-2
                      border-slate-200
                      border-t-indigo-500
                    "
                  />

                  Loading notifications...

                </div>

              ) : notifications.length > 0 ? (

                <div className="max-h-[380px] overflow-y-auto">

                  {notifications.map(
                    (notification) => {

                      const Icon =
                        notification.icon ||
                        Bell;


                      return (

                        <button
                          key={
                            notification.id
                          }
                          type="button"
                          onClick={() => {

                            setNotificationsOpen(
                              false
                            );


                            if (
                              notification.candidateId &&
                              onNavigate
                            ) {

                              localStorage.setItem(
                                "resumeiq_selected_candidate",
                                String(
                                  notification.candidateId
                                )
                              );


                              onNavigate(
                                "candidate-profile",
                                notification.candidateId
                              );

                            }

                          }}
                          className="
                            flex
                            w-full
                            gap-3
                            border-b
                            border-slate-50
                            px-4
                            py-3.5
                            text-left
                            transition
                            hover:bg-slate-50
                          "
                        >

                          <div
                            className="
                              flex
                              h-9
                              w-9
                              shrink-0
                              items-center
                              justify-center
                              rounded-xl
                              bg-indigo-50
                              text-indigo-600
                            "
                          >

                            <Icon
                              size={16}
                            />

                          </div>


                          <div className="min-w-0 flex-1">

                            <div
                              className="
                                flex
                                items-start
                                justify-between
                                gap-2
                              "
                            >

                              <p
                                className="
                                  text-xs
                                  font-semibold
                                  text-slate-800
                                "
                              >

                                {notification.title}

                              </p>


                              <span
                                className="
                                  shrink-0
                                  text-[9px]
                                  text-slate-400
                                "
                              >

                                {getNotificationTime(
                                  notification.createdAt
                                )}

                              </span>

                            </div>


                            <p
                              className="
                                mt-1
                                text-[10px]
                                leading-4
                                text-slate-500
                              "
                            >

                              {notification.message}

                            </p>

                          </div>

                        </button>

                      );

                    }
                  )}

                </div>

              ) : (

                <div
                  className="
                    px-4
                    py-9
                    text-center
                  "
                >

                  <div
                    className="
                      mx-auto
                      flex
                      h-12
                      w-12
                      items-center
                      justify-center
                      rounded-full
                      bg-slate-50
                    "
                  >

                    <Bell
                      size={20}
                      className="text-slate-300"
                    />

                  </div>


                  <p
                    className="
                      mt-3
                      text-xs
                      font-semibold
                      text-slate-600
                    "
                  >

                    No notifications

                  </p>


                  <p
                    className="
                      mt-1
                      text-[10px]
                      text-slate-400
                    "
                  >

                    You're all caught up.

                  </p>

                </div>

              )}

            </div>

          )}

        </div>


        {/* ===================================
            DIVIDER
        ==================================== */}

        <div
          className="
            mx-1
            hidden
            h-8
            w-px
            bg-slate-200
            sm:block
          "
        />


        {/* ===================================
            PROFILE
        ==================================== */}

        <div
          ref={profileRef}
          className="relative"
        >

          {/* PROFILE BUTTON */}

          <button
            type="button"
            onClick={() =>
              setProfileOpen(
                (previous) =>
                  !previous
              )
            }
            aria-expanded={
              profileOpen
            }
            aria-haspopup="menu"
            className={`
              group
              flex
              items-center
              gap-3
              rounded-xl
              p-1.5
              pr-2
              transition
              ${
                profileOpen
                  ? "bg-slate-100"
                  : "hover:bg-slate-50"
              }
            `}
          >

            {/* AVATAR */}

            <div
              className="
                relative
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-full
                bg-indigo-50
                text-sm
                font-bold
                text-indigo-600
                ring-1
                ring-indigo-100
              "
            >

              {initials}


              <span
                className="
                  absolute
                  bottom-0
                  right-0
                  h-2.5
                  w-2.5
                  rounded-full
                  border-2
                  border-white
                  bg-emerald-500
                "
              />

            </div>


            {/* USER INFORMATION */}

            <div
              className="
                hidden
                max-w-[150px]
                text-left
                sm:block
              "
            >

              <p
                className="
                  truncate
                  text-[13px]
                  font-semibold
                  text-slate-800
                "
              >

                {user?.name ||
                  "Admin"}

              </p>


              <p
                className="
                  truncate
                  text-[10px]
                  font-medium
                  text-slate-400
                "
              >

                {user?.role ||
                  "Admin"}

              </p>

            </div>


            <ChevronDown
              size={15}
              className={`
                hidden
                text-slate-400
                transition-transform
                sm:block
                ${
                  profileOpen
                    ? "rotate-180 text-slate-600"
                    : "group-hover:text-slate-600"
                }
              `}
            />

          </button>


          {/* PROFILE DROPDOWN */}

          {profileOpen && (

            <div
              role="menu"
              className="
                absolute
                right-0
                top-[calc(100%+10px)]
                z-50
                w-[280px]
                overflow-hidden
                rounded-2xl
                border
                border-slate-200
                bg-white
                shadow-xl
                shadow-slate-900/10
              "
            >

              {/* PROFILE HEADER */}

              <div
                className="
                  border-b
                  border-slate-100
                  bg-gradient-to-br
                  from-indigo-50
                  to-white
                  p-4
                "
              >

                <div
                  className="
                    flex
                    items-center
                    gap-3
                  "
                >

                  <div
                    className="
                      flex
                      h-11
                      w-11
                      items-center
                      justify-center
                      rounded-full
                      bg-indigo-600
                      text-base
                      font-bold
                      text-white
                      shadow-md
                      shadow-indigo-500/20
                    "
                  >

                    {initials}

                  </div>


                  <div className="min-w-0">

                    <p
                      className="
                        truncate
                        text-sm
                        font-bold
                        text-slate-900
                      "
                    >

                      {user?.name ||
                        "Admin"}

                    </p>


                    <p
                      className="
                        mt-0.5
                        truncate
                        text-[11px]
                        text-slate-400
                      "
                    >

                      {user?.email ||
                        "admin@resumeiq.com"}

                    </p>


                    <div
                      className="
                        mt-1.5
                        flex
                        items-center
                        gap-1.5
                      "
                    >

                      <span
                        className="
                          h-1.5
                          w-1.5
                          rounded-full
                          bg-emerald-500
                        "
                      />


                      <span
                        className="
                          text-[9px]
                          font-semibold
                          text-emerald-600
                        "
                      >

                        Active account

                      </span>

                    </div>

                  </div>

                </div>

              </div>


              {/* MENU */}

              <div className="p-2">

                {/* MY PROFILE */}

                <button
                  type="button"
                  role="menuitem"
                  onClick={() =>
                    handleNavigation(
                      "admin-profile"
                    )
                  }
                  className="
                    flex
                    w-full
                    items-center
                    gap-3
                    rounded-xl
                    px-3
                    py-2.5
                    text-left
                    transition
                    hover:bg-slate-50
                  "
                >

                  <div
                    className="
                      flex
                      h-8
                      w-8
                      items-center
                      justify-center
                      rounded-lg
                      bg-indigo-50
                      text-indigo-600
                    "
                  >

                    <User
                      size={15}
                    />

                  </div>


                  <div>

                    <p
                      className="
                        text-xs
                        font-semibold
                        text-slate-700
                      "
                    >

                      My Profile

                    </p>


                    <p
                      className="
                        mt-0.5
                        text-[9px]
                        text-slate-400
                      "
                    >

                      View account information

                    </p>

                  </div>

                </button>


                {/* SETTINGS */}

                <button
                  type="button"
                  role="menuitem"
                  onClick={() =>
                    handleNavigation(
                      "settings"
                    )
                  }
                  className="
                    flex
                    w-full
                    items-center
                    gap-3
                    rounded-xl
                    px-3
                    py-2.5
                    text-left
                    transition
                    hover:bg-slate-50
                  "
                >

                  <div
                    className="
                      flex
                      h-8
                      w-8
                      items-center
                      justify-center
                      rounded-lg
                      bg-slate-100
                      text-slate-600
                    "
                  >

                    <Settings
                      size={15}
                    />

                  </div>


                  <div>

                    <p
                      className="
                        text-xs
                        font-semibold
                        text-slate-700
                      "
                    >

                      Account Settings

                    </p>


                    <p
                      className="
                        mt-0.5
                        text-[9px]
                        text-slate-400
                      "
                    >

                      Manage your preferences

                    </p>

                  </div>

                </button>


                {/* SECURITY */}

                <button
                  type="button"
                  role="menuitem"
                  onClick={() =>
                    handleNavigation(
                      "security"
                    )
                  }
                  className="
                    flex
                    w-full
                    items-center
                    gap-3
                    rounded-xl
                    px-3
                    py-2.5
                    text-left
                    transition
                    hover:bg-slate-50
                  "
                >

                  <div
                    className="
                      flex
                      h-8
                      w-8
                      items-center
                      justify-center
                      rounded-lg
                      bg-emerald-50
                      text-emerald-600
                    "
                  >

                    <ShieldCheck
                      size={15}
                    />

                  </div>


                  <div>

                    <p
                      className="
                        text-xs
                        font-semibold
                        text-slate-700
                      "
                    >

                      Security

                    </p>


                    <p
                      className="
                        mt-0.5
                        text-[9px]
                        text-slate-400
                      "
                    >

                      Account security options

                    </p>

                  </div>

                </button>

              </div>


              {/* LOGOUT */}

              <div
                className="
                  border-t
                  border-slate-100
                  p-2
                "
              >

                <button
                  type="button"
                  role="menuitem"
                  onClick={
                    handleLogout
                  }
                  className="
                    flex
                    w-full
                    items-center
                    gap-3
                    rounded-xl
                    px-3
                    py-2.5
                    text-left
                    transition
                    hover:bg-red-50
                  "
                >

                  <div
                    className="
                      flex
                      h-8
                      w-8
                      items-center
                      justify-center
                      rounded-lg
                      bg-red-50
                      text-red-500
                    "
                  >

                    <LogOut
                      size={15}
                    />

                  </div>


                  <div>

                    <p
                      className="
                        text-xs
                        font-semibold
                        text-red-600
                      "
                    >

                      Logout

                    </p>


                    <p
                      className="
                        mt-0.5
                        text-[9px]
                        text-red-400
                      "
                    >

                      Exit the current session

                    </p>

                  </div>

                </button>

              </div>

            </div>

          )}

        </div>

      </div>

    </header>

  );

}


export default Header;