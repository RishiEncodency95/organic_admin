"use client";

import {
  useEffect,
  useMemo,
  useState,
  type ComponentType,
  type CSSProperties,
  type ReactNode,
} from "react";
import Link from "next/link";

import {
  ArrowRight,
  ArrowUp,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock3,
  Download,
  Eye,
  Filter,
  MapPin,
  MoreVertical,
  Phone,
  Plus,
  RotateCcw,
  Search,
  Send,
  UserPlus,
  Users,
  UsersRound,
} from "lucide-react";

import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";

import { volunteersApi } from "@/lib/volunteersApi";
import {
  VolunteerSummary,
  VolunteerStatus,
} from "@/lib/types";

import {
  VOLUNTEER_STATUS_META,
  VOLUNTEER_AVAILABILITY_META,
  formatDate,
  formatDateTime,
} from "@/lib/statusMeta";

import { ApiRequestError } from "@/lib/api";

/* ============================================================
   EXTENDED TYPE
============================================================ */

type RuntimeVolunteer = VolunteerSummary & {
  contributedHours?: number;
  hoursContributed?: number;
};

/* ============================================================
   STATUS OPTIONS
============================================================ */

const STATUS_OPTIONS: {
  key: VolunteerStatus | "";
  label: string;
}[] = [
    { key: "", label: "All Status" },
    { key: "ACTIVE", label: "Active" },
    { key: "INACTIVE", label: "Inactive" },
    { key: "BLACKLISTED", label: "Blacklisted" },
  ];

/* ============================================================
   HELPERS
============================================================ */

function parseDate(value?: string) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function isCurrentMonth(value?: string) {
  const date = parseDate(value);
  if (!date) return false;

  const now = new Date();

  return (
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  );
}

function percentage(value: number, total: number) {
  if (!total) return 0;
  return (value / total) * 100;
}

function getVolunteerRole(volunteer: VolunteerSummary) {
  return (
    volunteer.assignedRole?.trim() ||
    volunteer.preferredRole?.trim() ||
    volunteer.skills?.[0]?.trim() ||
    "General Support"
  );
}

function getVolunteerLocation(volunteer: VolunteerSummary) {
  return (
    volunteer.assignedArea?.trim() ||
    volunteer.city?.trim() ||
    "Other"
  );
}

function getInitials(volunteer: VolunteerSummary) {
  const name = volunteer.name?.trim() || "Volunteer";

  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
}

function getHours(volunteer: VolunteerSummary) {
  const runtime = volunteer as RuntimeVolunteer;

  if (
    typeof runtime.contributedHours === "number" &&
    Number.isFinite(runtime.contributedHours)
  ) {
    return runtime.contributedHours;
  }

  if (
    typeof runtime.hoursContributed === "number" &&
    Number.isFinite(runtime.hoursContributed)
  ) {
    return runtime.hoursContributed;
  }

  const parsed = Number.parseFloat(
    String(volunteer.hoursPerWeek ?? "").replace(/[^\d.]/g, "")
  );

  return Number.isFinite(parsed) ? parsed : 0;
}

function statusBadgeStyle(status: VolunteerStatus) {
  switch (status) {
    case "ACTIVE":
      return {
        background: "#E6F5E9",
        color: "#298149",
        border: "#D2EBD7",
      };

    case "INACTIVE":
      return {
        background: "#FDE9E9",
        color: "#E15151",
        border: "#F7D7D7",
      };

    case "BLACKLISTED":
      return {
        background: "#FEECEC",
        color: "#C83737",
        border: "#F7D0D0",
      };

    default:
      return {
        background: "#F1F3F6",
        color: "#56627C",
        border: "#E2E6EB",
      };
  }
}

function skillStyle(skill?: string) {
  const value = skill?.toLowerCase() ?? "";

  if (
    value.includes("driver") ||
    value.includes("medical") ||
    value.includes("paramedic")
  ) {
    return {
      background: "#E8F2FE",
      color: "#2B76CD",
    };
  }

  if (
    value.includes("organ") ||
    value.includes("night") ||
    value.includes("coordination")
  ) {
    return {
      background: "#F1E8FD",
      color: "#8649D3",
    };
  }

  if (
    value.includes("document") ||
    value.includes("food")
  ) {
    return {
      background: "#FFF0DC",
      color: "#E28D18",
    };
  }

  if (
    value.includes("ritual") ||
    value.includes("puja")
  ) {
    return {
      background: "#FCE8EC",
      color: "#DA5770",
    };
  }

  return {
    background: "#E5F5E8",
    color: "#2A834B",
  };
}

/* ============================================================
   STAT CARD
============================================================ */

type StatCardProps = {
  label: string;
  value: string | number;
  change?: string;
  compare?: string;

  icon: ComponentType<{
    size?: number;
    strokeWidth?: number;
    style?: CSSProperties;
  }>;

  iconBg: string;
  iconColor: string;
};

function StatCard({
  label,
  value,
  change,
  compare = "current data",
  icon: Icon,
  iconBg,
  iconColor,
}: StatCardProps) {
  return (
    <div className="flex flex-col justify-between h-[102px] min-w-0 rounded-[7px] border border-[#E2E6EB] bg-white px-[10px] py-[9px]">
      {/* TOP: Full Label Content - Only label shifted left */}
      <div className="w-full text-left">
        <p className="-ml-[2px] whitespace-nowrap text-[8.5px] font-semibold uppercase tracking-wider text-[#172762] text-left">
          {label}
        </p>
      </div>

      {/* MIDDLE ROW: Icon + Number Value (Strict Left Aligned) */}
      <div className="mt-[4px] flex w-full items-center justify-start gap-[6px]">
        <div
          className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: iconBg }}
        >
          <Icon
            size={18}
            strokeWidth={2}
            style={{ color: iconColor }}
          />
        </div>

        <div className="whitespace-nowrap text-2xl font-semibold leading-none text-[#182B68] text-left">
          {value}
        </div>
      </div>

      <div className="flex w-full items-center justify-start gap-[4px] whitespace-nowrap text-left">
        {change === "Live" || !change ? (
          <span className="rounded-[4px] bg-[#E4F5E8] px-[5px] py-[1px] text-[9px] font-semibold text-[#238B4C]">
            Live
          </span>
        ) : (
          <>
            <ArrowUp
              size={10}
              strokeWidth={3}
              className="shrink-0 text-[#168F49]"
            />

            <span className="text-[9px] font-semibold text-[#168F49]">
              {change}
            </span>
          </>
        )}

        <span className="text-[9px] font-semibold text-[#526080]">
          {compare}
        </span>
      </div>
    </div>
  );
}

