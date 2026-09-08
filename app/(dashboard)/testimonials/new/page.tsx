"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Bold,
  Bookmark,
  CalendarDays,
  Check,
  ChevronDown,
  Image as ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  MapPin,
  Quote,
  Redo2,
  Save,
  Star,
  Underline,
  Undo2,
  Upload,
  UserRound,
  X,
} from "lucide-react";

function FieldLabel({
  children,
  required,
  optional,
}: {
  children: React.ReactNode;
  required?: boolean;
  optional?: boolean;
}) {
  return (
    <label className="mb-[6px] block text-[11px] font-semibold text-[#24345e]">
      {children}
      {required ? <span className="ml-[2px] text-[#df3e3e]">*</span> : null}
      {optional ? <span className="font-semibold text-[#63708a]"> (Optional)</span> : null}
    </label>
  );
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      aria-pressed={checked}
      className={`relative h-[22px] w-[36px] shrink-0 rounded-full transition ${checked ? "bg-[#0b6a3b]" : "bg-[#d8dde6]"
        }`}
    >
      <span
        className={`absolute top-[2px] h-[18px] w-[18px] rounded-full bg-white shadow transition ${checked ? "left-[16px]" : "left-[2px]"
          }`}
      />
    </button>
  );
}

function RatingStars({
  rating,
  setRating,
  size = 20,
}: {
  rating: number;
  setRating?: (value: number) => void;
  size?: number;
}) {
  return (
    <div className="flex items-center gap-[4px]">
      {Array.from({ length: 5 }, (_, index) => {
        const active = index + 1 <= rating;

        return (
          <button
            key={index}
            type="button"
            disabled={!setRating}
            onClick={() => setRating?.(index + 1)}
            className={setRating ? "cursor-pointer" : "cursor-default"}
          >
            <Star
              size={size}
              strokeWidth={1.6}
              className={
                active
                  ? "fill-amber-400 text-amber-400"
                  : "fill-slate-100 text-slate-300"
              }
            />
          </button>
        );
      })}
    </div>
  );
}

