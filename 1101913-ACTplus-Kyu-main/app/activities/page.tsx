"use client";

import Link from "next/link";
import { useEffect, useState, ChangeEvent } from "react";
import { useSession } from "next-auth/react";
import ActivityCreateForm from "@/app/components/ActivityCreateForm";
import { canUserCreateActivity } from "@/lib/permissions";

type Status = { code: "upcoming" | "ongoing" | "ended"; label: string; color: "green" | "yellow" | "red" };

type ActivitySkill = {
  id: number;
  code: string;
  name: string;
  color: string;
  points: number;
};

type ActivityListItem = {
  id: number;
  title: string;
  content?: string;
  detail?: string;
  imageUrl?: string;
  lecturer: number;
  start_date: string;
  end_date: string;
  skillTitles: string[];
  skills: ActivitySkill[];
  participantCount: number;
  status: Status;
};

type ListResponse = {
  items: ActivityListItem[];
  total: number;
  page: number;
  totalPages: number;
  pageSize: number;
};

const PAGE_SIZE = 12 as const;

function formatRange(startISO: string, endISO: string) {
  const opts: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  };
  const s = new Date(startISO);
  const e = new Date(endISO);
  return `${s.toLocaleString(undefined, opts)} – ${e.toLocaleString(undefined, opts)}`;
}

function StatusBadge({ status }: { status: Status }) {
  // ทุกสถานะใช้โทนส้มอ่อนเป็นหลัก
  return (
    <span className="inline-flex items-center text-xs font-medium rounded-full px-3 py-1 border border-orange-200 bg-orange-50 text-orange-700">
      {status.label}
    </span>
  );
}

function SkillsBadge({ skills, maxDisplay = 3 }: { skills: ActivitySkill[]; maxDisplay?: number }) {
  if (skills.length === 0) {
    return <span className="text-xs text-gray-400">No skills</span>;
  }

  const displaySkills = skills.slice(0, maxDisplay);
  const remainingCount = Math.max(0, skills.length - maxDisplay);

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {displaySkills.map((skill) => (
        <span
          key={skill.id}
          className="inline-flex items-center gap-1 text-xs bg-orange-100 text-orange-700 rounded-full px-2 py-1 font-medium border border-orange-200"
        >
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: skill.color }}></div>
          {skill.code}
          <span className="text-orange-500">+{skill.points}</span>
        </span>
      ))}
      {remainingCount > 0 && (
        <span className="inline-flex items-center text-xs bg-orange-200 text-orange-600 rounded-full px-2 py-1 border border-orange-300">
          +{remainingCount} more
        </span>
      )}
    </div>
  );
}

function buildPageList(current: number, totalPages: number): (number | "gap")[] {
  const raw: number[] = [];
  for (let p = 1; p <= totalPages; p++) {
    if (p === 1 || p === totalPages || Math.abs(p - current) <= 1) raw.push(p);
  }
  const compact: (number | "gap")[] = [];
  raw.forEach((p, i) => {
    if (i > 0 && p - raw[i - 1] > 1) compact.push("gap");
    compact.push(p);
  });
  return compact;
}

