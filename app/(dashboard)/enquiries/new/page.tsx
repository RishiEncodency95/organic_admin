"use client";

import {
  useRef,
  useState,
  useEffect,
  Suspense,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from "react";

import { useRouter, useSearchParams } from "next/navigation";

import {
  CalendarDays,
  Check,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  CircleUserRound,
  FileText,
  HandHeart,
  Headphones,
  HeartHandshake,
  Info,
  Mail,
  MapPin,
  MessageCircleMore,
  Phone,
  Save,
  Send,
  ShieldCheck,
  Truck,
  UploadCloud,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";

import { enquiriesApi } from "@/lib/enquiriesApi";

/* ============================================================
   TYPES
============================================================ */

type Priority =
  | "Low"
  | "Medium"
  | "High"
  | "Urgent";

type ContactMethod =
  | "Phone"
  | "Email"
  | "WhatsApp"
  | "Any";

type EnquiryForm = {
  source: string;
  enquiryDate: string;
  responseTime: string;

  subject: string;
  category: string;
  priority: Priority;

  description: string;

  fullName: string;
  email: string;

  countryCode: string;
  phone: string;

  alternatePhone: string;

  city: string;
  state: string;

  relationship: string;

  preferredContactMethod: ContactMethod;

  communicationLanguage: string;

  relatedToServices: string;
  interestedService: string;

  contactedBefore: string;

  heardAbout: string;
};

type EnquiryCreatePayload = {
  name: string;
  email?: string;
  phone: string;

  message: string;

  subject?: string;
  source?: string;
  category?: string;

  priority?: string;

  city?: string;
  state?: string;

  relationship?: string;

  preferredContactMethod?: string;

  communicationLanguage?: string;

  interestedService?: string;

  contactedBefore?: string;

  heardAbout?: string;

  preferredResponseTime?: string;

  enquiryDate?: string;

  alternatePhone?: string;

  attachment?: File | null;
};

/* ============================================================
   DEFAULT FORM
============================================================ */

function getCurrentLocalDateTime() {
  const now = new Date();

  const offset =
    now.getTimezoneOffset() * 60000;

  return new Date(
    now.getTime() - offset
  )
    .toISOString()
    .slice(0, 16);
}

const DEFAULT_FORM: EnquiryForm = {
  source: "",
  enquiryDate:
    getCurrentLocalDateTime(),

  responseTime: "",

  subject: "",
  category: "",
  priority: "Medium",

  description: "",

  fullName: "",
  email: "",

  countryCode: "+91",
  phone: "",

  alternatePhone: "",

  city: "",
  state: "",

  relationship: "",

  preferredContactMethod:
    "Phone",

  communicationLanguage: "",

  relatedToServices: "",
  interestedService: "",

  contactedBefore: "",

  heardAbout: "",
};

/* ============================================================
   OPTIONS
============================================================ */

const sourceOptions = [
  "Website Form",
  "Phone Call",
  "WhatsApp",
  "Email",
  "Walk-in / Referral",
  "Social Media",
  "Other",
];

const categoryOptions = [
  "Sewa Support",
  "Last Rites Support",
  "Ritual & Priest Support",
  "Transport & Logistics",
  "Donation & Contribution",
  "Volunteer",
  "CSR & Partnership",
  "Documentation",
  "Information",
  "Others",
];

const serviceOptions = [
  "Final Journey & Transport",
  "Cremation & Last Rites",
  "Ritual & Priest Support",
  "Family & On-Ground Support",
  "Unclaimed Body Sewa",
  "Volunteer Support",
  "Donation Support",
  "CSR Partnership",
  "Other",
];

const stateOptions = [
  "Delhi",
  "Uttar Pradesh",
  "Haryana",
  "Rajasthan",
  "Punjab",
  "Uttarakhand",
  "Madhya Pradesh",
  "Maharashtra",
  "Gujarat",
  "Bihar",
  "West Bengal",
  "Other",
];

const languageOptions = [
  "Hindi",
  "English",
  "Hindi & English",
  "Punjabi",
  "Urdu",
  "Bengali",
  "Gujarati",
  "Marathi",
  "Other",
];

/* ============================================================
   POPULAR CATEGORIES
============================================================ */

const popularCategories = [
  {
    title: "Sewa Support",
    description:
      "General assistance & support",
    icon: ShieldCheck,
    bg: "#EEEAFD",
    color: "#6751D3",
  },

  {
    title: "Last Rites Support",
    description:
      "Cremation & last rites related help",
    icon: CircleHelp,
    bg: "#FDE9ED",
    color: "#E54255",
  },

  {
    title: "Ritual & Priest Support",
    description:
      "Pooja, rituals & priest arrangement",
    icon: HandHeart,
    bg: "#F3E8FD",
    color: "#9450D5",
  },

  {
    title: "Transport & Logistics",
    description:
      "Transport & vehicle assistance",
    icon: Truck,
    bg: "#E6F5FA",
    color: "#2798B3",
  },

  {
    title: "Donation & Contribution",
    description:
      "Donation, CSR & partnership",
    icon: HeartHandshake,
    bg: "#FFF1DE",
    color: "#ED961E",
  },

  {
    title: "Others",
    description:
      "Other general enquiries",
    icon: MessageCircleMore,
    bg: "#EAF0FD",
    color: "#506DC4",
  },
];

/* ============================================================
   PAGE
============================================================ */

function AddNewEnquiryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlCategory = searchParams.get("category");

  const fileInputRef =
    useRef<HTMLInputElement>(null);

  const [form, setForm] =
    useState<EnquiryForm>(
      DEFAULT_FORM
    );

  const [
    attachment,
    setAttachment,
  ] = useState<File | null>(null);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [submitted, setSubmitted] =
    useState(false);

  useEffect(() => {
    if (!urlCategory) return;
    const cat = urlCategory.toLowerCase();
    if (cat === "csr") {
      setForm((prev) => ({ ...prev, category: "CSR & Partnership" }));
    } else if (cat === "contact" || cat === "general") {
      setForm((prev) => ({ ...prev, category: "Sewa Support" }));
    } else {
      const match = categoryOptions.find(
        (c) => c.toLowerCase() === cat
      );
      if (match) {
        setForm((prev) => ({ ...prev, category: match }));
      }
    }
  }, [urlCategory]);

  /* ==========================================================
     UPDATE FIELD
  ========================================================== */

  function updateField<
    K extends keyof EnquiryForm
  >(
    key: K,
    value: EnquiryForm[K]
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));

    setError("");
    setSuccess("");
  }

  /* ==========================================================
     FILE
  ========================================================== */

  function handleFileChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

    if (!file) return;

    const allowed = [
      "image/jpeg",
      "image/png",
      "application/pdf",
    ];

    if (
      !allowed.includes(file.type)
    ) {
      setError(
        "Only JPG, PNG and PDF files are allowed."
      );
      return;
    }

    if (
      file.size >
      10 * 1024 * 1024
    ) {
      setError(
        "Attachment must be less than 10MB."
      );
      return;
    }

    setAttachment(file);
    setError("");
  }

  /* ==========================================================
     VALIDATION
  ========================================================== */

  function validate() {
    if (!form.source) {
      return "Enquiry source is required.";
    }

    if (!form.enquiryDate) {
      return "Enquiry date and time is required.";
    }

    if (!form.subject.trim()) {
      return "Subject is required.";
    }

    if (!form.category) {
      return "Category is required.";
    }

    if (
      !form.description.trim()
    ) {
      return "Enquiry description is required.";
    }

    if (!form.fullName.trim()) {
      return "Full name is required.";
    }

    if (!form.email.trim()) {
      return "Email address is required.";
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        form.email.trim()
      )
    ) {
      return "Please enter a valid email address.";
    }

    if (!form.phone.trim()) {
      return "Phone number is required.";
    }

    return "";
  }

  /* ==========================================================
     PAYLOAD
  ========================================================== */

  function buildPayload():
    EnquiryCreatePayload {
    return {
      name:
        form.fullName.trim(),

      email:
        form.email
          .trim()
          .toLowerCase(),

      phone:
        `${form.countryCode} ${form.phone.trim()}`,

      alternatePhone:
        form.alternatePhone.trim() ||
        undefined,

      message:
        form.description.trim(),

      subject:
        form.subject.trim(),

      source:
        form.source ||
        undefined,

      category:
        form.category ||
        undefined,

      priority:
        form.priority ||
        undefined,

      city:
        form.city.trim() ||
        undefined,

      state:
        form.state ||
        undefined,

      relationship:
        form.relationship ||
        undefined,

      preferredContactMethod:
        form.preferredContactMethod,

      communicationLanguage:
        form.communicationLanguage ||
        undefined,

      interestedService:
        form.interestedService ||
        undefined,

      contactedBefore:
        form.contactedBefore ||
        undefined,

      heardAbout:
        form.heardAbout ||
        undefined,

      preferredResponseTime:
        form.responseTime ||
        undefined,

      enquiryDate:
        form.enquiryDate ||
        undefined,

      attachment,
    };
  }

  /* ==========================================================
     SUBMIT
  ========================================================== */

  async function handleSubmit(
    event: FormEvent
  ) {
    event.preventDefault();

    const validation =
      validate();

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
       * Keeps your existing API safe.
       * If create() already exists, it is used directly.
       */

      const api =
        enquiriesApi as typeof enquiriesApi & {
          create?: (
            payload:
              EnquiryCreatePayload
          ) => Promise<unknown>;
        };

      if (
        typeof api.create !==
        "function"
      ) {
        throw new Error(
          "enquiriesApi.create() is not configured."
        );
      }

      await api.create(payload);

      setSuccess(
        "Enquiry created successfully."
      );
      setSubmitted(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not create enquiry."
      );
    } finally {
      setSaving(false);
    }
  }

  /* ==========================================================
     DRAFT
  ========================================================== */

  function saveDraft() {
    try {
      localStorage.setItem(
        "moksha-new-enquiry-draft",
        JSON.stringify(form)
      );

      setSuccess(
        "Draft saved successfully."
      );

      setError("");
    } catch {
      setError(
        "Could not save draft."
      );
    }
  }

  /* ==========================================================
     UI
  ========================================================== */

  if (submitted) {
    return (
      <div className="mx-auto max-w-[800px] p-[30px]">
        <div className="flex flex-col items-center justify-center rounded-[12px] border border-[#DCE3EA] bg-white p-[48px] text-center shadow-sm">
          <div className="flex h-[64px] w-[64px] items-center justify-center rounded-full bg-[#EBF7F0] text-[#005F2E]">
            <Check size={36} strokeWidth={3} />
          </div>
          <h2 className="mt-[20px] text-[22px] font-semibold text-[#17234A]">
            Enquiry Recorded Successfully!
          </h2>
          <p className="mt-[8px] max-w-[450px] text-[12px] font-semibold text-[#52607D]">
            The enquiry for <span className="font-semibold text-[#17234A]">{form.fullName}</span> ({form.category || "General"}) has been registered.
          </p>
          <div className="mt-[28px] flex items-center gap-[12px]">
            <button
              type="button"
              onClick={() => {
                setSubmitted(false);
                setForm(DEFAULT_FORM);
                setAttachment(null);
                setSuccess("");
              }}
              className="inline-flex h-[38px] items-center gap-[8px] rounded-[6px] border border-[#DCE3EA] bg-white px-[18px] text-[11px] font-semibold text-[#24345E] hover:bg-slate-50 transition"
            >
              Add Another Enquiry
            </button>

            <button
              type="button"
              onClick={() => router.push("/general-enquiries")}
              className="inline-flex h-[38px] items-center gap-[8px] rounded-[6px] bg-[#005F2E] px-[22px] text-[11px] font-semibold text-white shadow-sm hover:bg-[#004d25] transition"
            >
              Return to General Enquiries
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="
        w-full
        min-w-0
        overflow-hidden
        bg-white
        px-[15px]
        pb-[18px]
        pt-[11px]
      "
    >
      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="min-w-0">
        <h1
          className="
            text-[20px]
            font-semibold
            leading-[25px]
            tracking-[-0.35px]
            text-[#005E2E]
          "
        >
          Add New Enquiry
        </h1>

        {/* BREADCRUMB */}

        <div
          className="
            mt-[6px]
            flex
            items-center
            gap-[6px]
            text-[9px]
            font-semibold
            text-[#46567D]
          "
        >
          <button
            type="button"
            className="
              hover:text-[#087740]
            "
          >
            Dashboard
          </button>

          <ChevronRight
            size={10}
          />

          <button
            type="button"
            onClick={() =>
              router.back()
            }
            className="
              hover:text-[#087740]
            "
          >
            General Enquiries
          </button>

          <ChevronRight
            size={10}
          />

          <span
            className="
              text-[#263970]
            "
          >
            Add New Enquiry
          </span>
        </div>
      </div>

      {/* ======================================================
          ALERT
      ====================================================== */}

      {(error || success) && (
        <div
          className={`
            mt-[10px]
            rounded-[6px]
            border
            px-[12px]
            py-[8px]
            text-[9px]
            font-semibold

            ${error
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-[#CEE8D5] bg-[#F2FAF4] text-[#177541]"
            }
          `}
        >
          {error || success}
        </div>
      )}

      {/* ======================================================
          MAIN GRID
      ====================================================== */}

      <div
        className="
          mt-[14px]
          grid
          w-full
          min-w-0
          grid-cols-[minmax(0,1fr)_275px]
          gap-[16px]
          overflow-hidden
        "
      >
        {/* ====================================================
            LEFT
        ==================================================== */}

        <main
          className="
            w-full
            min-w-0
            space-y-[10px]
          "
        >
          {/* ==================================================
              1. ENQUIRY DETAILS
          ================================================== */}

          <FormSection>
            <SectionHeading
              number={1}
              title="Enquiry Details"
              icon={FileText}
            />

            <div
              className="
                mt-[12px]
                grid
                min-w-0
                grid-cols-3
                gap-x-[18px]
                gap-y-[14px]
              "
            >
              {/* SOURCE */}

              <FormField
                label="Enquiry Source"
                required
              >
                <SelectBox
                  value={form.source}
                  onChange={(value) =>
                    updateField(
                      "source",
                      value
                    )
                  }
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
                </SelectBox>
              </FormField>

              {/* DATE */}

              <FormField
                label="Enquiry Date & Time"
                required
              >
                <div
                  className="
                    relative
                    min-w-0
                  "
                >
                  <CalendarDays
                    size={13}
                    className="
                      pointer-events-none
                      absolute
                      left-[10px]
                      top-1/2
                      z-10
                      -translate-y-1/2
                      text-[#34477A]
                    "
                  />

                  <input
                    type="datetime-local"
                    value={
                      form.enquiryDate
                    }
                    onChange={(event) =>
                      updateField(
                        "enquiryDate",
                        event.target
                          .value
                      )
                    }
                    className={`
                      ${inputClass}
                      pl-[31px]
                    `}
                  />
                </div>
              </FormField>

              {/* RESPONSE TIME */}

              <FormField label="Preferred Response Time">
                <SelectBox
                  value={
                    form.responseTime
                  }
                  onChange={(value) =>
                    updateField(
                      "responseTime",
                      value
                    )
                  }
                >
                  <option value="">
                    Select Time
                  </option>

                  <option value="As soon as possible">
                    As soon as possible
                  </option>

                  <option value="Morning">
                    Morning
                  </option>

                  <option value="Afternoon">
                    Afternoon
                  </option>

                  <option value="Evening">
                    Evening
                  </option>

                  <option value="Any Time">
                    Any Time
                  </option>
                </SelectBox>
              </FormField>

              {/* SUBJECT */}

              <FormField
                label="Subject"
                required
              >
                <input
                  value={
                    form.subject
                  }
                  onChange={(event) =>
                    updateField(
                      "subject",
                      event.target
                        .value
                    )
                  }
                  placeholder="Enter enquiry subject"
                  className={
                    inputClass
                  }
                />
              </FormField>

              {/* CATEGORY */}

              <FormField
                label="Category"
                required
              >
                <SelectBox
                  value={
                    form.category
                  }
                  onChange={(value) =>
                    updateField(
                      "category",
                      value
                    )
                  }
                >
                  <option value="">
                    Select Category
                  </option>

                  {categoryOptions.map(
                    (category) => (
                      <option
                        key={
                          category
                        }
                        value={
                          category
                        }
                      >
                        {
                          category
                        }
                      </option>
                    )
                  )}
                </SelectBox>
              </FormField>

              {/* PRIORITY */}

              <FormField label="Priority">
                <PrioritySelect
                  value={
                    form.priority
                  }
                  onChange={(value) =>
                    updateField(
                      "priority",
                      value
                    )
                  }
                />
              </FormField>
            </div>

            {/* DESCRIPTION */}

            <div className="mt-[13px]">
              <FormField
                label="Enquiry Description"
                required
              >
                <div
                  className="
                    relative
                    min-w-0
                  "
                >
                  <textarea
                    value={
                      form.description
                    }
                    maxLength={1000}
                    onChange={(event) =>
                      updateField(
                        "description",
                        event.target
                          .value
                      )
                    }
                    placeholder="Please provide detailed information about the enquiry..."
                    className="
                      h-[66px]
                      w-full
                      resize-none
                      rounded-[5px]
                      border
                      border-[#DFE4EA]
                      bg-white
                      px-[10px]
                      py-[8px]
                      pr-[52px]
                      text-[9px]
                      font-semibold
                      text-[#26396F]
                      outline-none
                      placeholder:text-[#6B7690]
                      focus:border-[#78B58F]
                    "
                  />

                  <span
                    className="
                      absolute
                      bottom-[8px]
                      right-[9px]
                      text-[9px]
                      font-semibold
                      text-[#6A7690]
                    "
                  >
                    {
                      form.description
                        .length
                    }
                    /1000
                  </span>
                </div>
              </FormField>
            </div>
          </FormSection>

          {/* ==================================================
              2. ENQUIRER INFORMATION
          ================================================== */}

          <FormSection>
            <SectionHeading
              number={2}
              title="Enquirer Information"
              icon={UserRound}
            />

            <div
              className="
                mt-[12px]
                grid
                min-w-0
                grid-cols-3
                gap-x-[18px]
                gap-y-[14px]
              "
            >
              {/* NAME */}

              <FormField
                label="Full Name"
                required
              >
                <input
                  value={
                    form.fullName
                  }
                  onChange={(event) =>
                    updateField(
                      "fullName",
                      event.target
                        .value
                    )
                  }
                  placeholder="Enter full name"
                  className={
                    inputClass
                  }
                />
              </FormField>

              {/* EMAIL */}

              <FormField label="Email Address">
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    updateField(
                      "email",
                      event.target
                        .value
                    )
                  }
                  placeholder="Enter email address"
                  className={
                    inputClass
                  }
                />
              </FormField>

              {/* PHONE */}

              <FormField
                label="Phone Number"
                required
              >
                <PhoneField
                  code={
                    form.countryCode
                  }
                  phone={
                    form.phone
                  }
                  onCodeChange={(
                    value
                  ) =>
                    updateField(
                      "countryCode",
                      value
                    )
                  }
                  onPhoneChange={(
                    value
                  ) =>
                    updateField(
                      "phone",
                      value
                    )
                  }
                />
              </FormField>

              {/* ALT PHONE */}

              <FormField label="Alternate Phone (Optional)">
                <input
                  value={
                    form.alternatePhone
                  }
                  onChange={(event) =>
                    updateField(
                      "alternatePhone",
                      event.target.value.replace(
                        /[^\d+\s]/g,
                        ""
                      )
                    )
                  }
                  placeholder="Enter alternate number"
                  className={
                    inputClass
                  }
                />
              </FormField>

              {/* CITY */}

              <FormField label="Location / City">
                <input
                  value={form.city}
                  onChange={(event) =>
                    updateField(
                      "city",
                      event.target
                        .value
                    )
                  }
                  placeholder="Enter city or area"
                  className={
                    inputClass
                  }
                />
              </FormField>

              {/* STATE */}

              <FormField label="State">
                <SelectBox
                  value={form.state}
                  onChange={(value) =>
                    updateField(
                      "state",
                      value
                    )
                  }
                >
                  <option value="">
                    Select State
                  </option>

                  {stateOptions.map(
                    (state) => (
                      <option
                        key={state}
                        value={state}
                      >
                        {state}
                      </option>
                    )
                  )}
                </SelectBox>
              </FormField>
            </div>

            {/* SECOND ROW */}

            <div
              className="
                mt-[13px]
                grid
                min-w-0
                grid-cols-[0.82fr_1.35fr_1fr]
                gap-[18px]
              "
            >
              {/* RELATION */}

              <FormField label="Relationship (If applicable)">
                <SelectBox
                  value={
                    form.relationship
                  }
                  onChange={(value) =>
                    updateField(
                      "relationship",
                      value
                    )
                  }
                >
                  <option value="">
                    Select Relationship
                  </option>

                  <option value="Self">
                    Self
                  </option>

                  <option value="Family Member">
                    Family Member
                  </option>

                  <option value="Relative">
                    Relative
                  </option>

                  <option value="Friend">
                    Friend
                  </option>

                  <option value="Hospital">
                    Hospital
                  </option>

                  <option value="Police / Authority">
                    Police / Authority
                  </option>

                  <option value="NGO">
                    NGO
                  </option>

                  <option value="Other">
                    Other
                  </option>
                </SelectBox>
              </FormField>

              {/* CONTACT METHOD */}

              <FormField label="Preferred Contact Method">
                <ContactMethodSelector
                  value={
                    form.preferredContactMethod
                  }
                  onChange={(value) =>
                    updateField(
                      "preferredContactMethod",
                      value
                    )
                  }
                />
              </FormField>

              {/* LANGUAGE */}

              <FormField label="Communication Language">
                <SelectBox
                  value={
                    form.communicationLanguage
                  }
                  onChange={(value) =>
                    updateField(
                      "communicationLanguage",
                      value
                    )
                  }
                >
                  <option value="">
                    Select Language
                  </option>

                  {languageOptions.map(
                    (language) => (
                      <option
                        key={
                          language
                        }
                        value={
                          language
                        }
                      >
                        {
                          language
                        }
                      </option>
                    )
                  )}
                </SelectBox>
              </FormField>
            </div>
          </FormSection>

          {/* ==================================================
              3. ADDITIONAL INFORMATION
          ================================================== */}

          <FormSection>
            <SectionHeading
              number={3}
              title="Additional Information"
              icon={FileText}
            />

            <div
              className="
                mt-[12px]
                grid
                min-w-0
                grid-cols-3
                gap-[18px]
              "
            >
              {/* RELATED */}

              <FormField label="Related to Our Services?">
                <RadioGroup
                  value={
                    form.relatedToServices
                  }
                  options={[
                    "Yes",
                    "No",
                    "Not Sure",
                  ]}
                  onChange={(value) =>
                    updateField(
                      "relatedToServices",
                      value
                    )
                  }
                />
              </FormField>

              {/* SERVICE */}

              <FormField label="Interested Service (If any)">
                <SelectBox
                  value={
                    form.interestedService
                  }
                  onChange={(value) =>
                    updateField(
                      "interestedService",
                      value
                    )
                  }
                >
                  <option value="">
                    Select Service
                  </option>

                  {serviceOptions.map(
                    (service) => (
                      <option
                        key={
                          service
                        }
                        value={
                          service
                        }
                      >
                        {service}
                      </option>
                    )
                  )}
                </SelectBox>
              </FormField>

              {/* PREVIOUS CONTACT */}

              <FormField label="Have you contacted us before?">
                <RadioGroup
                  value={
                    form.contactedBefore
                  }
                  options={[
                    "Yes",
                    "No",
                  ]}
                  onChange={(value) =>
                    updateField(
                      "contactedBefore",
                      value
                    )
                  }
                />
              </FormField>
            </div>

            <div
              className="
                mt-[13px]
                grid
                min-w-0
                grid-cols-[0.95fr_1.85fr]
                gap-[18px]
              "
            >
              {/* HEARD ABOUT */}

              <FormField label="How did you hear about Moksha Sewa?">
                <SelectBox
                  value={
                    form.heardAbout
                  }
                  onChange={(value) =>
                    updateField(
                      "heardAbout",
                      value
                    )
                  }
                >
                  <option value="">
                    Select Option
                  </option>

                  <option value="Website">
                    Website
                  </option>

                  <option value="Google">
                    Google
                  </option>

                  <option value="Social Media">
                    Social Media
                  </option>

                  <option value="Friend / Family">
                    Friend / Family
                  </option>

                  <option value="Hospital">
                    Hospital
                  </option>

                  <option value="Police / Authority">
                    Police / Authority
                  </option>

                  <option value="NGO">
                    NGO
                  </option>

                  <option value="Event">
                    Event
                  </option>

                  <option value="Other">
                    Other
                  </option>
                </SelectBox>
              </FormField>

              {/* ATTACHMENT */}

              <FormField label="Any Attachment (Optional)">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={
                    handleFileChange
                  }
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                  className="
                    flex
                    h-[62px]
                    w-full
                    min-w-0
                    items-center
                    justify-center
                    gap-[12px]
                    rounded-[6px]
                    border
                    border-dashed
                    border-[#CBD4DD]
                    bg-white
                    px-[12px]
                  "
                >
                  <UploadCloud
                    size={22}
                    strokeWidth={1.8}
                    className="
                      shrink-0
                      text-[#247648]
                    "
                  />

                  <div
                    className="
                      min-w-0
                      text-left
                    "
                  >
                    <p
                      className="
                        truncate
                        text-[9px]
                        font-semibold
                        text-[#33416D]
                      "
                    >
                      {attachment
                        ? attachment.name
                        : "Drag & drop files here or click to upload"}
                    </p>

                    <p
                      className="
                        mt-[3px]
                        text-[9px]
                        font-semibold
                        text-[#728099]
                      "
                    >
                      Supported formats:
                      JPG, PNG, PDF
                      (Max 10MB)
                    </p>
                  </div>
                </button>
              </FormField>
            </div>
          </FormSection>
        </main>

        {/* ====================================================
            RIGHT SIDE
        ==================================================== */}

        <aside
          className="
            w-[275px]
            min-w-0
            shrink-0
          "
        >
          {/* ==================================================
              QUICK INFO
          ================================================== */}

          <SidebarCard>
            <div
              className="
                flex
                items-center
                gap-[8px]
              "
            >
              <Info
                size={18}
                className="
                  text-[#3E75C4]
                "
              />

              <h2
                className="
                  text-[10px]
                  font-semibold
                  text-[#175E39]
                "
              >
                Quick Info
              </h2>
            </div>

            <p
              className="
                mt-[11px]
                text-[9px]
                font-semibold
                text-[#4C5978]
              "
            >
              Fill in the details to
              create a new enquiry.
            </p>

            <div
              className="
                mt-[15px]
                space-y-[13px]
              "
            >
              <InfoPoint>
                Provide accurate contact
                information.
              </InfoPoint>

              <InfoPoint>
                Select appropriate category
                and priority.
              </InfoPoint>

              <InfoPoint>
                We will respond as soon as
                possible.
              </InfoPoint>
            </div>

            {/* decorative leaf */}

            <div
              className="
                mt-[2px]
                flex
                justify-end
              "
            >
              <svg
                viewBox="0 0 60 70"
                className="
                  h-[47px]
                  w-[40px]
                  opacity-[0.15]
                "
              >
                <path
                  d="M30 68C30 45 33 24 51 5"
                  fill="none"
                  stroke="#15804A"
                  strokeWidth="2"
                />

                <path
                  d="M35 43C45 37 50 29 51 20C41 23 35 31 35 43Z"
                  fill="none"
                  stroke="#15804A"
                  strokeWidth="2"
                />

                <path
                  d="M29 51C19 45 14 36 14 26C24 30 30 38 29 51Z"
                  fill="none"
                  stroke="#15804A"
                  strokeWidth="2"
                />

                <path
                  d="M40 28C48 22 52 15 52 8C44 11 40 18 40 28Z"
                  fill="none"
                  stroke="#15804A"
                  strokeWidth="2"
                />
              </svg>
            </div>
          </SidebarCard>

          {/* ==================================================
              POPULAR CATEGORIES
          ================================================== */}

          <SidebarCard className="mt-[13px]">
            <h2
              className="
                text-[10px]
                font-semibold
                text-[#175E39]
              "
            >
              Popular Categories
            </h2>

            <div
              className="
                mt-[12px]
                divide-y
                divide-[#EDF0F3]
              "
            >
              {popularCategories.map(
                (item) => {
                  const Icon =
                    item.icon;

                  return (
                    <button
                      key={
                        item.title
                      }
                      type="button"
                      onClick={() =>
                        updateField(
                          "category",
                          item.title
                        )
                      }
                      className="
                        flex
                        w-full
                        min-w-0
                        items-center
                        gap-[9px]
                        py-[8px]
                        text-left
                        first:pt-0
                        last:pb-0
                      "
                    >
                      <div
                        className="
                          flex
                          h-[28px]
                          w-[28px]
                          shrink-0
                          items-center
                          justify-center
                          rounded-full
                        "
                        style={{
                          backgroundColor:
                            item.bg,
                        }}
                      >
                        <Icon
                          size={13}
                          strokeWidth={2}
                          style={{
                            color:
                              item.color,
                          }}
                        />
                      </div>

                      <div className="min-w-0">
                        <p
                          className="
                            truncate
                            text-[9px]
                            font-semibold
                            text-[#273970]
                          "
                        >
                          {item.title}
                        </p>

                        <p
                          className="
                            mt-[2px]
                            truncate
                            text-[9px]
                            font-semibold
                            text-[#68758F]
                          "
                        >
                          {
                            item.description
                          }
                        </p>
                      </div>
                    </button>
                  );
                }
              )}
            </div>
          </SidebarCard>

          {/* ==================================================
              NEED IMMEDIATE HELP
          ================================================== */}

          <div
            className="
              mt-[13px]
              rounded-[7px]
              border
              border-[#DDE7F3]
              bg-[#F4F8FF]
              px-[16px]
              pb-[16px]
              pt-[15px]
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
                size={30}
                strokeWidth={1.7}
                className="
                  shrink-0
                  text-[#2F6DD1]
                "
              />

              <div className="min-w-0">
                <h2
                  className="
                    text-[10px]
                    font-semibold
                    text-[#243A78]
                  "
                >
                  Need Immediate Help?
                </h2>

                <p
                  className="
                    mt-[7px]
                    text-[9px]
                    font-semibold
                    leading-[10px]
                    text-[#46567D]
                  "
                >
                  For urgent support,
                  please contact our 24x7
                  helpline.
                </p>

                <a
                  href="tel:+919876543210"
                  className="
                    mt-[12px]
                    flex
                    h-[34px]
                    w-fit
                    items-center
                    gap-[8px]
                    rounded-[5px]
                    border
                    border-[#9DB7AB]
                    bg-white
                    px-[12px]
                    text-[9px]
                    font-semibold
                    text-[#216C3D]
                  "
                >
                  <Phone
                    size={13}
                  />

                  +91 98765 43210
                </a>

                <p
                  className="
                    mt-[12px]
                    text-[9px]
                    font-semibold
                    text-[#61708B]
                  "
                >
                  We are here to help
                  with compassion.
                </p>
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
          mt-[14px]
          flex
          min-w-0
          items-center
          justify-between
          gap-[15px]
        "
      >
        <button
          type="button"
          onClick={() =>
            router.back()
          }
          className="
            flex
            h-[36px]
            items-center
            gap-[7px]
            rounded-[5px]
            border
            border-[#DDE3E9]
            bg-white
            px-[17px]
            text-[9px]
            font-semibold
            text-[#20336C]
          "
        >
          <X size={13} />

          Cancel
        </button>

        <div
          className="
            flex
            items-center
            gap-[12px]
          "
        >
          <button
            type="button"
            onClick={saveDraft}
            className="
              flex
              h-[36px]
              items-center
              gap-[8px]
              rounded-[5px]
              border
              border-[#DDE3E9]
              bg-white
              px-[18px]
              text-[9px]
              font-semibold
              text-[#20336C]
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
              h-[36px]
              min-w-[145px]
              items-center
              justify-center
              gap-[8px]
              rounded-[5px]
              bg-[#005F2E]
              px-[20px]
              text-[9px]
              font-semibold
              text-white
              shadow-[0_2px_5px_rgba(0,95,46,0.15)]
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            <Send size={14} />

            {saving
              ? "Submitting..."
              : "Submit Enquiry"}
          </button>
        </div>
      </div>
    </form>
  );
}

export default function AddNewEnquiryPage() {
  return (
    <Suspense fallback={<div className="p-4 text-[9px] font-semibold text-[#182A65]">Loading form...</div>}>
      <AddNewEnquiryContent />
    </Suspense>
  );
}

/* ============================================================
   FORM SECTION
============================================================ */

function FormSection({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <section
      className="
        w-full
        min-w-0
        overflow-hidden
        rounded-[7px]
        border
        border-[#E2E7EB]
        bg-white
        px-[14px]
        pb-[13px]
        pt-[11px]
      "
    >
      {children}
    </section>
  );
}

/* ============================================================
   SECTION HEADING
============================================================ */

function SectionHeading({
  number,
  title,
  icon: Icon,
}: {
  number: number;
  title: string;

  icon: React.ComponentType<{
    size?: number;
    strokeWidth?: number;
  }>;
}) {
  return (
    <div
      className="
        flex
        items-center
        gap-[9px]
      "
    >
      <div
        className="
          flex
          h-[27px]
          w-[27px]
          shrink-0
          items-center
          justify-center
          rounded-full
          bg-[#E7F5E9]
          text-[#217943]
        "
      >
        <Icon
          size={14}
          strokeWidth={2}
        />
      </div>

      <h2
        className="
          text-[10.5px]
          font-semibold
          text-[#17603A]
        "
      >
        {number}. {title}
      </h2>
    </div>
  );
}

/* ============================================================
   FORM FIELD
============================================================ */

function FormField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className="
        w-full
        min-w-0
      "
    >
      <p
        className="
          mb-[6px]
          text-[9px]
          font-semibold
          text-[#192A65]
        "
      >
        {label}

        {required && (
          <span
            className="
              ml-[3px]
              text-[#E14242]
            "
          >
            *
          </span>
        )}
      </p>

      {children}
    </div>
  );
}

/* ============================================================
   INPUT CLASS
============================================================ */

const inputClass = `
  h-[34px]
  w-full
  min-w-0
  rounded-[5px]
  border
  border-[#DFE4EA]
  bg-white
  px-[10px]
  text-[9px]
  font-semibold
  text-[#253970]
  outline-none
  placeholder:text-[#6B7690]
  focus:border-[#78B58F]
`;

/* ============================================================
   SELECT
============================================================ */

function SelectBox({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (
    value: string
  ) => void;
  children: ReactNode;
}) {
  return (
    <div
      className="
        relative
        w-full
        min-w-0
        overflow-hidden
      "
    >
      <select
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        className="
          h-[34px]
          w-full
          min-w-0
          appearance-none
          overflow-hidden
          text-ellipsis
          whitespace-nowrap
          rounded-[5px]
          border
          border-[#DFE4EA]
          bg-white
          px-[10px]
          pr-[28px]
          text-[9px]
          font-semibold
          text-[#182A65]
          outline-none
          focus:border-[#78B58F]
        "
      >
        {children}
      </select>

      <ChevronDown
        size={11}
        className="
          pointer-events-none
          absolute
          right-[9px]
          top-1/2
          -translate-y-1/2
          text-[#182A65]
        "
      />
    </div>
  );
}

/* ============================================================
   PRIORITY
============================================================ */

function PrioritySelect({
  value,
  onChange,
}: {
  value: Priority;
  onChange: (
    value: Priority
  ) => void;
}) {
  const meta: Record<
    Priority,
    {
      color: string;
    }
  > = {
    Low: {
      color: "#28A260",
    },

    Medium: {
      color: "#F3B51D",
    },

    High: {
      color: "#F08A21",
    },

    Urgent: {
      color: "#E54242",
    },
  };

  return (
    <div
      className="
        relative
        min-w-0
      "
    >
      <span
        className="
          pointer-events-none
          absolute
          left-[11px]
          top-1/2
          z-10
          h-[8px]
          w-[8px]
          -translate-y-1/2
          rounded-full
        "
        style={{
          backgroundColor:
            meta[value].color,
        }}
      />

      <select
        value={value}
        onChange={(event) =>
          onChange(
            event.target
              .value as Priority
          )
        }
        className="
          h-[34px]
          w-full
          appearance-none
          rounded-[5px]
          border
          border-[#DFE4EA]
          bg-white
          pl-[28px]
          pr-[28px]
          text-[9px]
          font-semibold
          text-[#182A65]
          outline-none
        "
      >
        <option value="Low">
          Low
        </option>

        <option value="Medium">
          Medium
        </option>

        <option value="High">
          High
        </option>

        <option value="Urgent">
          Urgent
        </option>
      </select>

      <ChevronDown
        size={11}
        className="
          pointer-events-none
          absolute
          right-[9px]
          top-1/2
          -translate-y-1/2
          text-[#182A65]
        "
      />
    </div>
  );
}

/* ============================================================
   PHONE
============================================================ */

function PhoneField({
  code,
  phone,
  onCodeChange,
  onPhoneChange,
}: {
  code: string;
  phone: string;

  onCodeChange: (
    value: string
  ) => void;

  onPhoneChange: (
    value: string
  ) => void;
}) {
  return (
    <div
      className="
        grid
        min-w-0
        grid-cols-[57px_minmax(0,1fr)]
        gap-[7px]
      "
    >
      <div
        className="
          relative
          min-w-0
        "
      >
        <select
          value={code}
          onChange={(event) =>
            onCodeChange(
              event.target.value
            )
          }
          className="
            h-[34px]
            w-full
            appearance-none
            rounded-[5px]
            border
            border-[#DFE4EA]
            bg-white
            px-[8px]
            pr-[20px]
            text-[9px]
            font-semibold
            text-[#182A65]
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
          size={8}
          className="
            pointer-events-none
            absolute
            right-[6px]
            top-1/2
            -translate-y-1/2
          "
        />
      </div>

      <input
        value={phone}
        onChange={(event) =>
          onPhoneChange(
            event.target.value.replace(
              /\D/g,
              ""
            )
          )
        }
        placeholder="Enter phone number"
        className={inputClass}
      />
    </div>
  );
}

/* ============================================================
   CONTACT METHOD
============================================================ */

function ContactMethodSelector({
  value,
  onChange,
}: {
  value: ContactMethod;

  onChange: (
    value: ContactMethod
  ) => void;
}) {
  const items: {
    label: ContactMethod;
    icon:
    React.ComponentType<{
      size?: number;
    }>;
  }[] = [
      {
        label: "Phone",
        icon: Phone,
      },

      {
        label: "Email",
        icon: Mail,
      },

      {
        label: "WhatsApp",
        icon:
          MessageCircleMore,
      },

      {
        label: "Any",
        icon:
          CircleUserRound,
      },
    ];

  return (
    <div
      className="
        grid
        min-w-0
        grid-cols-4
        overflow-hidden
        rounded-[5px]
        border
        border-[#DFE4EA]
      "
    >
      {items.map(
        (item, index) => {
          const Icon =
            item.icon;

          const selected =
            value ===
            item.label;

          return (
            <button
              key={item.label}
              type="button"
              onClick={() =>
                onChange(
                  item.label
                )
              }
              className={`
                flex
                h-[34px]
                min-w-0
                items-center
                justify-center
                gap-[5px]
                border-r
                border-[#DFE4EA]
                text-[9px]
                font-semibold
                last:border-r-0

                ${selected
                  ? "bg-[#F3FAF5] text-[#207447] ring-1 ring-inset ring-[#5EAE7B]"
                  : "bg-white text-[#354573]"
                }
              `}
            >
              <Icon
                size={12}
              />

              <span className="truncate">
                {item.label}
              </span>
            </button>
          );
        }
      )}
    </div>
  );
}

/* ============================================================
   RADIO GROUP
============================================================ */

function RadioGroup({
  value,
  options,
  onChange,
}: {
  value: string;
  options: string[];

  onChange: (
    value: string
  ) => void;
}) {
  return (
    <div
      className="
        flex
        h-[34px]
        items-center
        gap-[18px]
      "
    >
      {options.map(
        (option) => (
          <label
            key={option}
            className="
              flex
              cursor-pointer
              items-center
              gap-[6px]
              whitespace-nowrap
              text-[9px]
              font-semibold
              text-[#354573]
            "
          >
            <input
              type="radio"
              checked={
                value ===
                option
              }
              onChange={() =>
                onChange(option)
              }
              className="
                h-[12px]
                w-[12px]
                accent-[#147845]
              "
            />

            {option}
          </label>
        )
      )}
    </div>
  );
}

/* ============================================================
   SIDEBAR CARD
============================================================ */

function SidebarCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`
        min-w-0
        rounded-[7px]
        border
        border-[#E2E7EB]
        bg-white
        px-[16px]
        py-[14px]
        ${className}
      `}
    >
      {children}
    </section>
  );
}

/* ============================================================
   INFO POINT
============================================================ */

function InfoPoint({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div
      className="
        flex
        items-start
        gap-[8px]
      "
    >
      <span
        className="
          mt-[1px]
          flex
          h-[12px]
          w-[12px]
          shrink-0
          items-center
          justify-center
          rounded-full
          border
          border-[#55AA77]
          text-[#2E8952]
        "
      >
        <Check
          size={7}
          strokeWidth={3}
        />
      </span>

        <p
          className="
            text-[9px]
            font-semibold
            leading-[11px]
            text-[#46557A]
          "
        >
          {children}
        </p>
    </div>
  );
}