export default function AddNewTestimonialPage() {
  const router = useRouter();
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("");
  const [organization, setOrganization] = useState("");
  const [message, setMessage] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("31 May 2026");
  const [rating, setRating] = useState(5);
  const [featured, setFeatured] = useState(false);

  const [status, setStatus] = useState("Published");
  const [homepage, setHomepage] = useState(true);
  const [aboutPage, setAboutPage] = useState(true);
  const [testimonialsPage, setTestimonialsPage] = useState(true);
  const [otherPages, setOtherPages] = useState(false);
  const [order, setOrder] = useState("0");
  const [tags, setTags] = useState("");

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const previewName = useMemo(
    () => fullName.trim() || "Ramesh Kumar",
    [fullName],
  );

  const previewRole = useMemo(
    () => role.trim() || "Volunteer",
    [role],
  );

  const previewLocation = useMemo(
    () => location.trim() || "Delhi, India",
    [location],
  );

  const previewMessage = useMemo(
    () =>
      message.trim() ||
      "Moksha Sewa stands as a beacon of compassion and dignity. Their support during difficult times is truly commendable. Thank you for bringing humanity back to life.",
    [message],
  );

  return (
    <main
      style={{
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
      className="h-full min-h-0 w-full overflow-y-auto overflow-x-hidden bg-[#fffefb] px-[18px] py-[12px] text-[#16233f] [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300"
    >
      <div className="min-h-full w-full">
        {/* HEADER */}
        <header className="flex items-start justify-between gap-[16px]">
          <div>
            <h1 className="text-[24px] font-semibold leading-none tracking-[-0.02em] text-[#075b33]">
              Add New Testimonial
            </h1>

            <nav className="mt-[9px] flex items-center gap-[8px] text-[10.5px] font-semibold text-[#1d2b58]">
              <span>Dashboard</span>
              <span className="text-[#7b8597]">›</span>
              <span>Testimonials</span>
              <span className="text-[#7b8597]">›</span>
              <span>Add New Testimonial</span>
            </nav>
          </div>

          <div className="flex items-center gap-[12px]">
            <button
              type="button"
              onClick={() => router.push("/testimonials")}
              className="inline-flex h-[40px] items-center gap-[8px] rounded-[6px] border border-[#dfe3e7] bg-white px-[18px] text-[10.5px] font-semibold text-[#273655] transition hover:bg-slate-50"
            >
              <ArrowLeft className="h-[15px] w-[15px]" />
              Back to Testimonials
            </button>

            <button
              type="button"
              onClick={() => {
                alert("Testimonial Saved Successfully!");
                router.push("/testimonials");
              }}
              className="inline-flex h-[40px] items-center gap-[8px] rounded-[6px] bg-[linear-gradient(180deg,#076636_0%,#03542c_100%)] px-[20px] text-[10.5px] font-semibold text-white shadow-[0_7px_16px_rgba(5,94,49,.12)] transition hover:opacity-95"
            >
              <Save className="h-[15px] w-[15px]" />
              Save Testimonial
            </button>
          </div>
        </header>

        {/* MAIN GRID */}
        <section className="mt-[16px] grid items-start gap-[14px] xl:grid-cols-[minmax(0,1.72fr)_minmax(350px,0.98fr)]">
          {/* LEFT */}
          <div className="space-y-[12px]">
            {/* TESTIMONIAL INFORMATION */}
            <section className="rounded-[9px] border border-[#e7e9ec] bg-white px-[18px] py-[16px] shadow-[0_1px_3px_rgba(15,23,42,0.025)]">
              <h2 className="text-[14px] font-semibold text-[#17234a]">
                Testimonial Information
              </h2>
              <p className="mt-[4px] text-[10.5px] font-semibold text-[#66738b]">
                Add testimonial details as shared by the person.
              </p>

              <div className="mt-[16px] grid grid-cols-2 gap-x-[20px] gap-y-[14px]">
                <div>
                  <FieldLabel required>Full Name</FieldLabel>
                  <input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter full name"
                    className="h-[40px] w-full rounded-[6px] border border-[#dfe4e8] bg-white px-[13px] text-[11px] font-semibold text-[#2d3b58] outline-none placeholder:text-[#8d97aa]"
                  />
                </div>

                <div>
                  <FieldLabel>Designation / Role</FieldLabel>
                  <input
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g., Volunteer, Beneficiary, Donor, Partner (Optional)"
                    className="h-[40px] w-full rounded-[6px] border border-[#dfe4e8] bg-white px-[13px] text-[11px] font-semibold text-[#2d3b58] outline-none placeholder:text-[#8d97aa]"
                  />
                </div>

                <div className="col-span-2">
                  <FieldLabel optional>Organization</FieldLabel>
                  <input
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    placeholder="Enter organization or affiliation"
                    className="h-[40px] w-[50%] min-w-[320px] rounded-[6px] border border-[#dfe4e8] bg-white px-[13px] text-[11px] font-semibold text-[#2d3b58] outline-none placeholder:text-[#8d97aa]"
                  />
                </div>

                <div className="col-span-2">
                  <FieldLabel required>Testimonial Message</FieldLabel>

                  <div className="overflow-hidden rounded-[6px] border border-[#dfe4e8] bg-white">
                    <div className="flex min-h-[42px] flex-wrap items-center gap-[12px] border-b border-[#e7e9ec] px-[12px] text-[#2f3c56]">
                      <button
                        type="button"
                        className="inline-flex items-center gap-[12px] text-[10.5px] font-semibold"
                      >
                        Paragraph
                        <ChevronDown className="h-[13px] w-[13px]" />
                      </button>

                      <span className="h-[20px] w-px bg-[#e4e7eb]" />

                      <Bold className="h-[15px] w-[15px]" />
                      <Italic className="h-[15px] w-[15px]" />
                      <Underline className="h-[15px] w-[15px]" />

                      <span className="h-[20px] w-px bg-[#e4e7eb]" />

                      <List className="h-[15px] w-[15px]" />
                      <ListOrdered className="h-[15px] w-[15px]" />
                      <ChevronDown className="h-[12px] w-[12px]" />

                      <span className="h-[20px] w-px bg-[#e4e7eb]" />

                      <Link2 className="h-[15px] w-[15px]" />
                      <ImageIcon className="h-[15px] w-[15px]" />
                      <Quote className="h-[15px] w-[15px]" />

                      <span className="h-[20px] w-px bg-[#e4e7eb]" />

                      <Undo2 className="h-[15px] w-[15px]" />
                      <Redo2 className="h-[15px] w-[15px] text-slate-400" />
                    </div>

                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value.slice(0, 1000))}
                      placeholder="Write the testimonial message here..."
                      className="h-[118px] w-full resize-none bg-white px-[14px] py-[12px] text-[11px] font-semibold text-[#2d3b58] outline-none placeholder:text-[#8d97aa]"
                    />

                    <div className="flex justify-end px-[12px] pb-[8px]">
                      <span className="text-[9px] font-semibold text-[#6d7890]">
                        {message.length}/1000
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <FieldLabel optional>Location</FieldLabel>
                  <div className="relative">
                    <MapPin className="absolute left-[12px] top-1/2 h-[14px] w-[14px] -translate-y-1/2 text-[#8490a4]" />
                    <input
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g., Delhi, India"
                      className="h-[40px] w-full rounded-[6px] border border-[#dfe4e8] bg-white pl-[36px] pr-[12px] text-[11px] font-semibold text-[#2d3b58] outline-none placeholder:text-[#8d97aa]"
                    />
                  </div>
                </div>

                <div>
                  <FieldLabel>Date of Testimonial</FieldLabel>
                  <div className="relative">
                    <CalendarDays className="absolute left-[12px] top-1/2 h-[14px] w-[14px] -translate-y-1/2 text-[#5d6981]" />
                    <input
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="h-[40px] w-full rounded-[6px] border border-[#dfe4e8] bg-white pl-[36px] pr-[12px] text-[11px] font-semibold text-[#2d3b58] outline-none"
                    />
                  </div>
                </div>

                <div className="col-span-2">
                  <FieldLabel optional>Rating</FieldLabel>
                  <div className="flex items-center gap-[16px]">
                    <RatingStars rating={rating} setRating={setRating} size={21} />
                    <span className="text-[10px] font-semibold text-[#44516a]">
                      {rating.toFixed(1)} out of 5
                    </span>
                  </div>
                </div>

                <div className="col-span-2">
                  <p className="text-[11px] font-semibold text-[#24345e]">
                    Featured Testimonial
                  </p>

                  <div className="mt-[8px] flex items-center gap-[10px]">
                    <Toggle
                      checked={featured}
                      onChange={() => setFeatured((v) => !v)}
                    />
                    <span className="text-[9.5px] font-semibold text-[#66738b]">
                      Show this testimonial in the featured section on homepage.
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* PROFILE PHOTO */}
            <section className="rounded-[9px] border border-[#e7e9ec] bg-white px-[18px] py-[16px] shadow-[0_1px_3px_rgba(15,23,42,0.025)]">
              <h2 className="text-[14px] font-semibold text-[#17234a]">
                Profile / Photo
              </h2>
              <p className="mt-[4px] text-[10.5px] font-semibold text-[#66738b]">
                Upload profile photo of the person (Optional).
              </p>

              <input
                type="file"
                ref={photoInputRef}
                className="hidden"
                accept="image/*"
                onChange={handlePhotoChange}
              />

              <div className="mt-[14px] grid grid-cols-[320px_1fr] gap-[34px]">
                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  className="flex h-[96px] flex-col items-center justify-center rounded-[7px] border border-dashed border-[#d7dde5] bg-[#fffefc] transition hover:border-[#0b6a3b] hover:bg-[#f0f7f2]"
                >
                  <Upload className="h-[22px] w-[22px] text-[#35435e]" />
                  <span className="mt-[7px] text-[10px] font-semibold text-[#5d6981]">
                    {photoPreview ? "Click to change photo" : "Click to upload or drag and drop"}
                  </span>
                  <span className="mt-[5px] text-[9px] font-semibold text-[#8490a4]">
                    PNG, JPG or WEBP (Max. 2MB)
                  </span>
                </button>

                <div>
                  <p className="text-[11px] font-semibold text-[#24345e]">
                    Photo Preview
                  </p>
                  <div className="mt-[8px] grid h-[76px] w-[76px] place-items-center overflow-hidden rounded-full border border-[#dce1e7] bg-[#f1f3f6] text-[#b5becd]">
                    {photoPreview ? (
                      <img src={photoPreview} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <UserRound className="h-[46px] w-[46px]" />
                    )}
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* RIGHT */}
          <div className="space-y-[12px]">
            {/* DISPLAY SETTINGS */}
            <section className="rounded-[9px] border border-[#e7e9ec] bg-white px-[18px] py-[16px] shadow-[0_1px_3px_rgba(15,23,42,0.025)]">
              <h2 className="text-[14px] font-semibold text-[#17234a]">
                Display Settings
              </h2>
              <p className="mt-[4px] text-[10.5px] font-semibold text-[#66738b]">
                Control how this testimonial will appear.
              </p>

              <div className="mt-[16px] space-y-[15px]">
                <div>
                  <FieldLabel required>Status</FieldLabel>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="h-[40px] w-full rounded-[6px] border border-[#dfe4e8] bg-white px-[12px] text-[10.5px] font-semibold text-[#2f3d58] outline-none"
                  >
                    <option>Published</option>
                    <option>Pending Review</option>
                    <option>Hidden</option>
                    <option>Draft</option>
                  </select>
                </div>

                <div>
                  <FieldLabel required>Display On</FieldLabel>

                  <div className="space-y-[10px]">
                    {[
                      ["Homepage", homepage, setHomepage],
                      ["About Us Page", aboutPage, setAboutPage],
                      ["Testimonials Page", testimonialsPage, setTestimonialsPage],
                      ["Other Pages (Select)", otherPages, setOtherPages],
                    ].map(([label, checked, setter]) => {
                      const checkedValue = checked as boolean;
                      const setChecked = setter as React.Dispatch<
                        React.SetStateAction<boolean>
                      >;

                      return (
                        <label
                          key={String(label)}
                          className="flex items-center gap-[10px] text-[10px] font-semibold text-[#46546d]"
                        >
                          <button
                            type="button"
                            onClick={() => setChecked((v) => !v)}
                            className={`grid h-[17px] w-[17px] place-items-center rounded-[4px] border ${checkedValue
                              ? "border-[#0b6a3b] bg-[#0b6a3b] text-white"
                              : "border-[#ccd4df] bg-white text-transparent"
                              }`}
                          >
                            <Check className="h-[11px] w-[11px]" />
                          </button>
                          {String(label)}
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <FieldLabel>Order / Sequence</FieldLabel>
                  <input
                    value={order}
                    onChange={(e) => setOrder(e.target.value)}
                    className="h-[40px] w-full rounded-[6px] border border-[#dfe4e8] bg-white px-[12px] text-[10.5px] font-semibold text-[#2f3d58] outline-none"
                  />
                  <p className="mt-[6px] text-[9px] font-semibold text-[#738097]">
                    Lower numbers appear first.
                  </p>
                </div>

                <div>
                  <FieldLabel optional>Tags</FieldLabel>
                  <input
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="Add tags and press Enter"
                    className="h-[40px] w-full rounded-[6px] border border-[#dfe4e8] bg-white px-[12px] text-[10.5px] font-semibold text-[#2f3d58] outline-none placeholder:text-[#8d97aa]"
                  />
                  <p className="mt-[6px] text-[9px] font-semibold text-[#738097]">
                    E.g. Compassion, Seva, Support, Impact
                  </p>
                </div>
              </div>
            </section>

            {/* PREVIEW */}
            <section className="rounded-[9px] border border-[#e7e9ec] bg-white px-[18px] py-[16px] shadow-[0_1px_3px_rgba(15,23,42,0.025)]">
              <h2 className="text-[14px] font-semibold text-[#17234a]">
                Testimonial Preview
              </h2>
              <p className="mt-[4px] text-[10.5px] font-semibold text-[#66738b]">
                This is how the testimonial will appear on the website.
              </p>

              <div className="mt-[14px] rounded-[8px] border border-[#e3e7ea] bg-white px-[20px] py-[18px] text-center">
                <Quote className="mx-auto h-[30px] w-[30px] fill-[#0b6a3b] text-[#0b6a3b]" />

                <p className="mx-auto mt-[10px] max-w-[330px] text-[10.5px] font-semibold leading-[1.7] text-[#252d39]">
                  {previewMessage}
                </p>

                <div className="mx-auto mt-[16px] h-px w-[80px] bg-[#d7dce2]" />

                <div className="mt-[14px] flex items-center justify-center gap-[12px]">
                  <div className="grid h-[56px] w-[56px] place-items-center rounded-full bg-[#f1f3f6] text-[#b5becd]">
                    <UserRound className="h-[36px] w-[36px]" />
                  </div>

                  <div className="text-left">
                    <p className="text-[11px] font-semibold text-[#1a2646]">
                      {previewName}
                    </p>
                    <p className="mt-[3px] text-[9px] font-semibold text-[#178248]">
                      {previewRole}
                    </p>
                    <p className="mt-[3px] text-[9px] font-semibold text-[#6a768c]">
                      {previewLocation}
                      <span className="mx-[5px]">•</span>
                      {date}
                    </p>

                    <div className="mt-[6px]">
                      <RatingStars rating={rating} size={13} />
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </section>

        {/* BOTTOM BAR */}
        <section className="sticky bottom-0 z-20 mt-[12px] flex min-h-[58px] items-center justify-between gap-[16px] border-t border-[#edf1f3] bg-[#fffefb]/95 px-[2px] py-[9px] backdrop-blur-sm">
          <div className="flex min-h-[44px] flex-1 items-center gap-[10px] rounded-[7px] bg-[linear-gradient(90deg,#eef7f1,#f4faf6)] px-[14px]">
            <div className="grid h-[24px] w-[24px] place-items-center rounded-full border border-[#cfe1d4] bg-white text-[#0d6b3e]">
              i
            </div>
            <p className="text-[9.5px] font-semibold text-[#38654b]">
              <span className="font-semibold">Tip:</span>{" "}
              After saving, you can edit, reorder or feature this testimonial anytime.
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-[10px]">
            <button
              type="button"
              onClick={() => router.push("/testimonials")}
              className="inline-flex h-[40px] items-center gap-[8px] rounded-[6px] border border-[#dfe3e7] bg-white px-[18px] text-[10px] font-semibold text-[#273655] transition hover:bg-slate-50"
            >
              <X className="h-[14px] w-[14px]" />
              Cancel
            </button>

            <button
              type="button"
              onClick={() => {
                alert("Saved as Draft!");
                router.push("/testimonials");
              }}
              className="inline-flex h-[40px] items-center gap-[8px] rounded-[6px] border border-[#dfe3e7] bg-white px-[18px] text-[10px] font-semibold text-[#273655] transition hover:bg-slate-50"
            >
              <Bookmark className="h-[14px] w-[14px]" />
              Save as Draft
            </button>

            <button
              type="button"
              onClick={() => {
                alert("Testimonial Saved Successfully!");
                router.push("/testimonials");
              }}
              className="inline-flex h-[40px] items-center gap-[8px] rounded-[6px] bg-[linear-gradient(180deg,#076636_0%,#03542c_100%)] px-[20px] text-[10px] font-semibold text-white shadow-[0_7px_16px_rgba(5,94,49,.12)] transition hover:opacity-95"
            >
              <Save className="h-[14px] w-[14px]" />
              Save Testimonial
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