export default function ActivitiesPage() {
  const { data: session } = useSession();
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");
  const [page, setPage] = useState(1);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [data, setData] = useState<ListResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const user = session?.user;
  const canCreate = user ? canUserCreateActivity(user) : false;

  useEffect(() => {
    let stop = false;
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const u = new URL("/api/v0/activities", window.location.origin);
        if (q) u.searchParams.set("q", q);
        u.searchParams.set("sort", sort);
        u.searchParams.set("page", String(page));
        u.searchParams.set("pageSize", String(PAGE_SIZE));

        const res = await fetch(u.toString(), { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as ListResponse;
        if (!stop) setData(json);
      } catch (e: any) {
        if (!stop) setErr(e?.message ?? "Fetch failed");
      } finally {
        if (!stop) setLoading(false);
      }
    })();
    return () => {
      stop = true;
    };
  }, [q, sort, page]);

  useEffect(() => {
    setPage(1);
  }, [q, sort]);

  function onChange(e: ChangeEvent<HTMLInputElement>) {
    setQ(e.target.value);
  }

  const handleCreateSuccess = (activityId: number) => {
    setShowCreateForm(false);
    window.location.reload();
  };

  const pageItems = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const startIdx = (page - 1) * PAGE_SIZE;
  const pageList = buildPageList(page, totalPages);

  return (
    <>
      <section className="max-w-6xl mx-auto p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Activities</h1>
          <div className="flex items-center gap-3">
            {canCreate && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 transition-colors"
              >
                Create Activity
              </button>
            )}
            <input
              type="text"
              placeholder="Search activities..."
              value={q}
              onChange={onChange}
              className="w-64 rounded-xl border border-orange-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all"
            />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as "newest" | "oldest")}
              className="rounded-xl border border-orange-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </div>
        </div>

        {loading && !data ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
          </div>
        ) : err ? (
          <div className="text-center py-8">
            <p className="text-red-500 mb-4">Error: {err}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Retry
            </button>
          </div>
        ) : pageItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {q ? `No activities found for "${q}"` : "No activities yet"}
            </h3>
            <p className="text-gray-700 mb-6">
              {q ? "Try adjusting your search terms" : "Get started by creating your first activity"}
            </p>
            {canCreate && !q && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="px-6 py-3 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition-colors"
              >
                Create First Activity
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {pageItems.map((activity) => (
                <div
                  key={activity.id}
                  className="bg-white rounded-2xl border border-orange-100 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                >
                  {/* Image */}
                  <div className="aspect-[16/10] bg-gray-100 relative overflow-hidden">
                    {activity.imageUrl ? (
                      <img
                        src={activity.imageUrl}
                        alt={activity.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                        <div className="text-4xl text-orange-400">🎯</div>
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      <StatusBadge status={activity.status} />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 space-y-4">
                    <h3 className="font-semibold text-gray-900 line-clamp-2 leading-snug tracking-tight">
                      {activity.title}
                    </h3>
                    {activity.content && (
                      <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">{activity.content}</p>
                    )}
                    <div className="text-xs text-gray-500 bg-orange-50 rounded px-2 py-1 inline-block">
                      {formatRange(activity.start_date, activity.end_date || activity.start_date)}
                    </div>
                    <div>
                      <div className="text-xs font-medium text-gray-700 mb-1">Skills Development:</div>
                      <SkillsBadge skills={activity.skills} maxDisplay={3} />
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-orange-100">
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{activity.participantCount} joined</span>
                      </div>
                      <Link
                        href={`/activities/${activity.id}`}
                        className="inline-flex items-center px-3 py-1.5 bg-orange-600 text-white text-sm font-medium rounded-md hover:bg-orange-700 transition-colors"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-orange-200 rounded-lg hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </button>

              <div className="flex items-center gap-1">
                {pageList.map((p, idx) =>
                  p === "gap" ? (
                    <span key={`gap-${idx}`} className="px-2 text-sm text-gray-400">
                      …
                    </span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-10 h-10 text-sm font-medium rounded-lg ${
                        p === page
                          ? "bg-orange-600 text-white"
                          : "text-gray-500 bg-white border border-orange-200 hover:bg-orange-50"
                      } transition-colors`}
                    >
                      {p}
                    </button>
                  )
                )}
              </div>

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-orange-200 rounded-lg hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <p className="text-center text-sm text-gray-500 mt-4">
              Showing {startIdx + 1}-{Math.min(startIdx + PAGE_SIZE, total)} of {total} activities
            </p>
          </>
        )}
      </section>

      {showCreateForm && canCreate && (
        <ActivityCreateForm onSuccess={handleCreateSuccess} onCancel={() => setShowCreateForm(false)} />
      )}
    </>
  );
}
