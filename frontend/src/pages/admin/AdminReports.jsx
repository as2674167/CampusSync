const AdminReports = () => {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.12),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(99,102,241,0.10),_transparent_24%),linear-gradient(to_bottom,_#f8fbff,_#eef4ff,_#f6f9ff)] py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 overflow-hidden rounded-[30px] border border-white/60 bg-white/80 backdrop-blur-sm shadow-[0_25px_80px_rgba(15,23,42,0.10)]">
          <div className="relative px-6 py-7 sm:px-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.16),_transparent_40%),radial-gradient(circle_at_bottom_right,_rgba(139,92,246,0.12),_transparent_38%)]" />
            <div className="relative">
              <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">
                Admin Panel
              </span>
              <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
                Reports & Analytics
              </h1>
              <p className="mt-2 text-sm text-slate-600 md:text-base">
                System analytics and reporting
              </p>
            </div>
          </div>
        </div>

        {/* Main Analytics Placeholder */}
        <div className="group overflow-hidden rounded-[30px] border border-white/60 bg-white/90 backdrop-blur-sm shadow-[0_25px_80px_rgba(15,23,42,0.12)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_35px_90px_rgba(59,130,246,0.14)]">
          <div className="border-b border-slate-200/70 bg-gradient-to-r from-slate-50 to-white px-6 py-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  Analytics Workspace
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Reports, trends, and system insights will appear here
                </p>
              </div>

              <span className="inline-flex w-fit items-center rounded-full bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm">
                Coming Soon
              </span>
            </div>
          </div>

          <div className="relative px-6 py-14 sm:px-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(59,130,246,0.08),_transparent_45%)] opacity-70" />
            <div className="relative flex flex-col items-center text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-[28px] bg-gradient-to-br from-blue-100 via-indigo-100 to-violet-100 shadow-[0_20px_50px_rgba(79,70,229,0.18)] ring-1 ring-white/70 transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_28px_70px_rgba(79,70,229,0.24)]">
                <svg
                  className="h-10 w-10 text-blue-700 transition-transform duration-300 group-hover:scale-110"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 3v18h18" />
                  <path d="M7 14l3-3 3 2 4-5" />
                  <circle cx="7" cy="14" r="1" />
                  <circle cx="10" cy="11" r="1" />
                  <circle cx="13" cy="13" r="1" />
                  <circle cx="17" cy="8" r="1" />
                </svg>
              </div>

              <h3 className="mt-6 text-2xl font-bold tracking-tight text-slate-900">
                Reports and analytics coming soon
              </h3>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                This section will show performance metrics, registration trends,
                event insights, system summaries, and visual analytics for admin monitoring.
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
                  Event trends
                </span>
                <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
                  Registration data
                </span>
                <span className="inline-flex items-center rounded-full border border-violet-200 bg-violet-50 px-4 py-2 text-xs font-semibold text-violet-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
                  System insights
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Preview cards */}
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-[26px] border border-white/60 bg-white/85 p-5 backdrop-blur-sm shadow-[0_18px_60px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_28px_70px_rgba(59,130,246,0.12)]">
            <p className="text-sm font-medium text-slate-500">Overview</p>
            <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
              KPIs
            </p>
            <p className="mt-1 text-sm text-slate-600">
              High-level system metrics and summary cards will show here.
            </p>
          </div>

          <div className="rounded-[26px] border border-white/60 bg-white/85 p-5 backdrop-blur-sm shadow-[0_18px_60px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_28px_70px_rgba(16,185,129,0.12)]">
            <p className="text-sm font-medium text-slate-500">Performance</p>
            <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
              Trends
            </p>
            <p className="mt-1 text-sm text-slate-600">
              Growth charts and event activity trends will appear in this area.
            </p>
          </div>

          <div className="rounded-[26px] border border-white/60 bg-white/85 p-5 backdrop-blur-sm shadow-[0_18px_60px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_28px_70px_rgba(139,92,246,0.12)]">
            <p className="text-sm font-medium text-slate-500">Reports</p>
            <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
              Insights
            </p>
            <p className="mt-1 text-sm text-slate-600">
              Downloadable summaries and reporting tools can be added here later.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminReports