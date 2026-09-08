import type { Connection, GbpDashboard, GbpLocation, GbpReview } from "@/lib/gbpApi";

export type ReviewStatus = "Replied" | "Pending Reply";
export type ReviewTab = "all" | "new" | "pending" | "replied" | "negative";

export type Review = {
  id: string;
  customer: string;
  subtitle: string;
  avatar?: string;
  rating: number;
  review: string;
  location: string;
  city: string;
  date: string;
  time: string;
  status: ReviewStatus;
  assignedTo: string;
  assignedAvatar?: string;
};

export type RatingBar = { stars: number; count: number; percent: number; color: string };
export type LocationRating = { name: string; rating: string; count: number };
export type TrendPoint = { label: string; value: number };
export type NegativeAlert = { id: string; name: string; location: string; rating: number; date: string; text: string };

export type ReviewsData = {
  reviews: Review[];
  ratingBreakdown: RatingBar[];
  locationRatings: LocationRating[];
  trend: TrendPoint[];
  negativeAlerts: NegativeAlert[];
  metrics: {
    overallRating: string;
    overallRatingStars: number;
    overallRatingChange: string;
    totalReviews: string;
    totalReviewsChange: string;
    newReviews: string;
    newReviewsChange: string;
    pendingReplies: string;
    pendingRepliesChange: string;
  };
  tabCounts: Record<ReviewTab, number>;
  dateRangeLabel: string;
  lastSyncedLabel: string;
};

// Bar colours are fixed per star level in the design, so they live with the mapper rather than the data.
const BAR_COLORS: Record<number, string> = { 5: "#00A85A", 4: "#45B97C", 3: "#F4BF43", 2: "#F57C18", 1: "#EF3E42" };

/* ================================================================
   DEMO DATA
================================================================ */

export const demoReviewsData: ReviewsData = {
  reviews: [
    { id: "REV-001", customer: "Priya Sharma", subtitle: "Local Guide · 18 reviews", rating: 5, review: "Amazing place! The instructors are very knowledgeable and supportive. My health has improved a lot after joining...", location: "Main Center", city: "New Delhi", date: "22 Dec 2024", time: "10:14 AM", status: "Replied", assignedTo: "Sneha" },
    { id: "REV-002", customer: "Rahul Verma", subtitle: "Local Guide · 32 reviews", rating: 5, review: "Excellent yoga classes and peaceful environment. Highly recommended for anyone looking to improve their mental...", location: "West Delhi", city: "", date: "21 Dec 2024", time: "6:30 PM", status: "Replied", assignedTo: "Aman" },
    { id: "REV-003", customer: "Sneha Kapoor", subtitle: "3 reviews", rating: 4, review: "Good experience overall. Trainers are professional. Would be great if class timings were a bit more flexible.", location: "South Delhi", city: "", date: "20 Dec 2024", time: "4:12 PM", status: "Pending Reply", assignedTo: "Ritika" },
    { id: "REV-004", customer: "Amit Gupta", subtitle: "Local Guide · 45 reviews", rating: 2, review: "Not satisfied with the recent batch. The class was often delayed and the hall was crowded.", location: "Noida", city: "", date: "19 Dec 2024", time: "9:45 AM", status: "Pending Reply", assignedTo: "Vikas" },
    { id: "REV-005", customer: "Neha Mehta", subtitle: "5 reviews", rating: 5, review: "One of the best yoga centers in Delhi. Clean, calm and very positive atmosphere.", location: "Gurugram", city: "", date: "18 Dec 2024", time: "7:20 PM", status: "Replied", assignedTo: "Sneha" },
  ],
  ratingBreakdown: [
    { stars: 5, count: 892, percent: 70, color: BAR_COLORS[5] },
    { stars: 4, count: 258, percent: 20, color: BAR_COLORS[4] },
    { stars: 3, count: 79, percent: 6, color: BAR_COLORS[3] },
    { stars: 2, count: 32, percent: 2, color: BAR_COLORS[2] },
    { stars: 1, count: 23, percent: 2, color: BAR_COLORS[1] },
  ],
  locationRatings: [
    { name: "Moksha Sewa - Delhi", rating: "4.9", count: 642 },
    { name: "Moksha Sewa - Noida", rating: "4.7", count: 298 },
    { name: "Moksha Sewa - Ghaziabad", rating: "4.6", count: 184 },
    { name: "Moksha Sewa - Gurugram", rating: "4.8", count: 118 },
    { name: "Moksha Sewa - Faridabad", rating: "4.7", count: 42 },
  ],
  trend: [
    { label: "Jan", value: 3.8 }, { label: "Feb", value: 4.1 }, { label: "Mar", value: 4.1 },
    { label: "Apr", value: 4.0 }, { label: "May", value: 4.4 }, { label: "Jun", value: 4.25 },
    { label: "Jul", value: 4.5 }, { label: "Aug", value: 4.75 }, { label: "Sep", value: 4.48 },
    { label: "Oct", value: 4.68 }, { label: "Nov", value: 4.52 }, { label: "Dec", value: 4.8 },
  ],
  negativeAlerts: [
    { id: "NEG-001", name: "Amit Gupta", location: "Noida", rating: 1, date: "19 Dec 2024, 9:45 AM", text: "Not satisfied with the recent batch. The class was often delayed..." },
    { id: "NEG-002", name: "Rohit Mehra", location: "South Delhi", rating: 2, date: "18 Dec 2024, 2:20 PM", text: "Good location but the staff response can be better. Waiting time..." },
  ],
  metrics: {
    overallRating: "4.8", overallRatingStars: 5, overallRatingChange: "↑ 0.2",
    totalReviews: "1,284", totalReviewsChange: "↑ 12%",
    newReviews: "48", newReviewsChange: "↑ 33%",
    pendingReplies: "12", pendingRepliesChange: "↑ 71%",
  },
  tabCounts: { all: 1284, new: 48, pending: 12, replied: 1262, negative: 55 },
  dateRangeLabel: "01 Jan 2025 - 31 Dec 2025",
  lastSyncedLabel: "Last synced: 24 Dec 2024, 10:45 AM",
};

