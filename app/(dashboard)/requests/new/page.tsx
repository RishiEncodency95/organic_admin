"use client";

import {
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type FormEvent,
  type ReactNode,
} from "react";

import { useRouter } from "next/navigation";

import {
  BriefcaseMedical,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  Flame,
  HandHeart,
  MapPin,
  MoreHorizontal,
  Phone,
  Save,
  Send,
  ShieldCheck,
  UploadCloud,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";

/* ============================================================
   TYPES
============================================================ */

type Priority =
  | ""
  | "LOW"
  | "NORMAL"
  | "HIGH"
  | "CRITICAL";

type RequestStatus =
  | "SUBMITTED"
  | "CONVERTED"
  | "REJECTED";

type AssistanceType =
  | "Final Journey & Transport"
  | "Cremation & Last Rites"
  | "Ritual & Priest Support"
  | "Family & On-Ground Support"
  | "Other";

type FormState = {
  requestDate: string;

  priority: Priority;
  status: RequestStatus;

  source: string;
  referredBy: string;
  heardAbout: string;

  requesterName: string;
  relationship: string;

  phone: string;
  alternatePhone: string;
  email: string;

  address: string;
  city: string;
  state: string;
  pincode: string;

  deceasedName: string;
  deceasedGender: string;
  deceasedAge: string;

  incidentDate: string;
  incidentTime: string;
  incidentPlace: string;

  isUnclaimed: string;
  authority: string;
  referenceNo: string;

  assistanceTypes: AssistanceType[];

  additionalNotes: string;

  assignTo: string;
  followUpDate: string;
  followUpTime: string;

  teamNote: string;
};

/* ============================================================
   DATE HELPER
============================================================ */

function todayValue() {
  const now = new Date();

  const offset =
    now.getTimezoneOffset() *
    60000;

  return new Date(
    now.getTime() - offset
  )
    .toISOString()
    .slice(0, 10);
}

/* ============================================================
   DEFAULT
============================================================ */

const DEFAULT_FORM: FormState = {
  requestDate: todayValue(),

  priority: "",
  status: "SUBMITTED",

  source: "",
  referredBy: "",
  heardAbout: "",

  requesterName: "",
  relationship: "",

  phone: "",
  alternatePhone: "",
  email: "",

  address: "",
  city: "",
  state: "",
  pincode: "",

  deceasedName: "",
  deceasedGender: "",
  deceasedAge: "",

  incidentDate: "",
  incidentTime: "",
  incidentPlace: "",

  isUnclaimed: "",
  authority: "",
  referenceNo: "",

  assistanceTypes: [],

  additionalNotes: "",

  assignTo: "",
  followUpDate: "",
  followUpTime: "",

  teamNote: "",
};

/* ============================================================
   OPTIONS
============================================================ */

const SOURCES = [
  "Website",
  "Phone Call",
  "WhatsApp",
  "Walk-in",
  "Hospital",
  "Police / Authority",
  "NGO / Shelter",
  "Social Media",
  "Referral",
  "Other",
];

const RELATIONSHIPS = [
  "Self",
  "Family Member",
  "Relative",
  "Friend",
  "Hospital",
  "Police / Authority",
  "NGO Representative",
  "Other",
];

const CITIES = [
  "Delhi",
  "New Delhi",
  "Noida",
  "Greater Noida",
  "Ghaziabad",
  "Gurugram",
  "Faridabad",
  "Other",
];

const STATES = [
  "Delhi",
  "Uttar Pradesh",
  "Haryana",
  "Rajasthan",
  "Punjab",
  "Uttarakhand",
  "Other",
];

const AUTHORITIES = [
  "Police",
  "Hospital",
  "Municipal Authority",
  "District Administration",
  "NGO / Shelter",
  "Other",
];

const TEAM_MEMBERS = [
  "Admin User",
  "Operations Team",
  "Field Coordinator",
  "Volunteer Coordinator",
  "Case Manager",
];

const HEARD_ABOUT = [
  "Google Search",
  "Website",
  "Social Media",
  "Friend / Family",
  "Hospital",
  "Police / Authority",
  "NGO",
  "Previous Support",
  "Other",
];

/* ============================================================
   SERVICE CARDS
============================================================ */

const SERVICES: {
  key: AssistanceType;
  label: string;
  icon: React.ComponentType<{
    size?: number;
    strokeWidth?: number;
    style?: CSSProperties;
    className?: string;
  }>;
  bg: string;
  color: string;
}[] = [
    {
      key: "Final Journey & Transport",
      label: "Final Journey & Transport",
      icon: BriefcaseMedical,
      bg: "#E4F2FA",
      color: "#287C9C",
    },

    {
      key: "Cremation & Last Rites",
      label: "Cremation & Last Rites",
      icon: Flame,
      bg: "#FFF0DF",
      color: "#F08418",
    },

    {
      key: "Ritual & Priest Support",
      label: "Ritual & Priest Support",
      icon: UserRound,
      bg: "#FFF2E5",
      color: "#A55B22",
    },

    {
      key: "Family & On-Ground Support",
      label: "Family & On-Ground Support",
      icon: UsersRound,
      bg: "#E6F5EA",
      color: "#237F48",
    },

    {
      key: "Other",
      label: "Other (Please Specify)",
      icon: MoreHorizontal,
      bg: "#EDF8F2",
      color: "#279465",
    },
  ];

/* ============================================================
   PAGE
============================================================ */

export default function AddNewRequestPage() {
  const router = useRouter();

  const fileRef =
    useRef<HTMLInputElement>(null);

  const [form, setForm] =
    useState<FormState>(
      DEFAULT_FORM
    );

  const [
    attachments,
    setAttachments,
  ] = useState<File[]>([]);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [submitted, setSubmitted] =
    useState(false);

  /* ==========================================================
     UPDATE
  ========================================================== */

  function update<
    K extends keyof FormState
  >(
    key: K,
    value: FormState[K]
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));

    setError("");
    setSuccess("");
  }

  /* ==========================================================
     ASSISTANCE
  ========================================================== */

  function toggleAssistance(
    value: AssistanceType
  ) {
    setForm((current) => {
      const exists =
        current.assistanceTypes.includes(
          value
        );

      return {
        ...current,

        assistanceTypes:
          exists
            ? current.assistanceTypes.filter(
              (item) =>
                item !== value
            )
            : [
              ...current.assistanceTypes,
              value,
            ],
      };
    });
  }

  /* ==========================================================
     FILES
  ========================================================== */

  function handleFiles(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const selected =
      Array.from(
        event.target.files ?? []
      );

    if (!selected.length) {
      return;
    }

    const invalid =
      selected.find(
        (file) =>
          ![
            "image/jpeg",
            "image/png",
            "application/pdf",
          ].includes(file.type)
      );

    if (invalid) {
      setError(
        "Only JPG, PNG and PDF files are supported."
      );
      return;
    }

    const tooLarge =
      selected.find(
        (file) =>
          file.size >
          10 * 1024 * 1024
      );

    if (tooLarge) {
      setError(
        "Each attachment must be under 10MB."
      );
      return;
    }

    setAttachments(
      selected
    );

    setError("");
  }

  /* ==========================================================
     VALIDATION
  ========================================================== */

  function validate() {
    if (!form.requestDate) {
      return "Request date is required.";
    }

    if (!form.priority) {
      return "Priority is required.";
    }

    if (!form.source) {
      return "Request source is required.";
    }

    if (
      !form.requesterName.trim()
    ) {
      return "Requester full name is required.";
    }

    if (!form.phone.trim()) {
      return "Phone number is required.";
    }

    if (!form.address.trim()) {
      return "Address is required.";
    }

    if (!form.city) {
      return "City is required.";
    }

    if (!form.state) {
      return "State is required.";
    }

    if (!form.pincode.trim()) {
      return "Pincode is required.";
    }

    if (
      !form.deceasedName.trim()
    ) {
      return "Deceased / person name is required.";
    }

    if (
      !form.deceasedGender
    ) {
      return "Gender is required.";
    }

    if (
      !form.deceasedAge.trim()
    ) {
      return "Approximate age is required.";
    }

    if (!form.incidentDate) {
      return "Date of passing / incident is required.";
    }

    if (
      !form.incidentPlace.trim()
    ) {
      return "Place of passing / incident is required.";
    }

    if (!form.isUnclaimed) {
      return "Please specify whether the body is unclaimed.";
    }

    if (
      !form.assistanceTypes.length
    ) {
      return "Please select at least one type of assistance.";
    }

    if (!form.assignTo) {
      return "Please assign the request to a team member.";
    }

    if (!form.followUpDate) {
      return "Follow-up date is required.";
    }

    return "";
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
      /*
       * Yahan apna actual requestsApi.create(...)
       * call lagana hai.
       *
       * UI/state ready hai.
       */

      console.log({
        ...form,
        attachments,
      });

      setSuccess(
        "Request created successfully."
      );
      setSubmitted(true);
    } catch {
      setError(
        "Could not create request."
      );
    } finally {
      setSaving(false);
    }
  }

  /* ==========================================================
     SAVE DRAFT
  ========================================================== */

  function saveDraft() {
    try {
      localStorage.setItem(
        "moksha-add-request-draft",
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

  if (submitted) {
    return (
      <div className="mx-auto max-w-[800px] p-[30px]">
        <div className="flex flex-col items-center justify-center rounded-[12px] border border-[#DCE3EA] bg-white p-[48px] text-center shadow-sm">
          <div className="flex h-[64px] w-[64px] items-center justify-center rounded-full bg-[#EBF7F0] text-[#005F2E]">
            <Check size={36} strokeWidth={3} />
          </div>
          <h2 className="mt-[20px] text-[22px] font-semibold text-[#17234A]">
            Sewa Help Request Submitted Successfully!
          </h2>
          <p className="mt-[8px] max-w-[450px] text-[12px] font-semibold text-[#52607D]">
            The help request for <span className="font-semibold text-[#17234A]">{form.requesterName || "Requester"}</span> has been recorded in the intake queue.
          </p>
          <div className="mt-[28px] flex items-center gap-[12px]">
            <button
              type="button"
              onClick={() => {
                setSubmitted(false);
                setForm(DEFAULT_FORM);
                setAttachments([]);
                setSuccess("");
              }}
              className="inline-flex h-[38px] items-center gap-[8px] rounded-[6px] border border-[#DCE3EA] bg-white px-[18px] text-[11px] font-semibold text-[#24345E] hover:bg-slate-50 transition"
            >
              Add Another Request
            </button>

            <button
              type="button"
              onClick={() => router.push("/requests")}
              className="inline-flex h-[38px] items-center gap-[8px] rounded-[6px] bg-[#005F2E] px-[22px] text-[11px] font-semibold text-white shadow-sm hover:bg-[#004d25] transition"
            >
              Return to Help Requests Queue
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
        pb-[17px]
        pt-[10px]
      "
    >
      {/* ======================================================
          HEADER
      ====================================================== */}

      <div>
        <h1
          className="
            text-[20px]
            font-semibold
            leading-[25px]
            tracking-[-0.3px]
            text-[#005E2E]
          "
        >
          Add New Request
        </h1>

        <div
          className="
            mt-[7px]
            flex
            items-center
            gap-[7px]
            text-[9px]
            font-semibold
            text-[#314474]
          "
        >
          <span>
            Dashboard
          </span>

          <ChevronRight
            size={9}
          />

          <span>
            Engagement &amp;
            Leads
          </span>

          <ChevronRight
            size={9}
          />

          <span>
            Sewa Help Requests
          </span>

          <ChevronRight
            size={9}
          />

          <span>
            Add New Request
          </span>
        </div>
      </div>

      {/* ALERT */}

      {(error || success) && (
        <div
          className={`
            mt-[10px]
            rounded-[6px]
            border
            px-[11px]
            py-[8px]
            text-[9px]
            font-semibold

            ${error
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-[#CCE8D4] bg-[#F2FAF4] text-[#187442]"
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
          mt-[13px]
          grid
          w-full
          min-w-0
          grid-cols-[minmax(0,1fr)_295px]
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
            space-y-[9px]
          "
        >
          {/* ==================================================
              1 BASIC
          ================================================== */}

          <FormSection>
            <SectionTitle
              number={1}
              title="Request Basic Information"
            />

            <div
              className="
                mt-[12px]
                grid
                min-w-0
                grid-cols-4
                gap-x-[15px]
                gap-y-[13px]
              "
            >
              <FormField label="Request ID (Auto)">
                <input
                  disabled
                  value="Auto-generated"
                  className="
                    h-[34px]
                    w-full
                    rounded-[5px]
                    border
                    border-[#EBEEF1]
                    bg-[#F4F5F6]
                    px-[10px]
                    text-[9px]
                    font-semibold
                    text-[#9BA3B0]
                    outline-none
                  "
                />
              </FormField>

              <FormField
                label="Request Date"
                required
              >
                <DateInput
                  value={
                    form.requestDate
                  }
                  onChange={(value) =>
                    update(
                      "requestDate",
                      value
                    )
                  }
                />
              </FormField>

              <FormField
                label="Priority"
                required
              >
                <SelectBox
                  value={
                    form.priority
                  }
                  onChange={(value) =>
                    update(
                      "priority",
                      value as Priority
                    )
                  }
                >
                  <option value="">
                    Select Priority
                  </option>

                  <option value="LOW">
                    Low
                  </option>

                  <option value="NORMAL">
                    Normal
                  </option>

                  <option value="HIGH">
                    High
                  </option>

                  <option value="CRITICAL">
                    Critical
                  </option>
                </SelectBox>
              </FormField>

              <FormField
                label="Status"
                required
              >
                <SelectBox
                  value={form.status}
                  onChange={(value) =>
                    update(
                      "status",
                      value as RequestStatus
                    )
                  }
                >
                  <option value="SUBMITTED">
                    New
                  </option>

                  <option value="CONVERTED">
                    Converted
                  </option>

                  <option value="REJECTED">
                    Rejected
                  </option>
                </SelectBox>
              </FormField>
            </div>

            <div
              className="
                mt-[13px]
                grid
                min-w-0
                grid-cols-3
                gap-[15px]
              "
            >
              <FormField
                label="Request Source"
                required
              >
                <SelectBox
                  value={form.source}
                  onChange={(value) =>
                    update(
                      "source",
                      value
                    )
                  }
                >
                  <option value="">
                    Select Source
                  </option>

                  {SOURCES.map(
                    (item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    )
                  )}
                </SelectBox>
              </FormField>

              <FormField label="Referred By (Optional)">
                <input
                  value={
                    form.referredBy
                  }
                  onChange={(event) =>
                    update(
                      "referredBy",
                      event.target.value
                    )
                  }
                  placeholder="Enter name / organization / phone"
                  className={inputClass}
                />
              </FormField>

              <FormField label="How did you hear about us?">
                <SelectBox
                  value={
                    form.heardAbout
                  }
                  onChange={(value) =>
                    update(
                      "heardAbout",
                      value
                    )
                  }
                >
                  <option value="">
                    Select Option
                  </option>

                  {HEARD_ABOUT.map(
                    (item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    )
                  )}
                </SelectBox>
              </FormField>
            </div>
          </FormSection>

          {/* ==================================================
              2 REQUESTER
          ================================================== */}

          <FormSection>
            <SectionTitle
              number={2}
              title="Requester / Family Details"
            />

            <div
              className="
                mt-[12px]
                grid
                min-w-0
                grid-cols-3
                gap-x-[15px]
                gap-y-[12px]
              "
            >
              <FormField
                label="Full Name"
                required
              >
                <input
                  value={
                    form.requesterName
                  }
                  onChange={(event) =>
                    update(
                      "requesterName",
                      event.target.value
                    )
                  }
                  placeholder="Enter full name"
                  className={inputClass}
                />
              </FormField>

              <FormField label="Relationship with Deceased / Person">
                <SelectBox
                  value={
                    form.relationship
                  }
                  onChange={(value) =>
                    update(
                      "relationship",
                      value
                    )
                  }
                >
                  <option value="">
                    Select Relationship
                  </option>

                  {RELATIONSHIPS.map(
                    (item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    )
                  )}
                </SelectBox>
              </FormField>

              <FormField
                label="Phone Number"
                required
              >
                <div className="relative">
                  <Phone
                    size={11}
                    className="
                      pointer-events-none
                      absolute
                      left-[10px]
                      top-1/2
                      -translate-y-1/2
                      text-[#536183]
                    "
                  />

                  <input
                    value={form.phone}
                    onChange={(event) =>
                      update(
                        "phone",
                        event.target.value.replace(
                          /[^\d+\s]/g,
                          ""
                        )
                      )
                    }
                    placeholder="Enter phone number"
                    className={`${inputClass} pl-[29px]`}
                  />
                </div>
              </FormField>

              <FormField label="Alternate Phone (Optional)">
                <input
                  value={
                    form.alternatePhone
                  }
                  onChange={(event) =>
                    update(
                      "alternatePhone",
                      event.target.value.replace(
                        /[^\d+\s]/g,
                        ""
                      )
                    )
                  }
                  placeholder="Enter alternate phone"
                  className={inputClass}
                />
              </FormField>

              <FormField label="Email Address (Optional)">
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    update(
                      "email",
                      event.target.value
                    )
                  }
                  placeholder="Enter email address"
                  className={inputClass}
                />
              </FormField>

              <FormField
                label="Address"
                required
              >
                <textarea
                  value={form.address}
                  onChange={(event) =>
                    update(
                      "address",
                      event.target.value
                    )
                  }
                  placeholder="Enter complete address"
                  className="
                    h-[38px]
                    w-full
                    resize-none
                    rounded-[5px]
                    border
                    border-[#DFE4EA]
                    bg-white
                    px-[10px]
                    py-[8px]
                    text-[9px]
                    font-semibold
                    text-[#26396F]
                    outline-none
                    placeholder:text-[#69758E]
                  "
                />
              </FormField>

              <FormField
                label="City"
                required
              >
                <SelectBox
                  value={form.city}
                  onChange={(value) =>
                    update(
                      "city",
                      value
                    )
                  }
                >
                  <option value="">
                    Select City
                  </option>

                  {CITIES.map(
                    (item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    )
                  )}
                </SelectBox>
              </FormField>

              <FormField
                label="State"
                required
              >
                <SelectBox
                  value={form.state}
                  onChange={(value) =>
                    update(
                      "state",
                      value
                    )
                  }
                >
                  <option value="">
                    Select State
                  </option>

                  {STATES.map(
                    (item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    )
                  )}
                </SelectBox>
              </FormField>

              <FormField
                label="Pincode"
                required
              >
                <input
                  value={form.pincode}
                  maxLength={6}
                  onChange={(event) =>
                    update(
                      "pincode",
                      event.target.value.replace(
                        /\D/g,
                        ""
                      )
                    )
                  }
                  placeholder="Enter pincode"
                  className={inputClass}
                />
              </FormField>
            </div>
          </FormSection>

          {/* ==================================================
              3 DECEASED
          ================================================== */}

          <FormSection>
            <SectionTitle
              number={3}
              title="Deceased / Person Details"
            />

            <div
              className="
                mt-[12px]
                grid
                min-w-0
                grid-cols-3
                gap-x-[15px]
                gap-y-[12px]
              "
            >
              <FormField
                label="Full Name"
                required
              >
                <input
                  value={
                    form.deceasedName
                  }
                  onChange={(event) =>
                    update(
                      "deceasedName",
                      event.target.value
                    )
                  }
                  placeholder="Enter full name"
                  className={inputClass}
                />
              </FormField>

              <FormField
                label="Gender"
                required
              >
                <SelectBox
                  value={
                    form.deceasedGender
                  }
                  onChange={(value) =>
                    update(
                      "deceasedGender",
                      value
                    )
                  }
                >
                  <option value="">
                    Select Gender
                  </option>

                  <option value="Male">
                    Male
                  </option>

                  <option value="Female">
                    Female
                  </option>

                  <option value="Other">
                    Other
                  </option>
                </SelectBox>
              </FormField>

              <FormField
                label="Age (Approx.)"
                required
              >
                <input
                  value={
                    form.deceasedAge
                  }
                  onChange={(event) =>
                    update(
                      "deceasedAge",
                      event.target.value.replace(
                        /\D/g,
                        ""
                      )
                    )
                  }
                  placeholder="Enter age"
                  className={inputClass}
                />
              </FormField>

              <FormField
                label="Date of Passing / Incident"
                required
              >
                <DateInput
                  value={
                    form.incidentDate
                  }
                  onChange={(value) =>
                    update(
                      "incidentDate",
                      value
                    )
                  }
                  placeholder="Select date"
                />
              </FormField>

              <FormField label="Time (Approx.)">
                <TimeInput
                  value={
                    form.incidentTime
                  }
                  onChange={(value) =>
                    update(
                      "incidentTime",
                      value
                    )
                  }
                />
              </FormField>

              <FormField
                label="Place of Passing / Incident"
                required
              >
                <input
                  value={
                    form.incidentPlace
                  }
                  onChange={(event) =>
                    update(
                      "incidentPlace",
                      event.target.value
                    )
                  }
                  placeholder="Enter place / hospital / location"
                  className={inputClass}
                />
              </FormField>

              <FormField
                label="Is the body Unclaimed?"
                required
              >
                <RadioRow
                  value={
                    form.isUnclaimed
                  }
                  options={[
                    "Yes",
                    "No",
                  ]}
                  onChange={(value) =>
                    update(
                      "isUnclaimed",
                      value
                    )
                  }
                />
              </FormField>

              <FormField label="If Yes, Authority Informed">
                <SelectBox
                  value={
                    form.authority
                  }
                  onChange={(value) =>
                    update(
                      "authority",
                      value
                    )
                  }
                >
                  <option value="">
                    Select Authority
                  </option>

                  {AUTHORITIES.map(
                    (item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    )
                  )}
                </SelectBox>
              </FormField>

              <FormField label="Case/Reference No. (If any)">
                <input
                  value={
                    form.referenceNo
                  }
                  onChange={(event) =>
                    update(
                      "referenceNo",
                      event.target.value
                    )
                  }
                  placeholder="Enter case / reference number"
                  className={inputClass}
                />
              </FormField>
            </div>
          </FormSection>

          {/* ==================================================
              4 SERVICE REQUIREMENTS
          ================================================== */}

          <FormSection>
            <SectionTitle
              number={4}
              title="Service Requirements"
            />

            <div className="mt-[11px]">
              <p
                className="
                  mb-[6px]
                  text-[9px]
                  font-semibold
                  text-[#192A65]
                "
              >
                Type of Assistance Required
                <Required />
              </p>

              <div
                className="
                  grid
                  min-w-0
                  grid-cols-5
                  gap-[8px]
                "
              >
                {SERVICES.map(
                  (service) => {
                    const Icon =
                      service.icon;

                    const checked =
                      form.assistanceTypes.includes(
                        service.key
                      );

                    return (
                      <button
                        key={
                          service.key
                        }
                        type="button"
                        onClick={() =>
                          toggleAssistance(
                            service.key
                          )
                        }
                        className={`
                          relative
                          flex
                          h-[48px]
                          min-w-0
                          items-center
                          gap-[7px]
                          overflow-hidden
                          rounded-[5px]
                          border
                          px-[8px]
                          text-left

                          ${checked
                            ? "border-[#7BB795] bg-[#F3FAF5]"
                            : "border-[#E0E5EA] bg-white"
                          }
                        `}
                      >
                        <span
                          className="
                            flex
                            h-[23px]
                            w-[23px]
                            shrink-0
                            items-center
                            justify-center
                            rounded-full
                          "
                          style={{
                            backgroundColor:
                              service.bg,
                          }}
                        >
                          <Icon
                            size={12}
                            style={{
                              color:
                                service.color,
                            }}
                          />
                        </span>

                        <span
                          className="
                            min-w-0
                            flex-1
                            text-[9px]
                            font-semibold
                            leading-[11px]
                            text-[#28396E]
                          "
                        >
                          {
                            service.label
                          }
                        </span>

                        <span
                          className={`
                            flex
                            h-[11px]
                            w-[11px]
                            shrink-0
                            items-center
                            justify-center
                            rounded-[2px]
                            border

                            ${checked
                              ? "border-[#167744] bg-[#167744]"
                              : "border-[#CDD3DB] bg-white"
                            }
                          `}
                        >
                          {checked && (
                            <Check
                              size={7}
                              strokeWidth={3}
                              className="text-white"
                            />
                          )}
                        </span>
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            <div className="mt-[11px]">
              <FormField label="Additional Requirements / Notes">
                <div className="relative">
                  <textarea
                    value={
                      form.additionalNotes
                    }
                    maxLength={500}
                    onChange={(event) =>
                      update(
                        "additionalNotes",
                        event.target.value
                      )
                    }
                    placeholder="Provide any additional details or special requirements..."
                    className="
                      h-[49px]
                      w-full
                      resize-none
                      rounded-[5px]
                      border
                      border-[#DFE4EA]
                      bg-white
                      px-[9px]
                      py-[7px]
                      pr-[45px]
                      text-[9px]
                      font-semibold
                      text-[#334575]
                      outline-none
                      placeholder:text-[#6A7690]
                    "
                  />

                  <span
                    className="
                      absolute
                      bottom-[6px]
                      right-[7px]
                      text-[9px]
                      font-semibold
                      text-[#6A7690]
                    "
                  >
                    {
                      form.additionalNotes
                        .length
                    }
                    /500
                  </span>
                </div>
              </FormField>
            </div>
          </FormSection>
        </main>

        {/* ====================================================
            RIGHT SIDEBAR
        ==================================================== */}

        <aside
          className="
            w-[295px]
            min-w-0
            shrink-0
          "
        >
          {/* ==================================================
              REQUEST SUMMARY
          ================================================== */}

          <div
            className="
              rounded-[7px]
              border
              border-[#DFE8E2]
              bg-[#F7FBF8]
              px-[14px]
              pb-[17px]
              pt-[13px]
            "
          >
            <h2
              className="
                text-[9px]
                font-semibold
                text-[#175E39]
              "
            >
              Request Summary
            </h2>

            <div
              className="
                mt-[17px]
                flex
                flex-col
                items-center
                text-center
              "
            >
              <div
                className="
                  flex
                  h-[53px]
                  w-[53px]
                  items-center
                  justify-center
                  rounded-full
                  bg-[#E5F6E9]
                "
              >
                <ClipboardCheck
                  size={27}
                  className="
                    text-[#168044]
                  "
                />
              </div>

              <h3
                className="
                  mt-[13px]
                  text-[10px]
                  font-semibold
                  text-[#17603A]
                "
              >
                New Sewa Help Request
              </h3>

              <p
                className="
                  mt-[8px]
                  max-w-[210px]
                  text-[9px]
                  font-semibold
                  leading-[10px]
                  text-[#57637E]
                "
              >
                All details you enter
                will be saved and
                assigned to our team
                for immediate action.
              </p>
            </div>
          </div>

          {/* ==================================================
              ASSIGN FOLLOW UP
          ================================================== */}

          <div
            className="
              mt-[10px]
              rounded-[7px]
              border
              border-[#E2E7EB]
              bg-white
              px-[14px]
              pb-[14px]
              pt-[13px]
            "
          >
            <h2
              className="
                text-[9px]
                font-semibold
                text-[#175E39]
              "
            >
              Assign &amp; Follow-up
            </h2>

            <div className="mt-[12px]">
              <FormField
                label="Assign To"
                required
              >
                <SelectBox
                  value={form.assignTo}
                  onChange={(value) =>
                    update(
                      "assignTo",
                      value
                    )
                  }
                >
                  <option value="">
                    Select Team Member
                  </option>

                  {TEAM_MEMBERS.map(
                    (item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    )
                  )}
                </SelectBox>
              </FormField>
            </div>

            <div className="mt-[11px]">
              <FormField
                label="Follow-up Date"
                required
              >
                <DateInput
                  value={
                    form.followUpDate
                  }
                  onChange={(value) =>
                    update(
                      "followUpDate",
                      value
                    )
                  }
                  placeholder="Select follow-up date"
                />
              </FormField>
            </div>

            <div className="mt-[11px]">
              <FormField label="Follow-up Time">
                <TimeInput
                  value={
                    form.followUpTime
                  }
                  onChange={(value) =>
                    update(
                      "followUpTime",
                      value
                    )
                  }
                />
              </FormField>
            </div>

            <div className="mt-[11px]">
              <FormField label="Add Note for Team (Optional)">
                <div className="relative">
                  <textarea
                    value={
                      form.teamNote
                    }
                    maxLength={250}
                    onChange={(event) =>
                      update(
                        "teamNote",
                        event.target.value
                      )
                    }
                    placeholder="Add internal note for follow-up..."
                    className="
                      h-[61px]
                      w-full
                      resize-none
                      rounded-[5px]
                      border
                      border-[#DFE4EA]
                      px-[9px]
                      py-[7px]
                      pr-[42px]
                      text-[9px]
                      text-[#334575]
                      outline-none
                      placeholder:text-[#6B7690]
                    "
                  />

                  <span
                    className="
                      absolute
                      bottom-[6px]
                      right-[7px]
                      text-[9px]
                      font-semibold
                      text-[#6A7690]
                    "
                  >
                    {
                      form.teamNote
                        .length
                    }
                    /250
                  </span>
                </div>
              </FormField>
            </div>
          </div>

          {/* ==================================================
              ATTACHMENT
          ================================================== */}

          <div
            className="
              mt-[10px]
              rounded-[7px]
              border
              border-[#E2E7EB]
              bg-white
              px-[14px]
              pb-[14px]
              pt-[13px]
            "
          >
            <h2
              className="
                text-[9px]
                font-semibold
                text-[#175E39]
              "
            >
              Attachments
              <span
                className="
                  ml-[3px]
                  font-semibold
                "
              >
                (Optional)
              </span>
            </h2>

            <input
              ref={fileRef}
              type="file"
              multiple
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={handleFiles}
              className="hidden"
            />

            <button
              type="button"
              onClick={() =>
                fileRef.current?.click()
              }
              className="
                mt-[11px]
                flex
                min-h-[145px]
                w-full
                flex-col
                items-center
                justify-center
                rounded-[6px]
                border
                border-dashed
                border-[#CDD4DC]
                bg-white
                px-[14px]
                text-center
              "
            >
              <UploadCloud
                size={27}
                strokeWidth={1.7}
                className="
                  text-[#176C42]
                "
              />

              <p
                className="
                  mt-[9px]
                  text-[9px]
                  font-semibold
                  text-[#22613E]
                "
              >
                {attachments.length
                  ? `${attachments.length} file(s) selected`
                  : "Drag & drop files here"}
              </p>

              <p
                className="
                  mt-[3px]
                  text-[9px]
                  font-semibold
                  text-[#3E4E75]
                "
              >
                or click to upload
              </p>

              <p
                className="
                  mt-[9px]
                  text-[9px]
                  font-semibold
                  text-[#788196]
                "
              >
                Supported formats:
                JPG, PNG, PDF
                (Max 10MB)
              </p>

              <span
                className="
                  mt-[10px]
                  rounded-[4px]
                  border
                  border-[#DDE3E8]
                  bg-white
                  px-[13px]
                  py-[6px]
                  text-[9px]
                  font-semibold
                  text-[#267247]
                "
              >
                Choose File
              </span>
            </button>
          </div>
        </aside>
      </div>

      {/* ======================================================
          BOTTOM BUTTONS
      ====================================================== */}

      <div
        className="
          mt-[12px]
          flex
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
            gap-[10px]
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
              shadow-[0_2px_5px_rgba(0,95,46,0.14)]
              disabled:opacity-60
            "
          >
            <Send size={13} />

            {saving
              ? "Submitting..."
              : "Submit Request"}
          </button>
        </div>
      </div>
    </form>
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
   SECTION TITLE
============================================================ */

function SectionTitle({
  number,
  title,
}: {
  number: number;
  title: string;
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
          h-[21px]
          w-[21px]
          shrink-0
          items-center
          justify-center
          rounded-full
          bg-[#075B35]
          text-[9px]
          font-semibold
          text-white
        "
      >
        {number}
      </div>

      <h2
        className="
          text-[9.5px]
          font-semibold
          text-[#175E39]
        "
      >
        {title}
      </h2>
    </div>
  );
}

/* ============================================================
   FIELD
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
          <Required />
        )}
      </p>

      {children}
    </div>
  );
}

/* ============================================================
   REQUIRED
============================================================ */

function Required() {
  return (
    <span
      className="
        ml-[3px]
        text-[#DD4040]
      "
    >
      *
    </span>
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
  text-[#26396F]
  outline-none
  placeholder:text-[#69758E]
  focus:border-[#79B493]
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
          text-[#26396F]
          outline-none
        "
      >
        {children}
      </select>

      <ChevronDown
        size={10}
        className="
          pointer-events-none
          absolute
          right-[9px]
          top-1/2
          -translate-y-1/2
          text-[#26396F]
        "
      />
    </div>
  );
}

/* ============================================================
   DATE INPUT
============================================================ */

function DateInput({
  value,
  onChange,
  placeholder = "Select date",
}: {
  value: string;
  onChange: (
    value: string
  ) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <CalendarDays
        size={11}
        className="
          pointer-events-none
          absolute
          left-[9px]
          top-1/2
          -translate-y-1/2
          text-[#526184]
        "
      />

      <input
        type="date"
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        placeholder={placeholder}
        className={`
          ${inputClass}
          pl-[28px]
        `}
      />
    </div>
  );
}

/* ============================================================
   TIME INPUT
============================================================ */

function TimeInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (
    value: string
  ) => void;
}) {
  return (
    <div className="relative">
      <Clock3
        size={11}
        className="
          pointer-events-none
          absolute
          left-[9px]
          top-1/2
          -translate-y-1/2
          text-[#526184]
        "
      />

      <input
        type="time"
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        className={`
          ${inputClass}
          pl-[28px]
        `}
      />
    </div>
  );
}

/* ============================================================
   RADIO
============================================================ */

function RadioRow({
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
              text-[9px]
              font-semibold
              text-[#344574]
            "
          >
            <input
              type="radio"
              checked={
                value ===
                option
              }
              onChange={() =>
                onChange(
                  option
                )
              }
              className="
                h-[12px]
                w-[12px]
                accent-[#0C7040]
              "
            />

            {option}
          </label>
        )
      )}
    </div>
  );
}