/* ============================================================
   FILTER SELECT
============================================================ */

function FilterSelect({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <div className="relative min-w-0">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-[40px] w-full appearance-none rounded-[6px] border border-[#E0E5EB] bg-white px-[11px] pr-[29px] text-[10px] font-semibold text-[#172762] outline-none"
      >
        {children}
      </select>

      <ChevronDown
        size={12}
        className="pointer-events-none absolute right-[10px] top-1/2 -translate-y-1/2 text-[#172762]"
      />
    </div>
  );
}

/* ============================================================
   EXACT REFERENCE MAP ASSET
============================================================ */

function IndiaMiniMap() {
  return (
    <div className="flex h-[145px] w-[145px] shrink-0 items-center justify-center overflow-hidden bg-white">
      <img
        src="/assets/india-map-exact-reference.png"
        alt="India volunteer locations"
        className="h-[138px] w-[124px] object-contain"
      />
    </div>
  );
}

/* ============================================================
   PAGE
============================================================ */

export default function VolunteersPage() {
  const [volunteers, setVolunteers] =
    useState<VolunteerSummary[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [tab, setTab] =
    useState<VolunteerStatus | "">("");

  const [search, setSearch] =
    useState("");

  const [roleFilter, setRoleFilter] =
    useState("");

  const [locationFilter, setLocationFilter] =
    useState("");

  const [availabilityFilter, setAvailabilityFilter] =
    useState("");

  const [selected, setSelected] =
    useState<VolunteerSummary | null>(null);

  const [busyId, setBusyId] =
    useState<string | null>(null);

  const [error, setError] =
    useState("");

  const [page, setPage] =
    useState(1);

  const [perPage, setPerPage] =
    useState(10);

  const [officeForm, setOfficeForm] =
    useState({
      verified: false,
      assignedRole: "",
      assignedArea: "",
      joiningDate: "",
    });

  const [officeSaving, setOfficeSaving] =
    useState(false);

  const [officeError, setOfficeError] =
    useState("");

  /* OFFICE FORM */

  useEffect(() => {
    if (!selected) return;

    setOfficeForm({
      verified: selected.verified ?? false,
      assignedRole: selected.assignedRole ?? "",
      assignedArea: selected.assignedArea ?? "",
      joiningDate: selected.joiningDate
        ? selected.joiningDate.slice(0, 10)
        : "",
    });

    setOfficeError("");
  }, [selected?._id]);

  /* LOAD */

  const load = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await volunteersApi.list();
      setVolunteers(data ?? []);
    } catch (err) {
      setError(
        err instanceof ApiRequestError
          ? err.message
          : "Could not load volunteers."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  /* OFFICE SAVE */

  const saveOfficeUse = async () => {
    if (!selected) return;

    setOfficeSaving(true);
    setOfficeError("");

    try {
      const updated =
        await volunteersApi.updateOfficeUse(
          selected._id,
          {
            verified: officeForm.verified,
            assignedRole: officeForm.assignedRole,
            assignedArea: officeForm.assignedArea,
            joiningDate: officeForm.joiningDate || null,
          }
        );

      setSelected(updated);

      setVolunteers((current) =>
        current.map((volunteer) =>
          volunteer._id === updated._id
            ? updated
            : volunteer
        )
      );
    } catch (err) {
      setOfficeError(
        err instanceof ApiRequestError
          ? err.message
          : "Could not update this volunteer's record."
      );
    } finally {
      setOfficeSaving(false);
    }
  };

  /* DELETE */

  const handleDelete = async (
    volunteer: VolunteerSummary
  ) => {
    const confirmed =
      window.confirm(
        `Delete ${volunteer.name ??
        "this volunteer"
        }? This also removes their login account and cannot be undone.`
      );

    if (!confirmed) return;

    setBusyId(volunteer._id);
    setError("");

    try {
      await volunteersApi.remove(
        volunteer._id
      );

      setVolunteers((current) =>
        current.filter(
          (item) =>
            item._id !==
            volunteer._id
        )
      );

      setSelected(null);
    } catch (err) {
      setError(
        err instanceof ApiRequestError
          ? err.message
          : "Could not delete this volunteer."
      );
    } finally {
      setBusyId(null);
    }
  };

  /* STATUS */

  const handleStatusChange =
    async (
      id: string,
      status: VolunteerStatus
    ) => {
      setBusyId(id);
      setError("");

      try {
        await volunteersApi.updateStatus(
          id,
          status
        );

        await load();

        setSelected((current) =>
          current?._id === id
            ? {
              ...current,
              status,
            }
            : current
        );
      } catch (err) {
        setError(
          err instanceof ApiRequestError
            ? err.message
            : "Could not update volunteer status."
        );
      } finally {
        setBusyId(null);
      }
    };

  /* PDF */

  const handlePrint = async (
    volunteer: VolunteerSummary
  ) => {
    setError("");

    try {
      const pdf =
        await volunteersApi.pdf(
          volunteer._id
        );

      const url =
        URL.createObjectURL(pdf);

      const link =
        document.createElement("a");

      link.href = url;

      link.download = `moksha-sewa-volunteer-${volunteer.name ??
        volunteer._id
        }.pdf`;

      document.body.appendChild(link);

      link.click();
      link.remove();

      window.setTimeout(
        () =>
          URL.revokeObjectURL(url),
        10000
      );
    } catch {
      setError(
        "Could not download the volunteer registration PDF. Please try again."
      );
    }
  };

  /* STATS */

  const totalVolunteers =
    volunteers.length;

  const newThisMonth =
    useMemo(
      () =>
        volunteers.filter(
          (volunteer) =>
            isCurrentMonth(
              volunteer.createdAt
            )
        ).length,
      [volunteers]
    );

  const activeVolunteers =
    useMemo(
      () =>
        volunteers.filter(
          (volunteer) =>
            volunteer.status ===
            "ACTIVE"
        ).length,
      [volunteers]
    );

  const inactiveVolunteers =
    useMemo(
      () =>
        volunteers.filter(
          (volunteer) =>
            volunteer.status !==
            "ACTIVE"
        ).length,
      [volunteers]
    );

  const hoursContributed =
    useMemo(
      () =>
        volunteers.reduce(
          (total, volunteer) =>
            total +
            getHours(volunteer),
          0
        ),
      [volunteers]
    );

  const assignments =
    useMemo(
      () =>
        volunteers.reduce(
          (total, volunteer) =>
            total +
            Number(
              volunteer.totalAssignments ??
              0
            ),
          0
        ),
      [volunteers]
    );

  /* FILTER OPTIONS */

  const roles = useMemo(() => {
    return Array.from(
      new Set(
        volunteers.map(
          getVolunteerRole
        )
      )
    )
      .filter(Boolean)
      .sort();
  }, [volunteers]);

  const locations = useMemo(() => {
    return Array.from(
      new Set(
        volunteers.map(
          getVolunteerLocation
        )
      )
    )
      .filter(Boolean)
      .sort();
  }, [volunteers]);

  const availabilities =
    useMemo(() => {
      return Array.from(
        new Set(
          volunteers
            .map((volunteer) =>
              volunteer.availability
                ? String(
                  volunteer.availability
                )
                : ""
            )
            .filter(Boolean)
        )
      );
    }, [volunteers]);

  /* FILTERED */

  const visible = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    return volunteers
      .filter((volunteer) => {
        if (!tab) return true;
        return volunteer.status === tab;
      })
      .filter((volunteer) => {
        if (!roleFilter) return true;

        return (
          getVolunteerRole(
            volunteer
          ) === roleFilter
        );
      })
      .filter((volunteer) => {
        if (!locationFilter) return true;

        return (
          getVolunteerLocation(
            volunteer
          ) === locationFilter
        );
      })
      .filter((volunteer) => {
        if (!availabilityFilter) {
          return true;
        }

        return (
          String(
            volunteer.availability
          ) ===
          availabilityFilter
        );
      })
      .filter((volunteer) => {
        if (!query) return true;

        return [
          volunteer.code,
          volunteer.name,
          volunteer.email,
          volunteer.phone,
          volunteer.city,
          volunteer.state,
          volunteer.assignedArea,
          volunteer.assignedRole,
          volunteer.preferredRole,
          ...(volunteer.skills ?? []),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(query);
      })
      .sort((a, b) => {
        const first =
          parseDate(
            a.createdAt
          )?.getTime() ?? 0;

        const second =
          parseDate(
            b.createdAt
          )?.getTime() ?? 0;

        return second - first;
      });
  }, [
    volunteers,
    tab,
    roleFilter,
    locationFilter,
    availabilityFilter,
    search,
  ]);

  /* PAGINATION */

  const totalPages = Math.max(
    1,
    Math.ceil(
      visible.length / perPage
    )
  );

  const safePage = Math.min(
    page,
    totalPages
  );

  const startIndex =
    (safePage - 1) * perPage;

  const endIndex = Math.min(
    startIndex + perPage,
    visible.length
  );

  const pageRows = visible.slice(
    startIndex,
    endIndex
  );

  /* ROLE STATS */

  const roleStats =
    useMemo(() => {
      const map = new Map<
        string,
        number
      >();

      volunteers.forEach(
        (volunteer) => {
          const role =
            getVolunteerRole(
              volunteer
            );

          map.set(
            role,
            (map.get(role) ?? 0) + 1
          );
        }
      );

      const sorted =
        Array.from(
          map.entries()
        ).sort(
          (a, b) =>
            b[1] - a[1]
        );

      const top =
        sorted.slice(0, 5);

      const otherCount =
        sorted
          .slice(5)
          .reduce(
            (sum, [, count]) =>
              sum + count,
            0
          );

      if (otherCount > 0) {
        top.push([
          "Others",
          otherCount,
        ]);
      }

      return top.map(
        ([label, value]) => ({
          label,
          value,
          percentage:
            percentage(
              value,
              totalVolunteers
            ),
        })
      );
    }, [
      volunteers,
      totalVolunteers,
    ]);

  const maxRole = Math.max(
    ...roleStats.map(
      (item) => item.value
    ),
    1
  );

  const roleColors = [
    "#2BA15D",
    "#2782E2",
    "#8547DA",
    "#F29C19",
    "#1895A4",
    "#7C94B2",
  ];

  /* LOCATION STATS */

  const locationStats =
    useMemo(() => {
      const map = new Map<
        string,
        number
      >();

      volunteers.forEach(
        (volunteer) => {
          const location =
            getVolunteerLocation(
              volunteer
            );

          map.set(
            location,
            (map.get(location) ?? 0) +
            1
          );
        }
      );

      const sorted =
        Array.from(
          map.entries()
        ).sort(
          (a, b) =>
            b[1] - a[1]
        );

      const top =
        sorted.slice(0, 3);

      const others =
        sorted
          .slice(3)
          .reduce(
            (sum, [, count]) =>
              sum + count,
            0
          );

      if (others > 0) {
        top.push([
          "Other",
          others,
        ]);
      }

      return top.map(
        ([label, value]) => ({
          label,
          value,
          percentage:
            percentage(
              value,
              totalVolunteers
            ),
        })
      );
    }, [
      volunteers,
      totalVolunteers,
    ]);

  function resetFilters() {
    setSearch("");
    setTab("");
    setRoleFilter("");
    setLocationFilter("");
    setAvailabilityFilter("");
    setPage(1);
  }

  return (
    <section className="w-full min-w-0 bg-white px-[16px] pb-[16px] pt-[11px]">
      {/* HEADER */}

      <div className="flex items-start justify-between gap-[20px]">
        <div>
          <h1 className="text-[20px] font-semibold leading-[25px] tracking-[-0.35px] text-[#005E2E]">
            Volunteers
          </h1>

          <p className="mt-[2px] text-[10px] font-semibold leading-[16px] text-[#344574]">
            Manage volunteers, track engagement and assignments.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-[12px] pt-[2px]">
          <button
            type="button"
            className="flex h-[36px] items-center gap-[8px] rounded-[5px] border border-[#E0E5EB] bg-white px-[15px] text-[10px] font-semibold text-[#172762]"
          >
            <Download size={14} />
            Import Volunteers
          </button>

          <Link
            href="/volunteers/new"
            className="flex h-[36px] items-center gap-[8px] rounded-[5px] bg-[#005F2E] px-[17px] text-[10px] font-semibold text-white shadow-[0_2px_5px_rgba(0,95,46,0.13)] hover:bg-[#004d25] transition"
          >
            <Plus size={15} />
            Add New Volunteer
          </Link>
        </div>
      </div>

      {error && (
        <div className="mt-[10px] rounded-[6px] border border-red-200 bg-red-50 px-[11px] py-[8px] text-[10px] font-semibold text-red-700">
          {error}
        </div>
      )}

      {/* MAIN GRID */}

      <div className="mt-[22px] grid min-w-0 grid-cols-[minmax(0,1fr)_255px] gap-[16px]">
        {/* LEFT */}

        <main className="min-w-0 overflow-hidden">
          {/* STATS */}

          <div className="grid min-w-0 grid-cols-5 gap-[10px]">
            <StatCard
              label="Total Volunteers"
              value={totalVolunteers}
              change="Live"
              icon={UsersRound}
              iconBg="#E5F5E9"
              iconColor="#178D43"
            />

            <StatCard
              label="New This Month"
              value={newThisMonth}
              change={`${percentage(
                newThisMonth,
                totalVolunteers
              ).toFixed(1)}%`}
              compare="of total"
              icon={UserPlus}
              iconBg="#E8F2FF"
              iconColor="#2874D1"
            />

            <StatCard
              label="Active Volunteers"
              value={activeVolunteers}
              change={`${percentage(
                activeVolunteers,
                totalVolunteers
              ).toFixed(1)}%`}
              compare="of total"
              icon={Users}
              iconBg="#F0E7FD"
              iconColor="#8948D5"
            />

            <StatCard
              label="Hours Contributed"
              value={
                Number.isInteger(
                  hoursContributed
                )
                  ? hoursContributed.toLocaleString(
                    "en-IN"
                  )
                  : hoursContributed.toLocaleString(
                    "en-IN",
                    {
                      maximumFractionDigits: 1,
                    }
                  )
              }
              change="Live"
              icon={Clock3}
              iconBg="#FFF0D9"
              iconColor="#EB9217"
            />

            <StatCard
              label="Assignments"
              value={assignments.toLocaleString(
                "en-IN"
              )}
              change="Live"
              icon={ClipboardList}
              iconBg="#E1F5F7"
              iconColor="#1694A5"
            />
          </div>

          {/* FILTERS */}

          <div className="mt-[20px] grid min-w-0 max-w-[calc(100%-18px)] grid-cols-[minmax(190px,1.8fr)_116px_122px_122px_132px_70px_70px] gap-[8px]">
            <div className="flex h-[40px] min-w-0 items-center rounded-[6px] border border-[#E0E5EB] bg-white px-[11px]">
              <Search
                size={15}
                className="mr-[8px] shrink-0 text-[#263D7A]"
              />

              <input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Search by name, email or phone..."
                className="h-full min-w-0 flex-1 bg-transparent text-[10px] font-semibold text-[#172762] outline-none placeholder:text-[#566483]"
              />
            </div>

            <FilterSelect
              value={tab}
              onChange={(value) => {
                setTab(value as VolunteerStatus | "");
                setPage(1);
              }}
            >
              {STATUS_OPTIONS.map(
                (item) => (
                  <option
                    key={item.key}
                    value={item.key}
                  >
                    {item.label}
                  </option>
                )
              )}
            </FilterSelect>

            <FilterSelect
              value={roleFilter}
              onChange={(value) => {
                setRoleFilter(value);
                setPage(1);
              }}
            >
              <option value="">
                All Roles
              </option>

              {roles.map((role) => (
                <option
                  key={role}
                  value={role}
                >
                  {role}
                </option>
              ))}
            </FilterSelect>

            <FilterSelect
              value={locationFilter}
              onChange={(value) => {
                setLocationFilter(value);
                setPage(1);
              }}
            >
              <option value="">
                All Locations
              </option>

              {locations.map(
                (location) => (
                  <option
                    key={location}
                    value={location}
                  >
                    {location}
                  </option>
                )
              )}
            </FilterSelect>

            <FilterSelect
              value={availabilityFilter}
              onChange={(value) => {
                setAvailabilityFilter(value);
                setPage(1);
              }}
            >
              <option value="">
                All Availability
              </option>

              {availabilities.map(
                (value) => {
                  const meta =
                    VOLUNTEER_AVAILABILITY_META[
                    value as keyof typeof VOLUNTEER_AVAILABILITY_META
                    ];

                  return (
                    <option
                      key={value}
                      value={value}
                    >
                      {meta?.label ?? value}
                    </option>
                  );
                }
              )}
            </FilterSelect>

            <button
              type="button"
              className="flex h-[40px] items-center justify-center gap-[4px] rounded-[6px] border border-[#E0E5EB] bg-white text-[10px] font-semibold text-[#172762]"
            >
              <Filter size={12} />
              Filters
            </button>

            <button
              type="button"
              onClick={resetFilters}
              className="flex h-[40px] items-center justify-center gap-[4px] rounded-[6px] border border-[#E0E5EB] bg-white text-[10px] font-semibold text-[#172762]"
            >
              <RotateCcw size={12} />
              Reset
            </button>
          </div>

          {/* DIRECTORY */}

          <div className="mt-[11px] min-w-0 overflow-hidden rounded-[6px] border border-[#E2E6EB] bg-white">
            <div className="flex h-[36px] items-center gap-[9px] border-b border-[#EEF0F3] px-[10px]">
              <h2 className="text-[10px] font-semibold text-[#203674]">
                Volunteer Directory
              </h2>

              <span className="rounded-full bg-[#E5F5E8] px-[8px] py-[3px] text-[10px] font-semibold text-[#2D8249]">
                {totalVolunteers} Volunteers
              </span>
            </div>

            <table className="w-full table-fixed border-collapse">
              <colgroup>
                <col style={{ width: "10%" }} />
                <col style={{ width: "16%" }} />
                <col style={{ width: "14%" }} />
                <col style={{ width: "19%" }} />
                <col style={{ width: "12%" }} />
                <col style={{ width: "10%" }} />
                <col style={{ width: "11%" }} />
                <col style={{ width: "8%" }} />
              </colgroup>

              <thead>
                <tr className="h-[34px] bg-[#F7F8FC] text-left text-[#172762]">
                  <th className="px-[8px] text-[10px] font-semibold uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-[8px] text-[10px] font-semibold uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-[7px] text-[10px] font-semibold uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-[7px] text-[10px] font-semibold uppercase tracking-wider">
                    Role / Skills
                  </th>
                  <th className="px-[7px] text-[10px] font-semibold uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-[7px] text-[10px] font-semibold uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-[7px] text-[10px] font-semibold uppercase tracking-wider">
                    Joined On
                  </th>
                  <th className="px-[5px] text-[10px] font-semibold uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading &&
                  Array.from({
                    length: 8,
                  }).map(
                    (_, index) => (
                      <tr
                        key={`loading-${index}`}
                        className="h-[61px] border-t border-[#E9ECF0]"
                      >
                        <td
                          colSpan={8}
                          className="px-[10px]"
                        >
                          <div className="h-[11px] w-full animate-pulse rounded bg-[#F1F3F5]" />
                        </td>
                      </tr>
                    )
                  )}

                {!loading &&
                  pageRows.map(
                    (volunteer) => {
                      const role =
                        getVolunteerRole(volunteer);

                      const skills =
                        volunteer.skills ?? [];

                      const mainSkill =
                        skills[0] ||
                        volunteer.preferredRole ||
                        "Volunteer";

                      const skillMeta =
                        skillStyle(mainSkill);

                      const statusMeta =
                        statusBadgeStyle(volunteer.status);

                      return (
                        <tr
                          key={volunteer._id}
                          onClick={() =>
                            setSelected(volunteer)
                          }
                          className="h-[61px] cursor-pointer border-t border-[#E9ECF0] bg-white hover:bg-[#FBFCFD]"
                        >
                          <td className="px-[8px] align-middle">
                            <span className="block truncate text-[10px] font-semibold text-[#14763F]">
                              {volunteer.code ||
                                volunteer._id}
                            </span>
                          </td>

                          <td className="min-w-0 px-[8px] align-middle">
                            <div className="flex min-w-0 items-center gap-[7px]">
                              {volunteer.photographUrl ? (
                                <img
                                  src={volunteer.photographUrl}
                                  alt={volunteer.name || "Volunteer"}
                                  className="h-[30px] w-[30px] shrink-0 rounded-full border border-[#E5E8EC] object-cover"
                                />
                              ) : (
                                <div className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full bg-[#E7F2E9] text-[10px] font-semibold text-[#297846]">
                                  {getInitials(volunteer)}
                                </div>
                              )}

                              <div className="min-w-0 overflow-hidden">
                                <p className="truncate text-[10px] font-semibold leading-[14px] text-[#192B66]">
                                  {volunteer.name || "—"}
                                </p>

                                <p className="mt-[3px] truncate text-[10px] font-semibold leading-[12px] text-[#506081]">
                                  {volunteer.email || "—"}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-[7px] align-middle">
                            <div className="flex items-center gap-[6px]">
                              <Phone
                                size={10}
                                className="shrink-0 text-[#53618A]"
                              />

                              <span className="whitespace-nowrap text-[10px] font-semibold text-[#344677]">
                                {volunteer.phone || "—"}
                              </span>
                            </div>
                          </td>

                          <td className="min-w-0 px-[7px] align-middle">
                            <p className="truncate text-[10px] font-semibold leading-[14px] text-[#26396F]">
                              {role}
                            </p>

                            <span
                              className="mt-[3px] inline-flex max-w-full rounded-[4px] px-[6px] py-[3px] text-[10px] font-semibold leading-none"
                              style={{
                                backgroundColor:
                                  skillMeta.background,
                                color:
                                  skillMeta.color,
                              }}
                            >
                              <span className="truncate">
                                {mainSkill}
                              </span>
                            </span>
                          </td>

                          <td className="px-[7px] align-middle">
                            <div className="flex min-w-0 items-center gap-[5px]">
                              <MapPin
                                size={10}
                                className="shrink-0 text-[#53618A]"
                              />

                              <span className="truncate text-[10px] font-semibold text-[#344677]">
                                {getVolunteerLocation(
                                  volunteer
                                )}
                              </span>
                            </div>
                          </td>

                          <td className="px-[7px] align-middle">
                            <span
                              className="inline-flex whitespace-nowrap rounded-[4px] border px-[7px] py-[4px] text-[10px] font-semibold leading-none"
                              style={{
                                backgroundColor:
                                  statusMeta.background,
                                color:
                                  statusMeta.color,
                                borderColor:
                                  statusMeta.border,
                              }}
                            >
                              {
                                VOLUNTEER_STATUS_META[
                                  volunteer.status
                                ].label
                              }
                            </span>
                          </td>

                          <td className="px-[7px] align-middle">
                            <span className="whitespace-nowrap text-[10px] font-semibold text-[#344677]">
                              {formatDate(volunteer.createdAt)}
                            </span>
                          </td>

                          <td className="px-[5px] align-middle">
                            <div className="flex items-center gap-[5px]">
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setSelected(volunteer);
                                }}
                                className="flex h-[27px] w-[28px] items-center justify-center rounded-[5px] border border-[#E3E7EC] bg-white text-[#283E78] hover:bg-[#F8FAFC]"
                              >
                                <Eye size={11} />
                              </button>

                              <button
                                type="button"
                                onClick={(event) =>
                                  event.stopPropagation()
                                }
                                className="flex h-[27px] w-[28px] items-center justify-center rounded-[5px] border border-[#E3E7EC] bg-white text-[#283E78] hover:bg-[#F8FAFC]"
                              >
                                <MoreVertical size={11} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    }
                  )}

                {!loading &&
                  pageRows.length === 0 && (
                    <tr>
                      <td
                        colSpan={8}
                        className="h-[150px] text-center text-[10px] font-semibold text-[#667085]"
                      >
                        No volunteers found.
                      </td>
                    </tr>
                  )}
              </tbody>
            </table>

            {/* PAGINATION */}

            <div className="flex h-[48px] items-center justify-between gap-[10px] border-t border-[#E6E9ED] px-[16px]">
              <p className="shrink-0 whitespace-nowrap text-[10px] font-semibold text-[#475A83]">
                {visible.length > 0
                  ? `Showing ${startIndex + 1} to ${endIndex} of ${visible.length} volunteers`
                  : "Showing 0 volunteers"}
              </p>

              <div className="flex items-center gap-[5px]">
                <button
                  type="button"
                  disabled={safePage === 1}
                  onClick={() =>
                    setPage(
                      Math.max(1, safePage - 1)
                    )
                  }
                  className="flex h-[27px] w-[27px] items-center justify-center rounded-[4px] border border-[#E3E7ED] bg-white text-[#536180] disabled:opacity-40"
                >
                  <ChevronLeft size={12} />
                </button>

                {Array.from({
                  length: Math.min(5, totalPages),
                }).map((_, index) => {
                  const number = index + 1;

                  return (
                    <button
                      type="button"
                      key={number}
                      onClick={() =>
                        setPage(number)
                      }
                      className={`
                        flex h-[27px] w-[27px] items-center justify-center rounded-[4px] border text-[10px] font-semibold
                        ${safePage === number
                          ? "border-[#006132] bg-[#006132] text-white"
                          : "border-[#E3E7ED] bg-white text-[#334575]"
                        }
                      `}
                    >
                      {number}
                    </button>
                  );
                })}

                <button
                  type="button"
                  disabled={safePage === totalPages}
                  onClick={() =>
                    setPage(
                      Math.min(
                        totalPages,
                        safePage + 1
                      )
                    )
                  }
                  className="flex h-[27px] w-[27px] items-center justify-center rounded-[4px] border border-[#E3E7ED] bg-white text-[#334575] disabled:opacity-40"
                >
                  <ChevronRight size={12} />
                </button>
              </div>

              <div className="relative">
                <select
                  value={perPage}
                  onChange={(event) => {
                    setPerPage(
                      Number(event.target.value)
                    );
                    setPage(1);
                  }}
                  className="h-[28px] w-[96px] appearance-none rounded-[4px] border border-[#E3E7ED] bg-white px-[9px] pr-[27px] text-[10px] font-semibold text-[#536180] outline-none"
                >
                  <option value={10}>
                    10 per page
                  </option>
                  <option value={20}>
                    20 per page
                  </option>
                  <option value={50}>
                    50 per page
                  </option>
                </select>

                <ChevronDown
                  size={10}
                  className="pointer-events-none absolute right-[8px] top-1/2 -translate-y-1/2"
                />
              </div>
            </div>
          </div>
        </main>

        {/* RIGHT SIDEBAR */}

        <aside className="w-[255px] min-w-0">
          {/* OVERVIEW */}

          <div className="rounded-[7px] border border-[#E2E6EB] bg-white px-[12px] pb-[14px] pt-[12px]">
            <div className="flex items-center justify-between gap-[7px]">
              <h2 className="whitespace-nowrap text-[11px] font-semibold text-[#1E2430]">
                Volunteer Overview
              </h2>

              <button
                type="button"
                className="flex items-center gap-[3px] whitespace-nowrap text-[9px] font-semibold text-[#16804B]"
              >
                View Report
                <ArrowRight size={9} />
              </button>
            </div>

            <div className="mt-[17px] flex items-center gap-[11px]">
              <div
                className="flex h-[94px] w-[94px] shrink-0 items-center justify-center rounded-full"
                style={{
                  background:
                    totalVolunteers > 0
                      ? `conic-gradient(
                          #2BA15D 0% ${percentage(
                        activeVolunteers,
                        totalVolunteers
                      )}%,
                          #EB332D ${percentage(
                        activeVolunteers,
                        totalVolunteers
                      )}% 100%
                        )`
                      : "#EEF1F4",
                }}
              >
                <div className="flex h-[60px] w-[60px] flex-col items-center justify-center rounded-full bg-white">
                  <span className="text-[18px] font-semibold leading-none text-[#111]">
                    {totalVolunteers}
                  </span>

                  <span className="mt-[4px] text-[9px] font-semibold text-[#44537B]">
                    Total
                  </span>
                </div>
              </div>

              <div className="min-w-0 flex-1 space-y-[10px]">
                <div className="flex items-center justify-between gap-[6px] text-left">
                  <div className="flex items-center gap-[6px]">
                    <span className="h-[6px] w-[6px] rounded-full bg-[#2BA15D]" />
                    <span className="text-[9px] font-semibold text-[#26386D]">
                      Active
                    </span>
                  </div>

                  <span className="whitespace-nowrap text-left text-[9px] font-semibold text-[#26386D]">
                    {activeVolunteers} (
                    {percentage(
                      activeVolunteers,
                      totalVolunteers
                    ).toFixed(1)}
                    %)
                  </span>
                </div>

                <div className="flex items-center justify-between gap-[6px] text-left">
                  <div className="flex items-center gap-[6px]">
                    <span className="h-[6px] w-[6px] rounded-full bg-[#EB332D]" />
                    <span className="whitespace-nowrap text-[9px] font-semibold text-[#26386D]">
                      Inactive
                    </span>
                  </div>

                  <span className="whitespace-nowrap text-left text-[9px] font-semibold text-[#26386D]">
                    {inactiveVolunteers} (
                    {percentage(
                      inactiveVolunteers,
                      totalVolunteers
                    ).toFixed(1)}
                    %)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ROLE */}

          <div className="mt-[14px] rounded-[7px] border border-[#E2E6EB] bg-white px-[12px] pb-[14px] pt-[12px]">
            <h2 className="text-[10px] font-semibold uppercase tracking-wider text-[#1D5E39]">
              Volunteers by Role
            </h2>

            {roleStats.length > 0 ? (
              <div className="mt-[16px] space-y-[11px]">
                {roleStats.map(
                  (item, index) => (
                    <div
                      key={item.label}
                      className="grid grid-cols-[78px_minmax(0,1fr)_52px] items-center gap-[5px]"
                    >
                      <span
                        className="truncate text-[10px] font-semibold text-[#334375]"
                        title={item.label}
                      >
                        {item.label}
                      </span>

                      <div className="h-[5px] overflow-hidden rounded-full bg-[#E9EDF2]">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.max(
                              5,
                              (item.value / maxRole) * 100
                            )}%`,
                            backgroundColor:
                              roleColors[
                              index %
                              roleColors.length
                              ],
                          }}
                        />
                      </div>

                      <span className="whitespace-nowrap text-right text-[10px] font-semibold text-[#334375]">
                        {item.value} (
                        {item.percentage.toFixed(1)}
                        %)
                      </span>
                    </div>
                  )
                )}
              </div>
            ) : (
              <p className="py-[20px] text-center text-[10px] text-[#667085]">
                No role data available.
              </p>
            )}
          </div>

          {/* TOP LOCATIONS - EXACT REFERENCE MAP */}

          <div className="mt-[14px] rounded-[7px] border border-[#E2E6EB] bg-white px-[12px] pb-[13px] pt-[12px]">
            <h2 className="text-[10px] font-semibold uppercase tracking-wider text-[#1D5E39]">
              Top Locations
            </h2>

            <div className="mt-[7px] grid min-h-[150px] grid-cols-[145px_minmax(0,1fr)] items-center gap-[4px]">
              <IndiaMiniMap />

              <div className="min-w-0 space-y-[13px]">
                {locationStats.length > 0 ? (
                  locationStats.map((item) => (
                    <div
                      key={item.label}
                      className="flex min-w-0 items-center justify-between gap-[6px]"
                    >
                      <span
                        title={item.label}
                        className="max-w-[53px] truncate text-[10px] font-semibold text-[#334375]"
                      >
                        {item.label}
                      </span>

                      <span className="shrink-0 whitespace-nowrap text-[10px] font-semibold text-[#334375]">
                        {item.value} (
                        {item.percentage.toFixed(1)}
                        %)
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-[10px] font-semibold text-[#667085]">
                    No location data
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* QUICK ACTIONS */}

          <div className="mt-[14px] overflow-hidden rounded-[7px] border border-[#E2E6EB] bg-[#FAFBFE]">
            <div className="px-[12px] pb-[7px] pt-[12px]">
              <h2 className="text-[10px] font-semibold uppercase tracking-wider text-[#1D5E39]">
                Quick Actions
              </h2>
            </div>

            {[
              {
                label: "Add New Volunteer",
                icon: UserPlus,
                href: "/volunteers/new",
              },
              {
                label: "Assign to Activity",
                icon: CalendarDays,
              },
              {
                label: "Send Announcement",
                icon: Send,
              },
              {
                label: "Download Volunteer List",
                icon: Download,
              },
            ].map((action) => {
              const Icon = action.icon;
              const content = (
                <>
                  <span className="flex min-w-0 items-center gap-[8px]">
                    <Icon
                      size={14}
                      className="shrink-0"
                    />

                    <span className="whitespace-nowrap text-[10px] font-semibold">
                      {action.label}
                    </span>
                  </span>

                  <ArrowRight
                    size={14}
                    className="shrink-0 text-[#909BB0]"
                  />
                </>
              );

              if (action.href) {
                return (
                  <Link
                    key={action.label}
                    href={action.href}
                    className="flex h-[34px] w-full items-center justify-between border-b border-[#EDF0F4] px-[12px] text-[#1A2F6D] last:border-b-0 hover:bg-white"
                  >
                    {content}
                  </Link>
                );
              }

              return (
                <button
                  type="button"
                  key={action.label}
                  className="flex h-[34px] w-full items-center justify-between border-b border-[#EDF0F4] px-[12px] text-[#1A2F6D] last:border-b-0 hover:bg-white"
                >
                  {content}
                </button>
              );
            })}
          </div>
        </aside>
      </div>

      {/* VOLUNTEER MODAL */}

      <Modal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.name ?? "Volunteer"}
        size="lg"
      >
        {selected && (
          <div className="space-y-3 text-sm">
            {selected.photographUrl && (
              <img
                src={selected.photographUrl}
                alt={`${selected.name ?? "Volunteer"} photograph`}
                className="h-24 w-24 rounded-xl border object-cover"
              />
            )}

            <div className="flex flex-wrap items-center gap-2">
              <Badge
                tone={
                  VOLUNTEER_STATUS_META[
                    selected.status
                  ].tone
                }
              >
                {
                  VOLUNTEER_STATUS_META[
                    selected.status
                  ].label
                }
              </Badge>

              {selected.availability && (
                <Badge
                  tone={
                    VOLUNTEER_AVAILABILITY_META[
                      selected.availability
                    ]?.tone ??
                    "neutral"
                  }
                >
                  {VOLUNTEER_AVAILABILITY_META[
                    selected.availability
                  ]?.label ??
                    selected.availability}
                </Badge>
              )}

              <button
                type="button"
                onClick={() =>
                  handlePrint(selected)
                }
                className="ml-auto rounded-lg bg-accent px-3 py-2 text-xs font-semibold text-white hover:opacity-90"
              >
                Download Registration PDF
              </button>

              <button
                type="button"
                onClick={() =>
                  handleDelete(selected)
                }
                disabled={busyId === selected._id}
                className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Delete
              </button>
            </div>

            <Select
              label="Status"
              value={selected.status}
              disabled={busyId === selected._id}
              onChange={(event) =>
                handleStatusChange(
                  selected._id,
                  event.target.value as VolunteerStatus
                )
              }
            >
              <option value="ACTIVE">
                Active
              </option>

              <option value="INACTIVE">
                Inactive
              </option>

              <option value="BLACKLISTED">
                Blacklisted
              </option>
            </Select>

            <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-3">
              <Field
                label="Phone"
                value={selected.phone}
              />
              <Field
                label="Email"
                value={selected.email}
              />
              <Field
                label="City"
                value={selected.city}
              />
              <Field
                label="Date of Birth"
                value={
                  selected.dateOfBirth
                    ? formatDate(selected.dateOfBirth)
                    : undefined
                }
              />
              <Field
                label="Gender"
                value={selected.gender}
              />
              <Field
                label="Blood Group"
                value={selected.bloodGroup}
              />
              <Field
                label="State"
                value={selected.state}
              />
              <Field
                label="Pincode"
                value={selected.pincode}
              />
              <Field
                label="Schedule Preference"
                value={selected.schedulePreference}
              />
              <Field
                label="Preferred Role"
                value={selected.preferredRole}
              />
              <Field
                label="WhatsApp"
                value={selected.whatsappPhone}
              />
              <Field
                label="Occupation"
                value={selected.occupation}
              />
              <Field
                label="Organisation"
                value={selected.organisation}
              />
              <Field
                label="Languages"
                value={selected.languagesKnown}
              />
              <Field
                label="Hours / Week"
                value={selected.hoursPerWeek}
              />
              <Field
                label="Emergency On-Call"
                value={yesNo(selected.emergencyOnCall)}
              />
              <Field
                label="Field Cases"
                value={yesNo(
                  selected.canParticipateFieldCases
                )}
              />
              <Field
                label="Own Vehicle"
                value={yesNo(selected.ownVehicle)}
              />
              <Field
                label="ID Proof Type"
                value={selected.idProofType}
              />
              <Field
                label="ID Proof No."
                value={selected.idProofNumber}
              />
              <Field
                label="Total Assignments"
                value={String(
                  selected.totalAssignments ?? 0
                )}
              />
              <Field
                label="Joined"
                value={formatDateTime(
                  selected.createdAt
                )}
              />
            </div>

            {selected.address && (
              <Detail
                label="Address"
                value={selected.address}
              />
            )}

            {(selected.skills ?? []).length > 0 && (
              <Detail
                label="Skills"
                value={(selected.skills ?? []).join(", ")}
              />
            )}

            {(selected.volunteerAreas ?? []).length > 0 && (
              <Detail
                label="Preferred Service Areas"
                value={(selected.volunteerAreas ?? []).join(", ")}
              />
            )}

            {(selected.availabilityDays ?? []).length > 0 && (
              <Detail
                label="Availability Days"
                value={(selected.availabilityDays ?? []).join(", ")}
              />
            )}

            {(selected.preferredTimes ?? []).length > 0 && (
              <Detail
                label="Preferred Times"
                value={(selected.preferredTimes ?? []).join(", ")}
              />
            )}

            {selected.previousOrganisationRole && (
              <Detail
                label="Previous NGO / Role"
                value={selected.previousOrganisationRole}
              />
            )}

            {selected.emergencyContact && (
              <Detail
                label="Emergency Contact"
                value={[
                  selected.emergencyContact.name,
                  selected.emergencyContact.relationship,
                  selected.emergencyContact.phone,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              />
            )}

            {selected.idProofUrl && (
              <a
                href={selected.idProofUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex rounded-lg border border-accent px-3 py-2 text-xs font-semibold text-accent"
              >
                View ID Proof Attachment
              </a>
            )}

            {selected.motivation && (
              <Detail
                label="Why they want to volunteer"
                value={selected.motivation}
              />
            )}

            {selected.experience && (
              <Detail
                label="Skills / Experience"
                value={selected.experience}
              />
            )}

            {/* OFFICE USE */}

            <div className="rounded-lg border border-surface-border bg-surface-sunken p-3">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">
                  For Office Use Only
                </p>

                {selected.code && (
                  <span className="font-mono text-[11px] text-text-muted">
                    {selected.code}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <label className="flex items-center gap-2 text-xs font-semibold text-text-primary">
                  <input
                    type="checkbox"
                    checked={officeForm.verified}
                    onChange={(event) =>
                      setOfficeForm({
                        ...officeForm,
                        verified: event.target.checked,
                      })
                    }
                    className="h-4 w-4 rounded accent-accent"
                  />

                  Verified
                </label>

                <Input
                  label="Assigned Role"
                  value={officeForm.assignedRole}
                  onChange={(event) =>
                    setOfficeForm({
                      ...officeForm,
                      assignedRole:
                        event.target.value,
                    })
                  }
                />

                <Input
                  label="Assigned Area"
                  value={officeForm.assignedArea}
                  onChange={(event) =>
                    setOfficeForm({
                      ...officeForm,
                      assignedArea:
                        event.target.value,
                    })
                  }
                />

                <Input
                  label="Joining / Orientation Date"
                  type="date"
                  value={officeForm.joiningDate}
                  onChange={(event) =>
                    setOfficeForm({
                      ...officeForm,
                      joiningDate:
                        event.target.value,
                    })
                  }
                  hint={`Leave blank to use the registration date (${formatDate(
                    selected.createdAt
                  )}).`}
                />

                <div>
                  <p className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-text-secondary">
                    Approved By
                  </p>

                  <p className="pt-2 text-xs text-text-primary">
                    {selected.verified
                      ? selected.approvedByName ?? "—"
                      : "Not yet verified"}
                  </p>
                </div>
              </div>

              {officeError && (
                <p className="mt-2 text-[11px] font-semibold text-red-600">
                  {officeError}
                </p>
              )}

              <Button
                size="sm"
                className="mt-3"
                loading={officeSaving}
                onClick={saveOfficeUse}
              >
                Save Office Use Details
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </section>
  );
}

/* ============================================================
   FIELD
============================================================ */

function Field({
  label,
  value,
}: {
  label: string;
  value?: string;
}) {
  if (!value) return null;

  return (
    <div>
      <p className="font-semibold uppercase tracking-wide text-text-muted">
        {label}
      </p>

      <p className="text-text-primary">
        {value}
      </p>
    </div>
  );
}

/* ============================================================
   DETAIL
============================================================ */

function Detail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">
        {label}
      </p>

      <p className="text-text-primary">
        {value}
      </p>
    </div>
  );
}

/* ============================================================
   YES / NO
============================================================ */

function yesNo(value?: boolean) {
  return value === undefined
    ? undefined
    : value
      ? "Yes"
      : "No";
}
