import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { isLoggedIn } from "../utils/authUtils";
import { api } from "../lib/api";

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const loggedIn=isLoggedIn();
  const user_role=localStorage.getItem("role");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchNotificationCount = async () => {
      if (!loggedIn || !token) {
        setNotificationCount(0);
        return;
      }

      try {
        const res = await api.get("/api/notifications/my", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotificationCount(res.data.unreadCount || 0);
      } catch (err) {
        setNotificationCount(0);
      }
    };

    const refreshOnNotificationUpdate = () => {
      fetchNotificationCount();
    };

    fetchNotificationCount();
    window.addEventListener("notifications-updated", refreshOnNotificationUpdate);

    return () => {
      window.removeEventListener("notifications-updated", refreshOnNotificationUpdate);
    };
  }, [location.pathname, loggedIn, token]);

  const logoutUser = () => {
    localStorage.removeItem("user_name");
    localStorage.removeItem("user_email");
    localStorage.removeItem("role");
    localStorage.removeItem("token");
    navigate("/login");
  };

  const baseLinks = [{ label: "Home", to: "/" }];

  const accountLinks = loggedIn
    ? [
        { label: "Profile", to: "/profile" },
        { label: "Notifications", to: "/notifications" },
      ]
    : [
        { label: "Login", to: "/login" },
        { label: "Sign up", to: "/signup" },
      ];

  const roleLinks = {
    worker: [
      { label: "My Applications", to: "/pending_worker_jobs" },
      { label: "Rejected Applications", to: "/rejected_worker_jobs" },
      { label: "Apply for Job", to: "/apply_for_job" },
      { label: "Pending Offers", to: "/job_offers" },
      { label: "Confirmed Jobs", to: "/Accept_job_offers" },
      { label: "Declined Offers", to: "/rejected_job_offers" },
      { label: "Completed Work", to: "/completed_jobs" },
    ],
    client: [
      { label: "Hired Workers", to: "/recruited" },
      { label: "Pending Approvals", to: "/pending_requests" },
      { label: "Rate Workers", to: "/write_review" },
    ],
    admin: [
      { label: "Approved Jobs", to: "/accepted_applications" },
      { label: "Rejected Jobs", to: "/rejected_applications" },
      { label: "All Workers", to: "/workers_info" },
      { label: "All Clients", to: "/clients_info" },
      { label: "User Management", to: "/admin_management" },
      { label: "Approve Hiring", to: "/allot_worker" },
      { label: "Complaint Reports", to: "/admin_complaints" },
    ],
  };

  const drawerSections = [
    { title: "Navigation", items: baseLinks },
    { title: user_role === "worker" ? "Worker Tools" : user_role === "client" ? "Client Tools" : "Admin Tools", items: user_role ? roleLinks[user_role] || [] : [] },
    { title: "Account", items: accountLinks },
  ].filter((section) => section.items.length > 0);

  return (
    <nav className="nav-glass fixed left-0 top-0 z-50 w-full">
      <div className="page-container">
        <div className="flex items-center justify-between py-4">
          <Link
            className={`flex items-center gap-3 ${loggedIn ? "" : "pointer-events-none opacity-70"}`}
            to={loggedIn ? "/" : "/login"}
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-indigo-500 text-lg font-black text-white shadow-glow">
              FI
            </span>
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-cyan-200/80">Fix It Now</p>
              <p className="text-sm text-slate-300">Smart home services marketplace</p>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            {loggedIn ? (
              <Link
                to="/notifications"
                className="neo-button-secondary relative inline-flex items-center gap-2"
                aria-label="Open notifications"
              >
                <span>Notifications</span>
                {notificationCount > 0 ? (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow-lg shadow-rose-500/30">
                    {notificationCount > 9 ? "9+" : notificationCount}
                  </span>
                ) : null}
              </Link>
            ) : null}
            <button
              type="button"
              className="neo-button-secondary"
              onClick={() => setDrawerOpen((value) => !value)}
              aria-label="Toggle navigation drawer"
            >
              {drawerOpen ? "Close" : "Menu"}
            </button>
          </div>
        </div>
      </div>

      {drawerOpen && <div className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-md transition-opacity duration-300" onClick={() => setDrawerOpen(false)} />}

      <aside
        className={`fixed left-0 top-0 z-50 h-screen w-[340px] max-w-[88vw] transform border-r border-white/10 bg-slate-950 shadow-2xl transition-transform duration-500 ease-out ${drawerOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex h-full flex-col p-6 pt-8">
          <div className="mb-8 flex items-center justify-between border-b border-white/10 pb-6">
            <div>
              <p className="text-[11px] uppercase tracking-[0.3em] text-slate-500 font-semibold">Menu</p>
              <h2 className="mt-2 text-2xl font-black text-white">Navigation</h2>
            </div>
            <button type="button" className="neo-button-secondary text-xl leading-none" onClick={() => setDrawerOpen(false)}>
              ×
            </button>
          </div>

          <div className="space-y-8 overflow-y-auto flex-1 pr-2">
            {drawerSections.map((section) => (
              <section key={section.title} className="space-y-3">
                <div className="px-2 text-[10px] uppercase tracking-[0.25em] text-slate-500 font-semibold">
                  {section.title}
                </div>
                <div className="space-y-2">
                  {section.items.map((item) => (
                    <Link 
                      key={item.to} 
                      to={item.to} 
                      className={`block px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                        location.pathname === item.to
                          ? "bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 text-cyan-300 border border-cyan-400/30"
                          : "text-slate-300 hover:bg-slate-800/50 hover:text-white"
                      }`}
                      onClick={() => setDrawerOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <div className="mt-auto space-y-3 border-t border-white/10 pt-6">
            {loggedIn ? (
              <>
                <Link 
                  to="/profile" 
                  className="block w-full px-4 py-3 rounded-lg text-sm font-medium text-slate-300 bg-slate-800/30 hover:bg-slate-800/60 transition-colors text-center" 
                  onClick={() => setDrawerOpen(false)}
                >
                  Profile
                </Link>
                <button 
                  type="button" 
                  onClick={logoutUser} 
                  className="w-full px-4 py-3 rounded-lg text-sm font-medium text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-400/20 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link 
                  to="/login" 
                  className="block px-4 py-3 rounded-lg text-sm font-medium text-slate-300 bg-slate-800/30 hover:bg-slate-800/60 transition-colors text-center" 
                  onClick={() => setDrawerOpen(false)}
                >
                  Login
                </Link>
                <Link 
                  to="/signup" 
                  className="block px-4 py-3 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-cyan-500/30 to-indigo-500/30 hover:from-cyan-500/40 hover:to-indigo-500/40 border border-cyan-400/20 transition-colors text-center" 
                  onClick={() => setDrawerOpen(false)}
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </aside>
    </nav>
  );
}

export default Navbar;