/* ================================================================
   LIVE DATA
================================================================ */

const dateFmt = new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" });
const timeFmt = new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit", hour12: true });
const num = (n: number) => n.toLocaleString("en-IN");

// Percent-change badges need a previous period the API does not return yet, so live mode shows no badge.
const NO_CHANGE = "";

export function toReviewsData(
  dashboard: GbpDashboard,
  rows: GbpReview[],
  connection: Connection | null,
  locations: GbpLocation[],
  dateRangeLabel: string,
): ReviewsData {
  const locName = (id: string) => locations.find(l => l.locationId === id)?.name ?? "";
  const lastSynced = dashboard.lastSyncedAt ?? connection?.lastSuccessfulSync ?? null;

  return {
    reviews: rows.map(r => {
      const created = new Date(r.createTime);
      return {
        id: r.id,
        customer: r.reviewerName,
        subtitle: "",
        avatar: r.reviewerPhoto ?? undefined,
        rating: r.rating,
        review: r.comment || "No written comment",
        location: r.locationName || locName(r.locationId),
        city: "",
        date: dateFmt.format(created),
        time: timeFmt.format(created),
        status: r.replyStatus === "replied" ? "Replied" : "Pending Reply",
        assignedTo: "",
      };
    }),
    ratingBreakdown: dashboard.ratingBreakdown.map(b => ({ stars: b.stars, count: b.count, percent: b.percentage, color: BAR_COLORS[b.stars] ?? BAR_COLORS[3] })),
    locationRatings: dashboard.byLocation.map(l => ({ name: l.name, rating: l.averageRating.toFixed(1), count: l.totalReviews })),
    trend: dashboard.trend.map(t => ({ label: t.label, value: t.averageRating })),
    negativeAlerts: dashboard.negativeReviews.map(n => ({
      id: n.id, name: n.reviewerName, location: n.locationName, rating: n.rating,
      date: `${dateFmt.format(new Date(n.createTime))}, ${timeFmt.format(new Date(n.createTime))}`,
      text: n.comment || "No written comment",
    })),
    metrics: {
      overallRating: dashboard.metrics.overallRating.toFixed(1),
      overallRatingStars: Math.round(dashboard.metrics.overallRating),
      overallRatingChange: NO_CHANGE,
      totalReviews: num(dashboard.metrics.totalReviews), totalReviewsChange: NO_CHANGE,
      newReviews: num(dashboard.metrics.newReviews), newReviewsChange: NO_CHANGE,
      pendingReplies: num(dashboard.metrics.pendingReplies), pendingRepliesChange: NO_CHANGE,
    },
    tabCounts: dashboard.tabCounts,
    dateRangeLabel,
    lastSyncedLabel: lastSynced
      ? `Last synced: ${dateFmt.format(new Date(lastSynced))}, ${timeFmt.format(new Date(lastSynced))}`
      : "Never synced",
  };
}
