"use client";

import {
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from "react";

import { useRouter } from "next/navigation";

import {
  ArrowLeft,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronRight,
  CircleUserRound,
  Clock3,
  FileText,
  HandHeart,
  Headphones,
  HeartHandshake,
  Info,
  Languages,
  MapPin,
  Phone,
  Save,
  Send,
  ShieldCheck,
  UploadCloud,
  UserRound,
  UsersRound,
  X,
  BusFront,
} from "lucide-react";

import { volunteersApi } from "@/lib/volunteersApi";

/* ============================================================
   TYPES
============================================================ */

type Gender =
  | ""
  | "Male"
  | "Female"
  | "Other";

type Availability =
  | ""
  | "Flexible"
  | "Part-time"
  | "Full-time"
  | "Weekends";

type RoleValue =
  | ""
  | "Field Support"
  | "Transport Support"
  | "Ritual Support"
  | "Coordination"
  | "Admin Support"
  | "Others";

type VolunteerForm = {
  fullName: string;
  dateOfBirth: string;
  gender: Gender;

  email: string;

  countryCode: string;
  mobile: string;

  alternateCountryCode: string;
  alternateNumber: string;

  address: string;
  city: string;
  state: string;
  pincode: string;

  preferredArea: string;

  availability: Availability;

  preferredDays: string[];
  preferredTime: string;

  role: RoleValue;
  skills: string[];

  experience: string;
  languages: string[];

  aboutYourself: string;

  heardAbout: string;
  motivationReason: string;
  organisationStatus: string;

  declarationCorrect: boolean;
  declarationPolicy: boolean;
};

type VolunteerCreatePayload = {
  name: string;
  dateOfBirth?: string;
  gender?: string;

  email: string;
  phone: string;
  whatsappPhone?: string;

  address: string;
  city: string;
  state: string;
  pincode: string;

  assignedArea?: string;
  availability?: string;

  availabilityDays?: string[];
  preferredTimes?: string[];

  preferredRole?: string;
  skills?: string[];

  experience?: string;
  languagesKnown?: string;

  motivation?: string;
  organisation?: string;

  heardAbout?: string;

  consent?: boolean;

  photograph?: File | null;
  document?: File | null;
};

/* ============================================================
   DEFAULT FORM
============================================================ */

const DEFAULT_FORM: VolunteerForm = {
  fullName: "",
  dateOfBirth: "",
  gender: "",

  email: "",

  countryCode: "+91",
  mobile: "",

  alternateCountryCode: "+91",
  alternateNumber: "",

  address: "",
  city: "",
  state: "",
  pincode: "",

  preferredArea: "",

  availability: "",

  preferredDays: [],
  preferredTime: "",

  role: "",
  skills: [],

  experience: "",
  languages: [],

  aboutYourself: "",

  heardAbout: "",
  motivationReason: "",
  organisationStatus: "",

  declarationCorrect: false,
  declarationPolicy: false,
};

/* ============================================================
   OPTIONS
============================================================ */

const cities = [
  "Delhi",
  "New Delhi",
  "Noida",
  "Greater Noida",
  "Ghaziabad",
  "Gurugram",
  "Faridabad",
  "Other",
];

const states = [
  "Delhi",
  "Uttar Pradesh",
  "Haryana",
  "Rajasthan",
  "Punjab",
  "Uttarakhand",
  "Other",
];

const areas = [
  "Central Delhi",
  "South Delhi",
  "North Delhi",
  "East Delhi",
  "West Delhi",
  "Noida",
  "Greater Noida",
  "Ghaziabad",
  "Gurugram",
  "Faridabad",
  "Any Area",
];

const skillOptions = [
  "Driving",
  "On-ground Support",
  "Documentation",
  "Coordination",
  "Medical Assistance",
  "Social Media",
  "Photography",
  "Event Management",
  "Ritual Assistance",
  "Communication",
];

const languageOptions = [
  "Hindi",
  "English",
  "Punjabi",
  "Urdu",
  "Bengali",
  "Marathi",
  "Gujarati",
  "Other",
];

const dayOptions = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const roleOptions = [
  "Field Support",
  "Transport Support",
  "Ritual Support",
  "Coordination",
  "Admin Support",
  "Others",
];

const roleSidebar = [
  {
    title: "Field Support",
    description: "On-ground assistance & support",
    icon: ShieldCheck,
    bg: "#E8F7EA",
    color: "#21894A",
  },
  {
    title: "Transport Support",
    description: "Transport & logistics help",
    icon: BusFront,
    bg: "#E8F2FF",
    color: "#2877D9",
  },
  {
    title: "Ritual Support",
    description: "Rituals, priest & last rites support",
    icon: HandHeart,
    bg: "#F1E7FD",
    color: "#9345DB",
  },
  {
    title: "Coordination",
    description: "Case coordination & follow-up",
    icon: HeartHandshake,
    bg: "#FFF0E4",
    color: "#ED7C35",
  },
  {
    title: "Admin Support",
    description: "Office, documentation & admin tasks",
    icon: BriefcaseBusiness,
    bg: "#E1F6F6",
    color: "#169DA5",
  },
  {
    title: "Others",
    description: "Other support based on requirements",
    icon: UsersRound,
    bg: "#EEF0F5",
    color: "#546584",
  },
];

/* ============================================================
   PAGE
============================================================ */

export default function AddVolunteerPage() {
  const router = useRouter();

  const profileInputRef =
    useRef<HTMLInputElement>(null);

  const documentInputRef =
    useRef<HTMLInputElement>(null);

  const [form, setForm] =
    useState<VolunteerForm>(
      DEFAULT_FORM
    );

  const [profilePhoto, setProfilePhoto] =
    useState<File | null>(null);

  const [
    profilePreview,
    setProfilePreview,
  ] = useState("");

  const [documentFile, setDocumentFile] =
    useState<File | null>(null);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  /* ==========================================================
     GENERIC UPDATE
  ========================================================== */

  function updateField<
    K extends keyof VolunteerForm
  >(
    field: K,
    value: VolunteerForm[K]
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    setError("");
    setSuccess("");
  }

  /* ==========================================================
     PROFILE PHOTO
  ========================================================== */

  function handleProfileChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError(
        "Profile photo must be less than 2MB."
      );
      return;
    }

    setProfilePhoto(file);

    const preview =
      URL.createObjectURL(file);

    setProfilePreview(preview);
    setError("");
  }

  /* ==========================================================
     DOCUMENT
  ========================================================== */

  function handleDocumentChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError(
        "Document must be less than 5MB."
      );
      return;
    }

    setDocumentFile(file);
    setError("");
  }

  /* ==========================================================
     MULTI SELECT HELPERS
  ========================================================== */

  function toggleArrayValue(
    field: "skills" | "languages" | "preferredDays",
    value: string
  ) {
    setForm((previous) => {
      const current =
        previous[field];

      const exists =
        current.includes(value);

      return {
        ...previous,
        [field]: exists
          ? current.filter(
            (item) => item !== value
          )
          : [...current, value],
      };
    });
  }

  /* ==========================================================
     VALIDATION
  ========================================================== */

  function validate() {
    if (!form.fullName.trim()) {
      return "Full name is required.";
    }

    if (!form.dateOfBirth) {
      return "Date of birth is required.";
    }

    if (!form.gender) {
      return "Gender is required.";
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

    if (!form.mobile.trim()) {
      return "Mobile number is required.";
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

    if (!form.availability) {
      return "Availability is required.";
    }

    if (!form.role) {
      return "Volunteer role is required.";
    }

    if (!form.heardAbout) {
      return "Please select how the volunteer heard about Moksha Sewa.";
    }

    if (!form.motivationReason) {
      return "Please select why the volunteer wants to join.";
    }

    if (
      !form.declarationCorrect ||
      !form.declarationPolicy
    ) {
      return "Both declarations must be accepted.";
    }

    return "";
  }

  /* ==========================================================
     PAYLOAD
  ========================================================== */

  function buildPayload():
    VolunteerCreatePayload {
    return {
      name: form.fullName.trim(),

      dateOfBirth:
        form.dateOfBirth ||
        undefined,

      gender:
        form.gender || undefined,

      email:
        form.email
          .trim()
          .toLowerCase(),

      phone: `${form.countryCode} ${form.mobile.trim()}`,

      whatsappPhone:
        form.alternateNumber.trim()
          ? `${form.alternateCountryCode} ${form.alternateNumber.trim()}`
          : undefined,

      address:
        form.address.trim(),

      city: form.city,
      state: form.state,

      pincode:
        form.pincode.trim(),

      assignedArea:
        form.preferredArea ||
        undefined,

      availability:
        form.availability ||
        undefined,

      availabilityDays:
        form.preferredDays,

      preferredTimes:
        form.preferredTime
          ? [form.preferredTime]
          : [],

      preferredRole:
        form.role ||
        undefined,

      skills: form.skills,

      experience:
        [
          form.experience,
          form.aboutYourself,
        ]
          .filter(Boolean)
          .join("\n\n") ||
        undefined,

      languagesKnown:
        form.languages.length
          ? form.languages.join(", ")
          : undefined,

      motivation:
        form.motivationReason ||
        undefined,

      organisation:
        form.organisationStatus ||
        undefined,

      heardAbout:
        form.heardAbout ||
        undefined,

      consent:
        form.declarationCorrect &&
        form.declarationPolicy,

      photograph:
        profilePhoto,

      document:
        documentFile,
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
       * Safe access:
       * existing volunteersApi ko break nahi karega.
       */

      const api =
        volunteersApi as typeof volunteersApi & {
          create?: (
            payload: VolunteerCreatePayload
          ) => Promise<unknown>;
        };

      if (
        typeof api.create !==
        "function"
      ) {
        throw new Error(
          "volunteersApi.create() is not configured."
        );
      }

      await api.create(payload);

      setSuccess(
        "Volunteer added successfully."
      );

      setTimeout(() => {
        router.back();
      }, 600);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not add volunteer."
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
        "moksha-add-volunteer-draft",
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
     CHARACTER COUNT
  ========================================================== */

  const aboutCount =
    form.aboutYourself.length;

  return (
    <form
      onSubmit={handleSubmit}
      className="
        w-full
        min-w-0
        bg-white
        px-[14px]
        pb-[18px]
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
            tracking-[-0.35px]
            text-[#005E2E]
          "
        >
          Add New Volunteer
        </h1>

        <div
          className="
            mt-[6px]
            flex
            items-center
            gap-[6px]
            text-[10px]
            font-semibold
            text-[#44537D]
          "
        >
          <button
            type="button"
            className="hover:text-[#087740]"
          >
            Dashboard
          </button>

          <ChevronRight size={10} />

          <button
            type="button"
            onClick={() =>
              router.back()
            }
            className="hover:text-[#087740]"
          >
            Volunteers
          </button>

          <ChevronRight size={10} />

          <span className="text-[#253970]">
            Add New Volunteer
          </span>
        </div>
      </div>

      {/* ALERT */}

      {(error || success) && (
        <div
          className={`
            mt-[10px]
            rounded-[5px]
            border
            px-[12px]
            py-[8px]
            text-[10px]
            font-semibold

            ${error
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-[#CDE8D4] bg-[#F2FAF4] text-[#177541]"
            }
          `}
        >
          {error || success}
        </div>
      )}

      {/* ======================================================
          GRID
      ====================================================== */}

      <div
        className="
          mt-[12px]
          grid
          min-w-0
          grid-cols-[minmax(0,1fr)_280px]
          gap-[17px]
        "
      >
        {/* ====================================================
            LEFT FORM
        ==================================================== */}

        <main className="min-w-0 space-y-[10px]">
          {/* ==================================================
              1 PERSONAL INFORMATION
          ================================================== */}

          <FormSection>
            <SectionHeading
              number={1}
              title="Personal Information"
              icon={UserRound}
            />

            <div
              className="
                mt-[12px]
                grid
                grid-cols-[1.2fr_0.9fr_0.95fr_0.7fr]
                gap-x-[18px]
                gap-y-[14px]
              "
            >
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
                      event.target.value
                    )
                  }
                  placeholder="Enter full name"
                  className={inputClass}
                />
              </FormField>

              <FormField
                label="Date of Birth"
                required
              >
                <input
                  type="date"
                  value={
                    form.dateOfBirth
                  }
                  onChange={(event) =>
                    updateField(
                      "dateOfBirth",
                      event.target.value
                    )
                  }
                  className={inputClass}
                />
              </FormField>

              <FormField
                label="Gender"
                required
              >
                <SelectBox
                  value={form.gender}
                  onChange={(value) =>
                    updateField(
                      "gender",
                      value as Gender
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

              {/* PROFILE PHOTO */}

              <div className="row-span-2">
                <p
                  className="
                    mb-[6px]
                    text-[7.5px]
                    font-semibold
                    text-[#192A65]
                  "
                >
                  Profile Photo
                </p>

                <input
                  ref={profileInputRef}
                  type="file"
                  accept="image/png,image/jpeg"
                  onChange={
                    handleProfileChange
                  }
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() =>
                    profileInputRef.current?.click()
                  }
                  className="
                    flex
                    h-[104px]
                    w-full
                    flex-col
                    items-center
                    justify-center
                    overflow-hidden
                    rounded-[6px]
                    border
                    border-dashed
                    border-[#CFD5DE]
                    bg-white
                    text-center
                  "
                >
                  {profilePreview ? (
                    <img
                      src={
                        profilePreview
                      }
                      alt="Profile preview"
                      className="
                        h-full
                        w-full
                        object-cover
                      "
                    />
                  ) : (
                    <>
                      <UploadCloud
                        size={21}
                        strokeWidth={1.7}
                        className="text-[#287C4B]"
                      />

                      <span
                        className="
                          mt-[6px]
                          text-[7px]
                          font-semibold
                          text-[#26396F]
                        "
                      >
                        Click to upload
                      </span>

                      <span
                        className="
                          mt-[3px]
                          text-[6px]
                          font-semibold
                          text-[#64708B]
                        "
                      >
                        JPG, PNG (Max 2MB)
                      </span>
                    </>
                  )}
                </button>
              </div>

              <FormField
                label="Email Address"
                required
              >
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
                  className={inputClass}
                />
              </FormField>

              <FormField
                label="Mobile Number"
                required
              >
                <PhoneField
                  code={
                    form.countryCode
                  }
                  phone={form.mobile}
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
                      "mobile",
                      value
                    )
                  }
                  placeholder="Enter mobile number"
                />
              </FormField>

              <FormField label="Alternate Number">
                <PhoneField
                  code={
                    form.alternateCountryCode
                  }
                  phone={
                    form.alternateNumber
                  }
                  onCodeChange={(
                    value
                  ) =>
                    updateField(
                      "alternateCountryCode",
                      value
                    )
                  }
                  onPhoneChange={(
                    value
                  ) =>
                    updateField(
                      "alternateNumber",
                      value
                    )
                  }
                  placeholder="Enter alternate number"
                />
              </FormField>
            </div>
          </FormSection>

          {/* ==================================================
              2 LOCATION & AVAILABILITY
          ================================================== */}

          <FormSection>
            <SectionHeading
              number={2}
              title="Location & Availability"
              icon={MapPin}
            />

            <div
              className="
                mt-[12px]
                grid
                grid-cols-4
                gap-x-[18px]
                gap-y-[13px]
              "
            >
              <FormField
                label="Address"
                required
              >
                <input
                  value={
                    form.address
                  }
                  onChange={(event) =>
                    updateField(
                      "address",
                      event.target.value
                    )
                  }
                  placeholder="Enter complete address"
                  className={inputClass}
                />
              </FormField>

              <FormField
                label="City"
                required
              >
                <SelectBox
                  value={form.city}
                  onChange={(value) =>
                    updateField(
                      "city",
                      value
                    )
                  }
                >
                  <option value="">
                    Select City
                  </option>

                  {cities.map(
                    (city) => (
                      <option
                        key={city}
                        value={city}
                      >
                        {city}
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
                    updateField(
                      "state",
                      value
                    )
                  }
                >
                  <option value="">
                    Select State
                  </option>

                  {states.map(
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

              <FormField
                label="Pincode"
                required
              >
                <input
                  value={
                    form.pincode
                  }
                  maxLength={6}
                  onChange={(event) =>
                    updateField(
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

              <FormField label="Preferred Location / Area">
                <SelectBox
                  value={
                    form.preferredArea
                  }
                  onChange={(value) =>
                    updateField(
                      "preferredArea",
                      value
                    )
                  }
                >
                  <option value="">
                    Select Area
                  </option>

                  {areas.map(
                    (area) => (
                      <option
                        key={area}
                        value={area}
                      >
                        {area}
                      </option>
                    )
                  )}
                </SelectBox>
              </FormField>

              <FormField
                label="Availability"
                required
              >
                <SelectBox
                  value={
                    form.availability
                  }
                  onChange={(value) =>
                    updateField(
                      "availability",
                      value as Availability
                    )
                  }
                >
                  <option value="">
                    Select Availability
                  </option>

                  <option value="Flexible">
                    Flexible
                  </option>

                  <option value="Part-time">
                    Part-time
                  </option>

                  <option value="Full-time">
                    Full-time
                  </option>

                  <option value="Weekends">
                    Weekends
                  </option>
                </SelectBox>
              </FormField>

              <MultiSelect
                label="Preferred Days"
                placeholder="Select Days"
                values={
                  form.preferredDays
                }
                options={dayOptions}
                onToggle={(value) =>
                  toggleArrayValue(
                    "preferredDays",
                    value
                  )
                }
              />

              <FormField label="Preferred Time Slot">
                <SelectBox
                  value={
                    form.preferredTime
                  }
                  onChange={(value) =>
                    updateField(
                      "preferredTime",
                      value
                    )
                  }
                >
                  <option value="">
                    Select Time Slot
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

                  <option value="Night">
                    Night
                  </option>

                  <option value="Any Time">
                    Any Time
                  </option>
                </SelectBox>
              </FormField>
            </div>
          </FormSection>

          {/* ==================================================
              3 ROLE & SKILLS
          ================================================== */}

          <FormSection>
            <SectionHeading
              number={3}
              title="Role & Skills"
              icon={BriefcaseBusiness}
            />

            <div
              className="
                mt-[12px]
                grid
                grid-cols-[1.05fr_1fr_0.9fr_0.85fr]
                gap-[18px]
              "
            >
              <FormField
                label="Role / Area of Interest"
                required
              >
                <SelectBox
                  value={form.role}
                  onChange={(value) =>
                    updateField(
                      "role",
                      value as RoleValue
                    )
                  }
                >
                  <option value="">
                    Select Role
                  </option>

                  {roleOptions.map(
                    (role) => (
                      <option
                        key={role}
                        value={role}
                      >
                        {role}
                      </option>
                    )
                  )}
                </SelectBox>
              </FormField>

              <MultiSelect
                label="Skills / Expertise"
                placeholder="Select Skills"
                values={form.skills}
                options={skillOptions}
                onToggle={(value) =>
                  toggleArrayValue(
                    "skills",
                    value
                  )
                }
              />

              <FormField label="Experience (Optional)">
                <SelectBox
                  value={
                    form.experience
                  }
                  onChange={(value) =>
                    updateField(
                      "experience",
                      value
                    )
                  }
                >
                  <option value="">
                    Select Experience
                  </option>

                  <option value="Fresher">
                    Fresher
                  </option>

                  <option value="Less than 1 year">
                    Less than 1 year
                  </option>

                  <option value="1-3 years">
                    1-3 years
                  </option>

                  <option value="3-5 years">
                    3-5 years
                  </option>

                  <option value="5+ years">
                    5+ years
                  </option>
                </SelectBox>
              </FormField>

              <MultiSelect
                label="Languages Known"
                placeholder="Select Languages"
                values={form.languages}
                options={
                  languageOptions
                }
                onToggle={(value) =>
                  toggleArrayValue(
                    "languages",
                    value
                  )
                }
              />
            </div>

            <div className="mt-[12px]">
              <FormField label="Tell us about yourself (Optional)">
                <div className="relative">
                  <textarea
                    maxLength={500}
                    value={
                      form.aboutYourself
                    }
                    onChange={(event) =>
                      updateField(
                        "aboutYourself",
                        event.target.value
                      )
                    }
                    placeholder="Share your motivation, experience or anything you'd like us to know..."
                    className="
                      h-[55px]
                      w-full
                      resize-none
                      rounded-[5px]
                      border
                      border-[#DFE4EA]
                      bg-white
                      px-[10px]
                      py-[8px]
                      pr-[48px]
                      text-[7.3px]
                      font-semibold
                      text-[#26396F]
                      outline-none
                      placeholder:text-[#6A7690]
                      focus:border-[#7AB791]
                    "
                  />

                  <span
                    className="
                      absolute
                      bottom-[7px]
                      right-[9px]
                      text-[6px]
                      font-semibold
                      text-[#6A7690]
                    "
                  >
                    {aboutCount}/500
                  </span>
                </div>
              </FormField>
            </div>
          </FormSection>

          {/* ==================================================
              4 ADDITIONAL INFORMATION
          ================================================== */}

          <FormSection>
            <SectionHeading
              number={4}
              title="Additional Information"
              icon={FileText}
            />

            <div
              className="
                mt-[12px]
                grid
                grid-cols-3
                gap-[18px]
              "
            >
              <FormField
                label="How did you hear about Moksha Sewa?"
                required
              >
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

                  <option value="Social Media">
                    Social Media
                  </option>

                  <option value="Friend / Family">
                    Friend / Family
                  </option>

                  <option value="Event">
                    Event
                  </option>

                  <option value="NGO / Organisation">
                    NGO / Organisation
                  </option>

                  <option value="Other">
                    Other
                  </option>
                </SelectBox>
              </FormField>

              <FormField
                label="Why do you want to volunteer with us?"
                required
              >
                <SelectBox
                  value={
                    form.motivationReason
                  }
                  onChange={(value) =>
                    updateField(
                      "motivationReason",
                      value
                    )
                  }
                >
                  <option value="">
                    Select Option
                  </option>

                  <option value="Community Service">
                    Community Service
                  </option>

                  <option value="Social Impact">
                    Social Impact
                  </option>

                  <option value="Personal Interest">
                    Personal Interest
                  </option>

                  <option value="Professional Experience">
                    Professional Experience
                  </option>

                  <option value="Support Moksha Sewa Mission">
                    Support Moksha Sewa Mission
                  </option>

                  <option value="Other">
                    Other
                  </option>
                </SelectBox>
              </FormField>

              <FormField label="Are you part of any organization?">
                <SelectBox
                  value={
                    form.organisationStatus
                  }
                  onChange={(value) =>
                    updateField(
                      "organisationStatus",
                      value
                    )
                  }
                >
                  <option value="">
                    Select Option
                  </option>

                  <option value="No">
                    No
                  </option>

                  <option value="Yes - NGO">
                    Yes - NGO
                  </option>

                  <option value="Yes - Corporate">
                    Yes - Corporate
                  </option>

                  <option value="Yes - College / University">
                    Yes - College / University
                  </option>

                  <option value="Yes - Other">
                    Yes - Other
                  </option>
                </SelectBox>
              </FormField>
            </div>

            {/* DOCUMENT UPLOAD */}

            <div className="mt-[10px]">
              <p
                className="
                  mb-[6px]
                  text-[7.5px]
                  font-semibold
                  text-[#192A65]
                "
              >
                Upload Documents
                <span
                  className="
                    ml-[3px]
                    font-semibold
                  "
                >
                  (Optional)
                </span>
              </p>

              <input
                ref={
                  documentInputRef
                }
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={
                  handleDocumentChange
                }
                className="hidden"
              />

              <button
                type="button"
                onClick={() =>
                  documentInputRef.current?.click()
                }
                className="
                  flex
                  h-[53px]
                  w-full
                  items-center
                  justify-center
                  gap-[12px]
                  rounded-[6px]
                  border
                  border-dashed
                  border-[#CFD5DE]
                  bg-white
                "
              >
                <UploadCloud
                  size={21}
                  className="
                    shrink-0
                    text-[#287C4B]
                  "
                />

                <div className="text-left">
                  <p
                    className="
                      text-[7.5px]
                      font-semibold
                      text-[#33416D]
                    "
                  >
                    {documentFile
                      ? documentFile.name
                      : "Drag & drop files here or click to upload"}
                  </p>

                  <p
                    className="
                      mt-[2px]
                      text-[6px]
                      font-semibold
                      text-[#748097]
                    "
                  >
                    Supported formats: PDF,
                    JPG, PNG (Max 5MB)
                  </p>
                </div>
              </button>
            </div>
          </FormSection>

          {/* ==================================================
              5 CONSENT
          ================================================== */}

          <FormSection>
            <SectionHeading
              number={5}
              title="Consent & Declaration"
              icon={HandHeart}
            />

            <div
              className="
                mt-[11px]
                space-y-[8px]
              "
            >
              <ConsentRow
                checked={
                  form.declarationCorrect
                }
                onChange={(checked) =>
                  updateField(
                    "declarationCorrect",
                    checked
                  )
                }
              >
                I confirm that the
                information provided above
                is true and correct to the
                best of my knowledge.
                <RequiredStar />
              </ConsentRow>

              <ConsentRow
                checked={
                  form.declarationPolicy
                }
                onChange={(checked) =>
                  updateField(
                    "declarationPolicy",
                    checked
                  )
                }
              >
                I agree to abide by the
                rules, policies and
                guidelines of Moksha Sewa
                and maintain confidentiality
                of the information.
                <RequiredStar />
              </ConsentRow>
            </div>
          </FormSection>
        </main>

        {/* ====================================================
            RIGHT SIDEBAR
        ==================================================== */}

        <aside className="min-w-0">
          {/* QUICK TIPS */}

          <SidebarCard>
            <div
              className="
                flex
                items-center
                gap-[9px]
              "
            >
              <Info
                size={18}
                className="text-[#3879CA]"
              />

              <h2
                className="
                  text-[10px]
                  font-semibold
                  text-[#17623A]
                "
              >
                Quick Tips
              </h2>
            </div>

            <div
              className="
                mt-[14px]
                space-y-[12px]
              "
            >
              {[
                "Please fill all mandatory fields marked with *.",
                "Provide accurate contact information.",
                "Your data is safe and will not be shared.",
                "You can update details anytime later.",
              ].map((tip) => (
                <TipRow
                  key={tip}
                  text={tip}
                />
              ))}
            </div>

            <div
              className="
                mt-[2px]
                flex
                justify-end
              "
            >
              <UsersRound
                size={38}
                strokeWidth={1.2}
                className="
                  opacity-[0.16]
                  text-[#18884A]
                "
              />
            </div>
          </SidebarCard>

          {/* POPULAR ROLES */}

          <SidebarCard className="mt-[13px]">
            <h2
              className="
                text-[10px]
                font-semibold
                text-[#17623A]
              "
            >
              Popular Volunteer Roles
            </h2>

            <div
              className="
                mt-[13px]
                space-y-[11px]
              "
            >
              {roleSidebar.map(
                (role) => {
                  const Icon =
                    role.icon;

                  return (
                    <button
                      key={
                        role.title
                      }
                      type="button"
                      onClick={() =>
                        updateField(
                          "role",
                          role.title as RoleValue
                        )
                      }
                      className="
                        flex
                        w-full
                        items-center
                        gap-[9px]
                        text-left
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
                        "
                        style={{
                          backgroundColor:
                            role.bg,
                        }}
                      >
                        <Icon
                          size={13}
                          style={{
                            color:
                              role.color,
                          }}
                        />
                      </div>

                      <div className="min-w-0">
                        <p
                          className="
                            text-[10px]
                            font-semibold
                            text-[#253870]
                          "
                        >
                          {role.title}
                        </p>

                        <p
                          className="
                            mt-[2px]
                            truncate
                            text-[7.5px]
                            font-semibold
                            text-[#64718B]
                          "
                        >
                          {
                            role.description
                          }
                        </p>
                      </div>
                    </button>
                  );
                }
              )}
            </div>
          </SidebarCard>

          {/* AVAILABILITY GUIDE */}

          <SidebarCard className="mt-[13px]">
            <div
              className="
                flex
                items-center
                gap-[8px]
              "
            >
              <Clock3
                size={17}
                className="text-[#7154C4]"
              />

              <h2
                className="
                  text-[10px]
                  font-semibold
                  text-[#17623A]
                "
              >
                Availability Guide
              </h2>
            </div>

            <div
              className="
                mt-[12px]
                space-y-[10px]
              "
            >
              <GuideRow
                label="Flexible:"
                value="As per requirement"
              />

              <GuideRow
                label="Part-time:"
                value="2 - 4 hours / day"
              />

              <GuideRow
                label="Full-time:"
                value="6 - 8 hours / day"
              />

              <GuideRow
                label="Weekends:"
                value="Sat / Sun availability"
              />
            </div>
          </SidebarCard>

          {/* NEED HELP */}

          <div
            className="
              mt-[13px]
              rounded-[7px]
              border
              border-[#DFE9E2]
              bg-[#F6FBF7]
              px-[16px]
              py-[14px]
            "
          >
            <div
              className="
                flex
                items-start
                gap-[11px]
              "
            >
              <Headphones
                size={28}
                strokeWidth={1.7}
                className="
                  shrink-0
                  text-[#17683A]
                "
              />

              <div>
                <h2
                  className="
                    text-[10px]
                    font-semibold
                    text-[#17623A]
                  "
                >
                  Need Help?
                </h2>

                <p
                  className="
                    mt-[5px]
                    text-[7.5px]
                    font-semibold
                    text-[#4B597B]
                  "
                >
                  For any assistance,
                  contact our team.
                </p>

                <div
                  className="
                    mt-[12px]
                    flex
                    items-center
                    gap-[8px]
                  "
                >
                  <Phone
                    size={12}
                    className="text-[#53618A]"
                  />

                  <span
                    className="
                      text-[10px]
                      font-semibold
                      text-[#22733D]
                    "
                  >
                    +91 98765 43210
                  </span>
                </div>

                <div
                  className="
                    mt-[10px]
                    flex
                    items-center
                    gap-[8px]
                  "
                >
                  <FileText
                    size={12}
                    className="text-[#53618A]"
                  />

                  <span
                    className="
                      text-[10px]
                      font-semibold
                      text-[#314276]
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
          BOTTOM BUTTONS
      ====================================================== */}

      <div
        className="
          mt-[12px]
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
            h-[36px]
            items-center
            gap-[7px]
            rounded-[5px]
            border
            border-[#DDE3E9]
            bg-white
            px-[16px]
            text-[10px]
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
              text-[10px]
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
              text-[10px]
              font-semibold
              text-white
              shadow-[0_2px_5px_rgba(0,95,46,0.15)]
              disabled:opacity-60
            "
          >
            <Send size={14} />

            {saving
              ? "Submitting..."
              : "Submit Volunteer"}
          </button>
        </div>
      </div>
    </form>
  );
}

/* ============================================================
   SECTION
============================================================ */

function FormSection({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <section
      className="
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
          bg-[#E6F5E9]
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
    <div className="min-w-0">
      <p
        className="
          mb-[6px]
          text-[10px]
          font-semibold
          text-[#192A65]
        "
      >
        {label}

        {required && (
          <RequiredStar />
        )}
      </p>

      {children}
    </div>
  );
}

/* ============================================================
   REQUIRED STAR
============================================================ */

function RequiredStar() {
  return (
    <span
      className="
        ml-[3px]
        text-[#E14242]
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
  rounded-[5px]
  border
  border-[#DFE4EA]
  bg-white
  px-[10px]
  text-[10px]
  font-semibold
  text-[#253970]
  outline-none
  placeholder:text-[#6B7690]
  focus:border-[#78B58F]
`;

/* ============================================================
   SELECT BOX
============================================================ */

function SelectBox({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="
          h-[34px]
          w-full
          appearance-none
          rounded-[5px]
          border
          border-[#DFE4EA]
          bg-white
          px-[10px]
          pr-[28px]
          text-[10px]
          font-semibold
          text-[#253970]
          outline-none
          focus:border-[#78B58F]
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
          text-[#253970]
        "
      />
    </div>
  );
}

/* ============================================================
   PHONE FIELD
============================================================ */

function PhoneField({
  code,
  phone,
  onCodeChange,
  onPhoneChange,
  placeholder,
}: {
  code: string;
  phone: string;
  onCodeChange: (
    value: string
  ) => void;
  onPhoneChange: (
    value: string
  ) => void;
  placeholder: string;
}) {
  return (
    <div
      className="
        grid
        grid-cols-[57px_minmax(0,1fr)]
        gap-[7px]
      "
    >
      <div className="relative">
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
            text-[10px]
            font-semibold
            text-[#253970]
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
          size={9}
          className="
            pointer-events-none
            absolute
            right-[6px]
            top-1/2
            -translate-y-1/2
            text-[#253970]
          "
        />
      </div>

      <input
        value={phone}
        onChange={(event) =>
          onPhoneChange(
            event.target.value.replace(
              /[^\d]/g,
              ""
            )
          )
        }
        placeholder={placeholder}
        className={inputClass}
      />
    </div>
  );
}

/* ============================================================
   MULTI SELECT
============================================================ */

function MultiSelect({
  label,
  placeholder,
  values,
  options,
  onToggle,
}: {
  label: string;
  placeholder: string;
  values: string[];
  options: string[];
  onToggle: (
    value: string
  ) => void;
}) {
  const [open, setOpen] =
    useState(false);

  const display =
    values.length === 0
      ? placeholder
      : values.length === 1
        ? values[0]
        : `${values.length} selected`;

  return (
    <div
      className="
        relative
        min-w-0
      "
    >
      <p
        className="
          mb-[6px]
          text-[10px]
          font-semibold
          text-[#192A65]
        "
      >
        {label}
      </p>

      <button
        type="button"
        onClick={() =>
          setOpen((value) => !value)
        }
        className="
          flex
          h-[34px]
          w-full
          items-center
          justify-between
          gap-[7px]
          rounded-[5px]
          border
          border-[#DFE4EA]
          bg-white
          px-[10px]
          text-[10px]
          font-semibold
          text-[#253970]
        "
      >
        <span className="truncate">
          {display}
        </span>

        <ChevronDown
          size={10}
          className="shrink-0"
        />
      </button>

      {open && (
        <div
          className="
            absolute
            left-0
            top-[53px]
            z-50
            max-h-[180px]
            w-full
            overflow-y-auto
            rounded-[6px]
            border
            border-[#DFE4EA]
            bg-white
            p-[5px]
            shadow-lg
          "
        >
          {options.map(
            (option) => {
              const checked =
                values.includes(
                  option
                );

              return (
                <button
                  key={option}
                  type="button"
                  onClick={() =>
                    onToggle(option)
                  }
                  className="
                    flex
                    w-full
                    items-center
                    gap-[7px]
                    rounded-[4px]
                    px-[7px]
                    py-[6px]
                    text-left
                    text-[10px]
                    font-semibold
                    text-[#273A70]
                    hover:bg-[#F5F8F6]
                  "
                >
                  <span
                    className={`
                      flex
                      h-[13px]
                      w-[13px]
                      shrink-0
                      items-center
                      justify-center
                      rounded-[3px]
                      border

                      ${checked
                        ? "border-[#168348] bg-[#168348]"
                        : "border-[#CBD2DA] bg-white"
                      }
                    `}
                  >
                    {checked && (
                      <Check
                        size={8}
                        strokeWidth={3}
                        className="text-white"
                      />
                    )}
                  </span>

                  {option}
                </button>
              );
            }
          )}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   CONSENT
============================================================ */

function ConsentRow({
  checked,
  onChange,
  children,
}: {
  checked: boolean;
  onChange: (
    value: boolean
  ) => void;
  children: ReactNode;
}) {
  return (
    <label
      className="
        flex
        cursor-pointer
        items-start
        gap-[9px]
      "
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) =>
          onChange(
            event.target.checked
          )
        }
        className="
          mt-[1px]
          h-[13px]
          w-[13px]
          shrink-0
          accent-[#087941]
        "
      />

      <span
        className="
          text-[10px]
          font-semibold
          leading-[14px]
          text-[#334677]
        "
      >
        {children}
      </span>
    </label>
  );
}

/* ============================================================
   SIDEBAR
============================================================ */

function SidebarCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`
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
    </div>
  );
}

/* ============================================================
   TIP
============================================================ */

function TipRow({
  text,
}: {
  text: string;
}) {
  return (
    <div
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
          h-[12px]
          w-[12px]
          shrink-0
          items-center
          justify-center
          rounded-full
          border
          border-[#53A975]
          text-[#318754]
        "
      >
        <Check
          size={7}
          strokeWidth={3}
        />
      </div>

      <p
        className="
          text-[7.5px]
          font-semibold
          leading-[11px]
          text-[#445379]
        "
      >
        {text}
      </p>
    </div>
  );
}

/* ============================================================
   GUIDE ROW
============================================================ */

function GuideRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      className="
        grid
        grid-cols-[70px_minmax(0,1fr)]
        gap-[6px]
      "
    >
      <span
        className="
          text-[7.5px]
          font-semibold
          text-[#273A70]
        "
      >
        {label}
      </span>

      <span
        className="
          text-[7.5px]
          font-semibold
          text-[#4D5B7E]
        "
      >
        {value}
      </span>
    </div>
  );
}