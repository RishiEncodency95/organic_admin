"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronRight,
  HandHeart,
  Headphones,
  HeartHandshake,
  Lightbulb,
  Mail,
  Megaphone,
  Phone,
  Save,
  Send,
  Users,
  X,
} from "lucide-react";

import { newsletterApi } from "@/lib/newsletterApi";

/* ============================================================
   TYPES
============================================================ */

type SubscriberStatus =
  | "Active"
  | "Inactive"
  | "Unsubscribed";

type Frequency =
  | "all"
  | "weekly"
  | "monthly"
  | "important";

type InterestId =
  | "newsletter"
  | "events"
  | "csr"
  | "sewa"
  | "volunteer"
  | "campaign";

type FormState = {
  fullName: string;
  email: string;
  countryCode: string;
  phone: string;

  source: string;
  language: string;
  status: SubscriberStatus;

  interests: InterestId[];
  frequency: Frequency;

  notes: string;
  consent: boolean;
};

type CreateSubscriberPayload = {
  name: string;
  email: string;
  phone?: string;
  source?: string;
  language?: string;
  status?: string;
  interests?: string[];
  frequency?: string;
  notes?: string;
  consent?: boolean;
};

/* ============================================================
   DATA
============================================================ */

const interestOptions = [
  {
    id: "newsletter" as InterestId,
    title: "General Newsletter",
    description: "Regular updates & announcements",
    icon: Mail,
    iconBg: "#E7F7EC",
    iconColor: "#198F49",
  },
  {
    id: "events" as InterestId,
    title: "Events & Programs",
    description: "Information about events & programs",
    icon: CalendarDays,
    iconBg: "#E9F2FF",
    iconColor: "#2B78E4",
  },
  {
    id: "csr" as InterestId,
    title: "CSR & Partnership Updates",
    description: "CSR initiatives & partnership news",
    icon: HeartHandshake,
    iconBg: "#F1E8FD",
    iconColor: "#9142E0",
  },
  {
    id: "sewa" as InterestId,
    title: "Sewa Stories",
    description: "Impact stories & case studies",
    icon: HandHeart,
    iconBg: "#FDE8EE",
    iconColor: "#DF5475",
  },
  {
    id: "volunteer" as InterestId,
    title: "Volunteer Opportunities",
    description: "Volunteer activities & opportunities",
    icon: Users,
    iconBg: "#FFF0DB",
    iconColor: "#F29A17",
  },
  {
    id: "campaign" as InterestId,
    title: "Campaign & Appeals",
    description: "Donations, appeals & campaigns",
    icon: Send,
    iconBg: "#E2F6F4",
    iconColor: "#1BA59D",
  },
];

const frequencyOptions = [
  {
    value: "all" as Frequency,
    label: "All Updates (Recommended)",
  },
  {
    value: "weekly" as Frequency,
    label: "Weekly Summary",
  },
  {
    value: "monthly" as Frequency,
    label: "Monthly Digest",
  },
  {
    value: "important" as Frequency,
    label: "Only Important Updates",
  },
];

const sourceOptions = [
  "Website Signup",
  "General Enquiry",
  "Volunteer Form",
  "Events Registration",
  "Social Media",
  "Newsletter",
  "CSR Inquiry",
  "Admin Added",
];

const languageOptions = [
  "English",
  "Hindi",
  "English & Hindi",
];

/* ============================================================
   DEFAULT FORM
============================================================ */

const defaultForm: FormState = {
  fullName: "",
  email: "",
  countryCode: "+91",
  phone: "",

  source: "",
  language: "",
  status: "Active",

  interests: [],
  frequency: "all",

  notes: "",
  consent: false,
};

/* ============================================================
   SHARED FIELD COMPONENT
============================================================ */

