// ServiceCategory/Service/Pandit/Driver/Booking types were the paid-booking model and no longer
// exist on the backend. The PRD's Case/Volunteer domain (M2/M3) replaces them.

export type PaymentGatewayStatus = "created" | "paid" | "failed" | "refunded";
export type EnquiryStatus = "new" | "contacted" | "closed";
export type DonationCause = "general" | "cremation" | "ambulance" | "annadan";
export type DonationFrequency = "once" | "monthly";

export interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  coverImage?: string;
  author: string;
  tags: string[];
  isPublished: boolean;
  publishedAt?: string;
  createdAt: string;
}

export interface GalleryItem {
  _id: string;
  type: "image" | "video";
  url: string;
  thumbnailUrl?: string;
  caption?: string;
  category?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Testimonial {
  _id: string;
  name: string;
  photo?: string;
  message: string;
  rating: number;
  isApproved: boolean;
  createdAt: string;
}

export interface Faq {
  _id: string;
  question: string;
  answer: string;
  category?: string;
  order: number;
  isActive: boolean;
  createdAt: string;
}

export interface Enquiry {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  message: string;
  category: "contact" | "csr" | "partnership" | "unclaimed_body";
  organization?: string;
  designation?: string;
  interest?: string;
  city?: string;
  authority?: string;
  reference?: string;
  documentUrl?: string;
  status: EnquiryStatus;
  createdAt: string;
}

export interface NewsletterSubscriber {
  _id: string;
  email: string;
  source?: string;
  createdAt: string;
}

export interface Customer {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  isPhoneVerified: boolean;
  isEmailVerified: boolean;
  addresses: { line1: string; city: string; state: string; pincode: string }[];
  createdAt: string;
}

export type NewDonationType = "ONE_TIME" | "RECURRING" | "OFFLINE";
export type NewDonationStatus = "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED" | "CANCELLED";
export type CampaignStatus = "DRAFT" | "ACTIVE" | "PAUSED" | "COMPLETED" | "ARCHIVED";

export interface DonorInfo {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  pan?: string;
  totalDonated: number;
}

export interface Donation {
  _id: string;
  donorId: string;
  donor: DonorInfo | null;
  campaignId?: string;
  cause: DonationCause;
  type: NewDonationType;
  amount: number;
  status: NewDonationStatus;
  isAnonymous: boolean;
  dedication?: string;
  receiptId?: string;
  createdAt: string;
}

export interface DonationSummary {
  totalRaised: number;
  totalDonations: number;
}

export interface Campaign {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  coverImage?: string;
  cause: DonationCause;
  goalAmount?: number;
  raisedAmount: number;
  status: CampaignStatus;
  startDate?: string;
  endDate?: string;
  createdAt: string;
}

// ============================================================================
// PRD domain (M2 — Case core)
// ============================================================================

export type RequestType = "NORMAL" | "EMERGENCY";
export type AssistanceRequestStatus = "SUBMITTED" | "CONVERTED" | "REJECTED";

export interface AssistanceRequest {
  _id: string;
  requestNo: string;
  type: RequestType;
  source: "WEBSITE" | "HELPLINE" | "PARTNER" | "WALK_IN";
  requester: { name: string; phone: string; altPhone?: string; email?: string; relation: string };
  deceased: { name: string; age?: number; gender?: string; dateOfDeath?: string };
  location: { address: string; area?: string; city: string; state: string; pincode: string };
  cremationPreference?: "WOOD" | "ELECTRIC" | "AS_AVAILABLE";
  notes?: string;
  status: AssistanceRequestStatus;
  duplicateOfRequestId?: string;
  duplicateNote?: string;
  createdAt: string;
}

export type CaseStatus =
  | "NEW"
  | "UNDER_VERIFICATION"
  | "APPROVED"
  | "VOLUNTEER_ASSIGNED"
  | "TRANSPORT_ARRANGED"
  | "CREMATION_IN_PROGRESS"
  | "CREMATION_COMPLETED"
  | "DOCS_UPLOADED"
  | "CLOSED"
  | "REJECTED"
  | "CANCELLED";

export type CasePriority = "LOW" | "NORMAL" | "HIGH" | "CRITICAL";
export type VerificationStatus = "PENDING" | "VERIFIED" | "REJECTED";
export type DocumentType =
  | "DEATH_CERTIFICATE"
  | "ID_PROOF"
  | "ADDRESS_PROOF"
  | "CREMATION_PROOF"
  | "CONSENT_FORM"
  | "BILL"
  | "OTHER";
export type ExpenseStatus = "SUBMITTED" | "APPROVED" | "REJECTED" | "REVERSED";
export type PaymentMode = "UPI" | "CARD" | "NETBANKING" | "WALLET" | "CASH" | "CHEQUE" | "BANK_TRANSFER";
export type VolunteerStatus = "ACTIVE" | "INACTIVE" | "BLACKLISTED";
export type VolunteerAvailability = "AVAILABLE" | "BUSY" | "UNAVAILABLE";
export type AssignmentRole = "PRIMARY" | "SUPPORT" | "DRIVER";
export type AssignmentStatus = "ASSIGNED" | "ACCEPTED" | "DECLINED" | "COMPLETED" | "WITHDRAWN";

export type VolunteerGender = "Male" | "Female" | "Other";
export type VolunteerBloodGroup = "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
export type VolunteerSchedulePreference = "Weekdays" | "Weekends" | "Evenings" | "Emergency Support" | "Flexible";
export type VolunteerPreferredRole = "Field Volunteer" | "Transport Support" | "Documentation" | "Family Coordination" | "Ritual Assistance";

export interface VolunteerSummary {
  _id: string;
  userId: string;
  name?: string;
  phone?: string;
  email?: string;
  city: string;
  skills: string[];
  status: VolunteerStatus;
  availability: VolunteerAvailability;
  totalAssignments: number;
  dateOfBirth?: string;
  gender?: VolunteerGender;
  bloodGroup?: VolunteerBloodGroup;
  address?: string;
  state?: string;
  pincode?: string;
  motivation?: string;
  experience?: string;
  schedulePreference?: VolunteerSchedulePreference;
  preferredRole?: VolunteerPreferredRole;
  whatsappPhone?: string;
  occupation?: string;
  organisation?: string;
  volunteerAreas: string[];
  availabilityDays: string[];
  preferredTimes: string[];
  emergencyOnCall?: boolean;
  canParticipateFieldCases?: boolean;
  ownVehicle?: boolean;
  languagesKnown?: string;
  hoursPerWeek?: string;
  volunteeredBefore?: boolean;
  previousOrganisationRole?: string;
  emergencyContact?: { name?: string; relationship?: string; phone?: string };
  idProofType?: string;
  idProofNumber?: string;
  declarationAccepted?: boolean;
  photographUrl?: string;
  idProofUrl?: string;
  code?: string;
  verified: boolean;
  assignedRole?: string;
  assignedArea?: string;
  approvedByName?: string;
  joiningDate?: string;
  createdAt: string;
}

export interface CaseVolunteerAssignment {
  _id: string;
  volunteerId: string;
  volunteerName?: string;
  volunteerPhone?: string;
  role: AssignmentRole;
  status: AssignmentStatus;
  note?: string;
  createdAt: string;
}

export interface CaseSummary {
  _id: string;
  caseId: string;
  requestId: string;
  status: CaseStatus;
  priority: CasePriority;
  caseManagerId?: string;
  city: string;
  totalExpense: number;
  documentCount: number;
  createdAt: string;
  request: AssistanceRequest | null;
}

export interface CaseTimelineEntry {
  _id: string;
  event: string;
  fromStatus?: string;
  toStatus?: string;
  note?: string;
  byUserId?: string;
  visibility: "INTERNAL" | "FAMILY";
  at: string;
}

export interface CaseDocumentItem {
  _id: string;
  docType: DocumentType;
  url: string;
  fileName: string;
  isProof: boolean;
  createdAt: string;
}

export interface CaseExpenseItem {
  _id: string;
  category: string;
  amount: number;
  expenseDate: string;
  paymentMode: PaymentMode;
  payeeName?: string;
  status: ExpenseStatus;
  submittedBy: string;
  approvalRemark?: string;
  createdAt: string;
}

export interface CaseDetail extends CaseSummary {
  verification?: { outcome: VerificationStatus; method: string; note: string; at: string };
  timeline: CaseTimelineEntry[];
  documents: CaseDocumentItem[];
  expenses: CaseExpenseItem[];
  assignments: CaseVolunteerAssignment[];
}

export type ExternalServiceCategory =
  | "DOMAIN"
  | "HOSTING"
  | "SSL_CERTIFICATE"
  | "PAYMENT_GATEWAY"
  | "EMAIL_SMTP"
  | "SMS_WHATSAPP"
  | "MEDIA_STORAGE"
  | "AI_API"
  | "ANALYTICS"
  | "DATABASE"
  | "CDN"
  | "SOFTWARE_LICENSE"
  | "SOCIAL_MEDIA"
  | "API_SERVICE"
  | "OTHER";

export type ExternalServiceBillingCycle = "ONE_TIME" | "MONTHLY" | "YEARLY";

export interface ExternalServiceReceipt {
  url: string;
  label?: string;
  uploadedAt: string;
}

export interface ExternalService {
  _id: string;
  category: ExternalServiceCategory;
  name: string;
  provider?: string;
  accountIdentifier?: string;
  loginUrl?: string;
  secretLabel?: string;
  secretValue?: string;
  startDate?: string;
  expiryDate: string;
  autoRenews?: boolean;
  notes?: string;
  details?: Record<string, string>;
  popupReminderDays?: number;
  emailReminderDays?: number;
  notifyEmails?: string[];
  remindersEnabled: boolean;
  pricingType: "FREE" | "PAID";
  costAmount?: number;
  currency?: string;
  billingCycle?: ExternalServiceBillingCycle;
  receipts: ExternalServiceReceipt[];
  createdAt: string;
  updatedAt: string;
}

export interface Settings {
  _id: string;
  siteName: string;
  helplineNumber: string;
  whatsappNumber?: string;
  supportEmail?: string;
  address?: string;
  organisation?: {
    legalName?: string;
    panNumber?: string;
    exemptionRef?: string;
    registeredAddress?: string;
  };
  notifications?: {
    quietHoursStart?: string;
    quietHoursEnd?: string;
  };
  systemAlerts?: {
    popupReminderDays: number;
    emailReminderDays: number;
    notifyEmails: string[];
  };
  advancedSeo?: {
    globalHeadCode?: string;
    globalBodyCode?: string;
    defaultOgImage?: string;
    googleSearchConsoleVerification?: string;
    robotsTxt?: string;
    ga4MeasurementId?: string;
    gtmContainerId?: string;
  };
  banners: { image: string; link?: string; title?: string }[];
  socialLinks: { platform: string; url: string }[];
  landingPage?: {
    seo?: any;
    sections: {
      key: string;
      name: string;
      enabled: boolean;
      eyebrow?: string;
      title?: string;
      subtitle?: string;
      description?: string;
      image?: string;
      buttonLabel?: string;
      buttonHref?: string;
      secondaryButtonLabel?: string;
      secondaryButtonHref?: string;
      tertiaryButtonLabel?: string;
      tertiaryButtonHref?: string;
      logoImage?: string;
      partnerLogoImage?: string;
      secondaryLogoImage?: string;
      secondaryImage?: string;
      quote?: string;
      legalNotice?: string;
      lowerTitle?: string;
      lowerDescription?: string;
      bottomStatement?: string;
      secondaryTitle?: string;
      secondaryDescription?: string;
      supportTitle?: string;
      supportDescription?: string;
      regionTitle?: string;
      regionDescription?: string;
      phoneLabel?: string;
      phoneNumber?: string;
      contactEmail?: string;
      contactAddress?: string;
      availabilityText?: string;
      actionTitle?: string;
      requestTitle?: string;
      requestDescription?: string;
      inputPlaceholder?: string;
      submitLabel?: string;
      submittedLabel?: string;
      successMessage?: string;
      initiativeLabel?: string;
      quickLinksTitle?: string;
      servicesTitle?: string;
      initiativesTitle?: string;
      contactTitle?: string;
      sloganTitle?: string;
      immediateHelpTitle?: string;
      immediateHelpDescription?: string;
      supportNowLabel?: string;
      supportMissionTitle?: string;
      supportMissionDescription?: string;
      items?: {
        title?: string;
        label?: string;
        value?: string;
        description?: string;
        image?: string;
        href?: string;
        features?: string[];
      }[];
    }[];
  };
  aboutPage?: Settings["landingPage"];
  servicesPage?: Settings["landingPage"];
  ambulancePage?: Settings["landingPage"];
  panditPage?: Settings["landingPage"];
  funeralPage?: Settings["landingPage"];
  funeralDecorationPage?: Settings["landingPage"];
  prayerHallPage?: Settings["landingPage"];
  specialServicePage?: Settings["landingPage"];
  callingRelativesPage?: Settings["landingPage"];
  harsevanPage?: Settings["landingPage"];
  unclaimedBodyPage?: Settings["landingPage"];
  volunteerPage?: Settings["landingPage"];
  partnershipPage?: Settings["landingPage"];
  csrPage?: Settings["landingPage"];
  requestHelpPage?: Settings["landingPage"];
  donationPage?: Settings["landingPage"];
  contactPage?: Settings["landingPage"];
  trackPage?: Settings["landingPage"];
  privacyPage?: Settings["landingPage"];
  termsPage?: Settings["landingPage"];
  refundPage?: Settings["landingPage"];
  conductPage?: Settings["landingPage"];
}

export type VehicleType = "HEARSE" | "AMBULANCE" | "VAN" | "OTHER";

export interface Vehicle {
  _id: string;
  type: VehicleType;
  registrationNumber: string;
  capacity?: number;
  driverName?: string;
  driverPhone?: string;
  isActive: boolean;
  notes?: string;
  createdAt: string;
}

export type ServiceProviderCategory = "PRIEST" | "CATERING" | "AMBULANCE_SERVICE" | "FLORIST" | "OTHER";

export interface ServiceProvider {
  _id: string;
  name: string;
  category: ServiceProviderCategory;
  contactPerson?: string;
  contactPhone: string;
  address?: string;
  isActive: boolean;
  notes?: string;
  createdAt: string;
}

export interface ExpenseCategory {
  _id: string;
  name: string;
  isActive: boolean;
  notes?: string;
  createdAt: string;
}

export type PartnerType = "NGO" | "HOSPITAL" | "MUNICIPAL" | "CORPORATE_CSR" | "CREMATION_GROUND" | "OTHER";
export type PartnerStatus = "LEAD" | "ACTIVE" | "EXPIRED" | "INACTIVE";

export interface Partner {
  _id: string;
  name: string;
  type: PartnerType;
  status: PartnerStatus;
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
  address?: string;
  agreementDetails?: string;
  notes?: string;
  createdAt: string;
}

export interface Permission {
  _id: string;
  module: string;
  action: string;
  key: string;
  label: string;
}

export interface Role {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  permissionIds: string[];
  permissions: Permission[];
  isSystem: boolean;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
}

export type StaffStatus = "ACTIVE" | "INACTIVE" | "LOCKED";

export interface StaffMember {
  _id: string;
  name: string;
  email?: string;
  phone: string;
  employeeId?: string;
  avatarUrl?: string;
  roleId?: string;
  roleName?: string;
  status: StaffStatus;
  isEmailVerified: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

export interface AuditLogEntry {
  _id: string;
  userId?: string;
  actorName: string;
  action: string;
  entityType: string;
  entityId?: string;
  before?: unknown;
  after?: unknown;
  at: string;
}