function FieldLabel({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label
      className="
        mb-[7px]
        block
        text-[9px]
        font-semibold
        text-[#172762]
      "
    >
      {children}

      {required && (
        <span className="ml-[3px] text-[#E53935]">
          *
        </span>
      )}
    </label>
  );
}

/* ============================================================
   SECTION TITLE
============================================================ */

function SectionTitle({
  number,
  title,
  subtitle,
}: {
  number: number;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-start gap-[10px]">
      <div
        className="
          flex
          h-[25px]
          w-[25px]
          shrink-0
          items-center
          justify-center
          rounded-full
          bg-[#087A3D]
          text-[10px]
          font-semibold
          text-white
        "
      >
        {number}
      </div>

      <div>
        <h2
          className="
            text-[11px]
            font-semibold
            leading-[15px]
            text-[#14603A]
          "
        >
          {title}
        </h2>

        <p
          className="
            mt-[2px]
            text-[9px]
            font-semibold
            text-[#43527D]
          "
        >
          {subtitle}
        </p>
      </div>
    </div>
  );
}

/* ============================================================
   PAGE
============================================================ */

export default function AddNewsletterSubscriberPage() {
  const router = useRouter();

  const [form, setForm] =
    useState<FormState>(defaultForm);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  /* ==========================================================
     DYNAMIC VALUES
  ========================================================== */

  const selectedInterestNames = useMemo(() => {
    return interestOptions
      .filter((interest) =>
        form.interests.includes(interest.id)
      )
      .map((interest) => interest.title);
  }, [form.interests]);

  const frequencyName = useMemo(() => {
    return (
      frequencyOptions.find(
        (option) =>
          option.value === form.frequency
      )?.label ?? ""
    );
  }, [form.frequency]);

  const today = useMemo(() => {
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date());
  }, []);

  /* ==========================================================
     UPDATE
  ========================================================== */

  function updateField<K extends keyof FormState>(
    key: K,
    value: FormState[K]
  ) {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));

    setError("");
    setSuccess("");
  }

  /* ==========================================================
     INTERESTS
  ========================================================== */

  function toggleInterest(id: InterestId) {
    setForm((previous) => {
      const selected =
        previous.interests.includes(id);

      return {
        ...previous,

        interests: selected
          ? previous.interests.filter(
            (interest) =>
              interest !== id
          )
          : [
            ...previous.interests,
            id,
          ],
      };
    });
  }

  /* ==========================================================
     VALIDATION
  ========================================================== */

  function validateForm() {
    if (!form.fullName.trim()) {
      return "Please enter subscriber name.";
    }

    if (!form.email.trim()) {
      return "Email address is required.";
    }

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
      !emailPattern.test(
        form.email.trim()
      )
    ) {
      return "Please enter a valid email address.";
    }

    if (!form.source) {
      return "Please select subscription source.";
    }

    if (!form.status) {
      return "Please select subscriber status.";
    }

    if (!form.consent) {
      return "Subscriber consent is required.";
    }

    return "";
  }

  /* ==========================================================
     API PAYLOAD
  ========================================================== */

  function buildPayload():
    CreateSubscriberPayload {
    return {
      name: form.fullName.trim(),

      email: form.email
        .trim()
        .toLowerCase(),

      phone: form.phone.trim()
        ? `${form.countryCode} ${form.phone.trim()}`
        : undefined,

      source: form.source || undefined,

      language:
        form.language || undefined,

      status: form.status,

      interests:
        selectedInterestNames,

      frequency: form.frequency,

      notes:
        form.notes.trim() || undefined,

      consent: form.consent,
    };
  }

  /* ==========================================================
     SAVE SUBSCRIBER

     newsletterApi.create() agar tumhare API me hai,
     direct use ho jayega.
  ========================================================== */

  async function handleSubmit(
    event?: FormEvent
  ) {
    event?.preventDefault();

    const validation =
      validateForm();

    if (validation) {
      setError(validation);
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const payload =
        buildPayload();

      /*
       * Existing API type ko break na karne ke liye
       * create method ko safe way me access kar rahe hain.
       */

      const api =
        newsletterApi as typeof newsletterApi & {
          create?: (
            payload: CreateSubscriberPayload
          ) => Promise<unknown>;
        };

      if (
        typeof api.create !== "function"
      ) {
        throw new Error(
          "newsletterApi.create() is not configured."
        );
      }

      await api.create(payload);

      setSuccess(
        "Subscriber saved successfully."
      );

      setForm(defaultForm);

      setTimeout(() => {
        router.back();
      }, 700);
    } catch (submitError) {
      console.error(
        "Subscriber save failed:",
        submitError
      );

      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to save subscriber."
      );
    } finally {
      setSaving(false);
    }
  }

  /* ==========================================================
     SAVE DRAFT
  ========================================================== */

  function handleSaveDraft() {
    try {
      window.localStorage.setItem(
        "newsletter-subscriber-draft",
        JSON.stringify(form)
      );

      setError("");
      setSuccess(
        "Draft saved successfully."
      );
    } catch {
      setError(
        "Unable to save draft."
      );
    }
  }

  /* ==========================================================
     UI
  ========================================================== */

  return (
    <form
      onSubmit={handleSubmit}
      className="
        w-full
        min-w-0
        bg-white
        px-[16px]
        pb-[18px]
        pt-[12px]
      "
    >
      {/* ======================================================
          PAGE HEADER
      ====================================================== */}

      <div
        className="
          flex
          items-start
          justify-between
          gap-[20px]
        "
      >
        <div>
          <h1
            className="
              text-[20px]
              font-semibold
              leading-[25px]
              tracking-[-0.35px]
              text-[#005E2E]
            "
          >
            Add New Subscriber
          </h1>

          {/* BREADCRUMB */}

          <div
            className="
              mt-[7px]
              flex
              items-center
              gap-[6px]
              text-[9px]
              font-semibold
              text-[#48577F]
            "
          >
            <button
              type="button"
              onClick={() =>
                router.push("/")
              }
              className="hover:text-[#006333]"
            >
              Dashboard
            </button>

            <ChevronRight size={11} />

            <button
              type="button"
              onClick={() =>
                router.back()
              }
              className="hover:text-[#006333]"
            >
              Newsletter Subscribers
            </button>

            <ChevronRight size={11} />

            <span className="text-[#273B74]">
              Add New Subscriber
            </span>
          </div>
        </div>

        {/* TOP BUTTONS */}

        <div
          className="
            flex
            shrink-0
            items-center
            gap-[14px]
            pt-[1px]
          "
        >
          <button
            type="button"
            onClick={handleSaveDraft}
            className="
              flex
              h-[37px]
              items-center
              gap-[8px]
              rounded-[5px]
              border
              border-[#E0E5EB]
              bg-white
              px-[18px]
              text-[9px]
              font-semibold
              text-[#172762]
            "
          >
            <Save size={14} />

            Save as Draft
          </button>

          <button
            type="submit"
            disabled={saving}
            className="
              flex
              h-[37px]
              items-center
              gap-[8px]
              rounded-[5px]
              bg-[#00612F]
              px-[19px]
              text-[9px]
              font-semibold
              text-white
              shadow-[0_2px_5px_rgba(0,97,47,0.16)]
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            <Send size={14} />

            {saving
              ? "Saving..."
              : "Save Subscriber"}
          </button>
        </div>
      </div>

      {/* ======================================================
          ALERT
      ====================================================== */}

      {(error || success) && (
        <div
          className={`
            mt-[12px]
            rounded-[5px]
            border
            px-[12px]
            py-[8px]
            text-[9px]
            font-semibold

            ${error
              ? "border-[#F6D3D3] bg-[#FFF4F4] text-[#C83A3A]"
              : "border-[#CCE8D4] bg-[#F1FAF3] text-[#18753F]"
            }
          `}
        >
          {error || success}
        </div>
      )}

      {/* ======================================================
          CONTENT
      ====================================================== */}

      <div
        className="
          mt-[18px]
          grid
          min-w-0
          grid-cols-[minmax(0,1fr)_282px]
          gap-[18px]
        "
      >
        {/* ====================================================
            LEFT FORM
        ==================================================== */}

        <div
          className="
            min-w-0
            rounded-[7px]
            border
            border-[#E3E7EC]
            bg-white
            px-[16px]
            pb-[15px]
            pt-[14px]
          "
        >
          {/* ==================================================
              1. SUBSCRIBER INFORMATION
          ================================================== */}

          <section>
            <SectionTitle
              number={1}
              title="Subscriber Information"
              subtitle="Basic details of the subscriber"
            />

            <div
              className="
                mt-[18px]
                grid
                grid-cols-3
                gap-x-[20px]
                gap-y-[16px]
              "
            >
              {/* FULL NAME */}

              <div>
                <FieldLabel required>
                  Full Name
                </FieldLabel>

                <input
                  type="text"
                  value={form.fullName}
                  onChange={(event) =>
                    updateField(
                      "fullName",
                      event.target.value
                    )
                  }
                  placeholder="Enter full name"
                  className="
                    h-[38px]
                    w-full
                    rounded-[5px]
                    border
                    border-[#E0E5EB]
                    bg-white
                    px-[12px]
                    text-[9px]
                    font-semibold
                    text-[#172762]
                    outline-none
                    transition
                    placeholder:text-[#697593]
                    focus:border-[#75B78E]
                  "
                />
              </div>

              {/* EMAIL */}

              <div>
                <FieldLabel required>
                  Email Address
                </FieldLabel>

                <input
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    updateField(
                      "email",
                      event.target.value
                    )
                  }
                  placeholder="Enter email address"
                  className="
                    h-[38px]
                    w-full
                    rounded-[5px]
                    border
                    border-[#E0E5EB]
                    bg-white
                    px-[12px]
                    text-[9px]
                    font-semibold
                    text-[#172762]
                    outline-none
                    placeholder:text-[#697593]
                    focus:border-[#75B78E]
                  "
                />
              </div>

              {/* PHONE */}

              <div>
                <FieldLabel>
                  Phone Number
                </FieldLabel>

                <div
                  className="
                    grid
                    grid-cols-[70px_minmax(0,1fr)]
                    gap-[8px]
                  "
                >
                  <div className="relative">
                    <select
                      value={
                        form.countryCode
                      }
                      onChange={(
                        event
                      ) =>
                        updateField(
                          "countryCode",
                          event.target
                            .value
                        )
                      }
                      className="
                        h-[38px]
                        w-full
                        appearance-none
                        rounded-[5px]
                        border
                        border-[#E0E5EB]
                        bg-white
                        px-[11px]
                        pr-[25px]
                        text-[9px]
                        font-semibold
                        text-[#172762]
                        outline-none
                      "
                    >
                      <option value="+91">
                        +91
                      </option>

                      <option value="+1">
                        +1
                      </option>

                      <option value="+44">
                        +44
                      </option>

                      <option value="+971">
                        +971
                      </option>
                    </select>

                    <ChevronDown
                      size={11}
                      className="
                        pointer-events-none
                        absolute
                        right-[8px]
                        top-1/2
                        -translate-y-1/2
                        text-[#172762]
                      "
                    />
                  </div>

                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(event) =>
                      updateField(
                        "phone",
                        event.target.value
                      )
                    }
                    placeholder="Enter phone number"
                    className="
                      h-[38px]
                      min-w-0
                      rounded-[5px]
                      border
                      border-[#E0E5EB]
                      bg-white
                      px-[12px]
                      text-[9px]
                      font-semibold
                      text-[#172762]
                      outline-none
                      placeholder:text-[#697593]
                      focus:border-[#75B78E]
                    "
                  />
                </div>
              </div>

              {/* SOURCE */}

              <div>
                <FieldLabel required>
                  Subscription Source
                </FieldLabel>

                <div className="relative">
                  <select
                    value={form.source}
                    onChange={(event) =>
                      updateField(
                        "source",
                        event.target.value
                      )
                    }
                    className="
                      h-[38px]
                      w-full
                      appearance-none
                      rounded-[5px]
                      border
                      border-[#E0E5EB]
                      bg-white
                      px-[12px]
                      pr-[32px]
                      text-[9px]
                      font-semibold
                      text-[#172762]
                      outline-none
                    "
                  >
                    <option value="">
                      Select Source
                    </option>

                    {sourceOptions.map(
                      (source) => (
                        <option
                          key={source}
                          value={source}
                        >
                          {source}
                        </option>
                      )
                    )}
                  </select>

                  <ChevronDown
                    size={12}
                    className="
                      pointer-events-none
                      absolute
                      right-[10px]
                      top-1/2
                      -translate-y-1/2
                      text-[#172762]
                    "
                  />
                </div>
              </div>

              {/* LANGUAGE */}

              <div>
                <FieldLabel>
                  Preferred Language
                </FieldLabel>

                <div className="relative">
                  <select
                    value={
                      form.language
                    }
                    onChange={(event) =>
                      updateField(
                        "language",
                        event.target.value
                      )
                    }
                    className="
                      h-[38px]
                      w-full
                      appearance-none
                      rounded-[5px]
                      border
                      border-[#E0E5EB]
                      bg-white
                      px-[12px]
                      pr-[32px]
                      text-[9px]
                      font-semibold
                      text-[#172762]
                      outline-none
                    "
                  >
                    <option value="">
                      Select Language
                    </option>

                    {languageOptions.map(
                      (language) => (
                        <option
                          key={language}
                          value={language}
                        >
                          {language}
                        </option>
                      )
                    )}
                  </select>

                  <ChevronDown
                    size={12}
                    className="
                      pointer-events-none
                      absolute
                      right-[10px]
                      top-1/2
                      -translate-y-1/2
                      text-[#172762]
                    "
                  />
                </div>
              </div>

              {/* STATUS */}

              <div>
                <FieldLabel required>
                  Status
                </FieldLabel>

                <div className="relative">
                  <select
                    value={form.status}
                    onChange={(event) =>
                      updateField(
                        "status",
                        event.target
                          .value as SubscriberStatus
                      )
                    }
                    className="
                      h-[38px]
                      w-full
                      appearance-none
                      rounded-[5px]
                      border
                      border-[#E0E5EB]
                      bg-white
                      px-[32px]
                      pr-[34px]
                      text-[9px]
                      font-semibold
                      text-[#172762]
                      outline-none
                    "
                  >
                    <option value="Active">
                      Active
                    </option>

                    <option value="Inactive">
                      Inactive
                    </option>

                    <option value="Unsubscribed">
                      Unsubscribed
                    </option>
                  </select>

                  <span
                    className={`
                      absolute
                      left-[12px]
                      top-1/2
                      h-[8px]
                      w-[8px]
                      -translate-y-1/2
                      rounded-full

                      ${form.status ===
                        "Active"
                        ? "bg-[#20A34A]"
                        : form.status ===
                          "Inactive"
                          ? "bg-[#F0A126]"
                          : "bg-[#E24B4B]"
                      }
                    `}
                  />

                  <ChevronDown
                    size={12}
                    className="
                      pointer-events-none
                      absolute
                      right-[10px]
                      top-1/2
                      -translate-y-1/2
                      text-[#172762]
                    "
                  />
                </div>
              </div>
            </div>
          </section>

          {/* DIVIDER */}

          <div
            className="
              my-[18px]
              h-px
              w-full
              bg-[#EEF0F2]
            "
          />

          {/* ==================================================
              2. PREFERENCES
          ================================================== */}

          <section>
            <SectionTitle
              number={2}
              title="Preferences"
              subtitle="Choose what the subscriber wants to receive"
            />

            <p
              className="
                mt-[16px]
                text-[9px]
                font-semibold
                text-[#172762]
              "
            >
              Subscription Interests
              <span className="ml-[3px] text-[#357149]">
                (Select all that apply)
              </span>
            </p>

            {/* INTEREST CARDS */}

            <div
              className="
                mt-[10px]
                grid
                grid-cols-3
                gap-[10px]
              "
            >
              {interestOptions.map(
                (interest) => {
                  const Icon =
                    interest.icon;

                  const selected =
                    form.interests.includes(
                      interest.id
                    );

                  return (
                    <button
                      type="button"
                      key={interest.id}
                      onClick={() =>
                        toggleInterest(
                          interest.id
                        )
                      }
                      className={`
                        relative
                        flex
                        min-h-[64px]
                        items-center
                        gap-[10px]
                        rounded-[6px]
                        border
                        px-[10px]
                        py-[9px]
                        text-left
                        transition

                        ${selected
                          ? "border-[#8CCBA3] bg-[#FAFFFB]"
                          : "border-[#E4E8ED] bg-white hover:border-[#C9D1D9]"
                        }
                      `}
                    >
                      <div
                        className="
                          flex
                          h-[34px]
                          w-[34px]
                          shrink-0
                          items-center
                          justify-center
                          rounded-full
                        "
                        style={{
                          backgroundColor:
                            interest.iconBg,
                        }}
                      >
                        <Icon
                          size={17}
                          strokeWidth={2}
                          style={{
                            color:
                              interest.iconColor,
                          }}
                        />
                      </div>

                      <div
                        className="
                          min-w-0
                          flex-1
                          pr-[23px]
                        "
                      >
                        <p
                          className="
                            text-[9px]
                            font-semibold
                            leading-[11px]
                            text-[#1B2E68]
                          "
                        >
                          {interest.title}
                        </p>

                        <p
                          className="
                            mt-[4px]
                            text-[9px]
                            font-semibold
                            leading-[9px]
                            text-[#566486]
                          "
                        >
                          {
                            interest.description
                          }
                        </p>
                      </div>

                      <span
                        className={`
                          absolute
                          right-[10px]
                          top-[23px]
                          flex
                          h-[17px]
                          w-[17px]
                          items-center
                          justify-center
                          rounded-[3px]
                          border

                          ${selected
                            ? "border-[#138243] bg-[#138243]"
                            : "border-[#C9D0D9] bg-white"
                          }
                        `}
                      >
                        {selected && (
                          <Check
                            size={11}
                            strokeWidth={
                              3
                            }
                            className="text-white"
                          />
                        )}
                      </span>
                    </button>
                  );
                }
              )}
            </div>

            {/* FREQUENCY */}

            <div className="mt-[17px]">
              <p
                className="
                  text-[9px]
                  font-semibold
                  text-[#172762]
                "
              >
                Frequency Preference
              </p>

              <div
                className="
                  mt-[11px]
                  grid
                  grid-cols-4
                  gap-[12px]
                "
              >
                {frequencyOptions.map(
                  (option) => (
                    <label
                      key={
                        option.value
                      }
                      className="
                        flex
                        cursor-pointer
                        items-center
                        gap-[8px]
                      "
                    >
                      <input
                        type="radio"
                        name="frequency"
                        checked={
                          form.frequency ===
                          option.value
                        }
                        onChange={() =>
                          updateField(
                            "frequency",
                            option.value
                          )
                        }
                        className="
                          h-[14px]
                          w-[14px]
                          accent-[#118043]
                        "
                      />

                      <span
                        className="
                          text-[9px]
                          font-semibold
                          text-[#26396F]
                        "
                      >
                        {option.label}
                      </span>
                    </label>
                  )
                )}
              </div>
            </div>
          </section>

          {/* DIVIDER */}

          <div
            className="
              my-[18px]
              h-px
              w-full
              bg-[#EEF0F2]
            "
          />

          {/* ==================================================
              3. ADDITIONAL INFORMATION
          ================================================== */}

          <section>
            <SectionTitle
              number={3}
              title="Additional Information (Optional)"
              subtitle="Any additional notes about this subscriber"
            />

            <div className="mt-[14px]">
              <FieldLabel>
                Notes
              </FieldLabel>

              <div className="relative">
                <textarea
                  value={form.notes}
                  maxLength={500}
                  onChange={(event) =>
                    updateField(
                      "notes",
                      event.target.value
                    )
                  }
                  placeholder="Add any notes about this subscriber..."
                  className="
                    h-[68px]
                    w-full
                    resize-none
                    rounded-[6px]
                    border
                    border-[#E0E5EB]
                    bg-white
                    px-[12px]
                    py-[10px]
                    pr-[55px]
                    text-[9px]
                    font-semibold
                    text-[#172762]
                    outline-none
                    placeholder:text-[#697593]
                    focus:border-[#75B78E]
                  "
                />

                <span
                  className="
                    absolute
                    bottom-[8px]
                    right-[10px]
                    text-[9px]
                    font-semibold
                    text-[#60708E]
                  "
                >
                  {form.notes.length}
                  /500
                </span>
              </div>
            </div>
          </section>

          {/* DIVIDER */}

          <div
            className="
              my-[18px]
              h-px
              w-full
              bg-[#EEF0F2]
            "
          />

          {/* ==================================================
              4. CONSENT
          ================================================== */}

          <section>
            <SectionTitle
              number={4}
              title="Consent & Confirmation"
              subtitle="Ensure consent from the subscriber"
            />

            <label
              className="
                mt-[15px]
                flex
                cursor-pointer
                items-start
                gap-[10px]
              "
            >
              <span
                className={`
                  mt-[1px]
                  flex
                  h-[18px]
                  w-[18px]
                  shrink-0
                  items-center
                  justify-center
                  rounded-[3px]
                  border

                  ${form.consent
                    ? "border-[#08783B] bg-[#08783B]"
                    : "border-[#C9D0D9] bg-white"
                  }
                `}
              >
                {form.consent && (
                  <Check
                    size={12}
                    strokeWidth={3}
                    className="text-white"
                  />
                )}
              </span>

              <input
                type="checkbox"
                checked={form.consent}
                onChange={(event) =>
                  updateField(
                    "consent",
                    event.target.checked
                  )
                }
                className="sr-only"
              />

              <span
                className="
                  text-[9px]
                  font-semibold
                  leading-[13px]
                  text-[#263A70]
                "
              >
                I confirm that the
                subscriber has given
                consent to receive
                newsletters and
                communications from
                Moksha Sewa.
              </span>
            </label>
          </section>
        </div>

        {/* ====================================================
            RIGHT SIDEBAR
        ==================================================== */}

        <aside className="min-w-0">
          {/* ==================================================
              QUICK TIPS
          ================================================== */}

          <div
            className="
              rounded-[7px]
              border
              border-[#E4E9E5]
              bg-[#FBFDFB]
              px-[17px]
              pb-[17px]
              pt-[17px]
            "
          >
            <div
              className="
                flex
                items-center
                gap-[10px]
              "
            >
              <Lightbulb
                size={24}
                strokeWidth={1.8}
                className="
                  shrink-0
                  text-[#19884A]
                "
              />

              <h2
                className="
                  text-[11px]
                  font-semibold
                  text-[#17683B]
                "
              >
                Quick Tips
              </h2>
            </div>

            <div
              className="
                mt-[17px]
                space-y-[15px]
              "
            >
              {[
                "Email is required for newsletter subscription.",
                "Choose relevant interests for better engagement.",
                "Subscribers can update preferences anytime.",
                "We respect privacy and never share email.",
              ].map((tip) => (
                <div
                  key={tip}
                  className="
                    flex
                    items-start
                    gap-[8px]
                  "
                >
                  <div
                    className="
                      mt-[1px]
                      flex
                      h-[13px]
                      w-[13px]
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      bg-[#118043]
                    "
                  >
                    <Check
                      size={8}
                      strokeWidth={3}
                      className="text-white"
                    />
                  </div>

                  <p
                    className="
                      text-[10px]
                      font-semibold
                      leading-[11px]
                      text-[#42527D]
                    "
                  >
                    {tip}
                  </p>
                </div>
              ))}
            </div>

            {/* DECORATIVE LEAF */}

            <div
              className="
                mt-[8px]
                flex
                justify-end
              "
            >
              <span
                className="
                  text-[35px]
                  leading-none
                  opacity-[0.12]
                "
              >
                🌿
              </span>
            </div>
          </div>

          {/* ==================================================
              SUBSCRIPTION SUMMARY
          ================================================== */}

          <div
            className="
              mt-[15px]
              rounded-[7px]
              border
              border-[#E2E6EB]
              bg-white
              px-[16px]
              pb-[12px]
              pt-[15px]
            "
          >
            <h2
              className="
                text-[10px]
                font-semibold
                text-[#17643A]
              "
            >
              Subscription Summary
            </h2>

            <div className="mt-[12px]">
              {/* NAME */}

              <SummaryRow
                label="Subscriber Name"
                value={
                  form.fullName.trim() ||
                  "-"
                }
              />

              <SummaryRow
                label="Email Address"
                value={
                  form.email.trim() ||
                  "-"
                }
              />

              <SummaryRow
                label="Status"
                value={
                  <span
                    className="
                      flex
                      items-center
                      gap-[6px]
                    "
                  >
                    <span
                      className={`
                        h-[7px]
                        w-[7px]
                        rounded-full

                        ${form.status ===
                          "Active"
                          ? "bg-[#1DA34B]"
                          : form.status ===
                            "Inactive"
                            ? "bg-[#F1A224]"
                            : "bg-[#E14949]"
                        }
                      `}
                    />

                    {form.status}
                  </span>
                }
              />

              <SummaryRow
                label="Source"
                value={
                  form.source || "-"
                }
              />

              <SummaryRow
                label="Subscribed On"
                value={today}
              />

              <SummaryRow
                label="Preferences"
                value={
                  selectedInterestNames
                    .length > 0
                    ? `${selectedInterestNames.length} selected`
                    : "Not selected"
                }
              />

              <div className="pt-[10px]">
                <p
                  className="
                    text-[9px]
                    font-semibold
                    text-[#1B2D68]
                  "
                >
                  Frequency
                </p>

                <p
                  className="
                    mt-[5px]
                    text-[9px]
                    font-semibold
                    leading-[11px]
                    text-[#586583]
                  "
                >
                  {frequencyName}
                </p>
              </div>
            </div>
          </div>

          {/* ==================================================
              NEED HELP
          ================================================== */}

          <div
            className="
              mt-[15px]
              rounded-[7px]
              border
              border-[#E1E8F1]
              bg-[#F9FBFF]
              px-[17px]
              pb-[19px]
              pt-[18px]
            "
          >
            <div
              className="
                flex
                items-start
                gap-[12px]
              "
            >
              <Headphones
                size={28}
                strokeWidth={1.8}
                className="
                  shrink-0
                  text-[#1C6BE1]
                "
              />

              <div>
                <h2
                  className="
                    text-[11px]
                    font-semibold
                    text-[#1C3477]
                  "
                >
                  Need Help?
                </h2>

                <p
                  className="
                    mt-[7px]
                    text-[9px]
                    font-semibold
                    text-[#40507A]
                  "
                >
                  For any assistance,
                  contact our team.
                </p>

                <div
                  className="
                    mt-[14px]
                    flex
                    h-[37px]
                    items-center
                    gap-[9px]
                    rounded-[5px]
                    border
                    border-[#D9E4DD]
                    bg-white
                    px-[12px]
                  "
                >
                  <Phone
                    size={15}
                    className="
                      shrink-0
                      text-[#208447]
                    "
                  />

                  <span
                    className="
                      whitespace-nowrap
                      text-[9px]
                      font-semibold
                      text-[#21713A]
                    "
                  >
                    +91 98765 43210
                  </span>
                </div>

                <div
                  className="
                    mt-[13px]
                    flex
                    items-center
                    gap-[9px]
                  "
                >
                  <Mail
                    size={15}
                    className="
                      shrink-0
                      text-[#208447]
                    "
                  />

                  <span
                    className="
                      whitespace-nowrap
                      text-[9px]
                      font-semibold
                      text-[#263B74]
                    "
                  >
                    support@mokshasewa.org
                  </span>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* ======================================================
          BOTTOM ACTIONS
      ====================================================== */}

      <div
        className="
          mt-[17px]
          flex
          items-center
          justify-between
        "
      >
        <button
          type="button"
          onClick={() =>
            router.back()
          }
          className="
            flex
            h-[35px]
            items-center
            gap-[7px]
            rounded-[5px]
            border
            border-[#E0E5EB]
            bg-white
            px-[15px]
            text-[9px]
            font-semibold
            text-[#172762]
          "
        >
          <X size={13} />

          Cancel
        </button>

        <div
          className="
            flex
            items-center
            gap-[14px]
          "
        >
          <button
            type="button"
            onClick={handleSaveDraft}
            className="
              flex
              h-[35px]
              items-center
              gap-[8px]
              rounded-[5px]
              border
              border-[#E0E5EB]
              bg-white
              px-[16px]
              text-[9px]
              font-semibold
              text-[#172762]
            "
          >
            <Save size={13} />

            Save as Draft
          </button>

          <button
            type="submit"
            disabled={saving}
            className="
              flex
              h-[35px]
              items-center
              gap-[8px]
              rounded-[5px]
              bg-[#00612F]
              px-[17px]
              text-[9px]
              font-semibold
              text-white
              disabled:opacity-60
            "
          >
            <Send size={13} />

            {saving
              ? "Saving..."
              : "Save Subscriber"}
          </button>
        </div>
      </div>
    </form>
  );
}

/* ============================================================
   SUMMARY ROW
============================================================ */

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div
      className="
        grid
        min-h-[39px]
        grid-cols-[1fr_1.05fr]
        items-center
        gap-[8px]
        border-b
        border-[#EEF0F2]
        py-[7px]
      "
    >
      <span
        className="
          text-[9px]
          font-semibold
          text-[#1B2D68]
        "
      >
        {label}
      </span>

      <div
        className="
          min-w-0
          break-words
          text-[9px]
          font-semibold
          leading-[10px]
          text-[#27396E]
        "
      >
        {value}
      </div>
    </div>
  );
}
