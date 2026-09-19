"use client";

import { useEffect, useRef, useState } from "react";
import {
  Sparkles,
  Send,
  Bot,
  User,
  Copy,
  Check,
  Printer,
  Trash2,
  SlidersHorizontal,
  RefreshCw,
  FileText,
  Building2,
  Briefcase,
  MapPin,
  Clock,
  DollarSign,
  ChevronRight,
  Download,
  Share2,
  Zap,
  HelpCircle,
  PlusCircle,
  X,
  Wand2,
  Paperclip,
  Image as ImageIcon,
  FileUp,
  File,
} from "lucide-react";

interface AttachedFile {
  id: string;
  file: File;
  name: string;
  size: string;
  mimeType: string;
  base64?: string;
  text?: string;
  previewUrl?: string;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  attachments?: Array<{ name: string; mimeType: string }>;
}

const PRESET_ROLES = [
  {
    title: "Senior Fullstack Developer (Next.js & Node.js)",
    dept: "Engineering / Technology",
    exp: "4-7 Years",
    location: "New Delhi (Hybrid)",
    skills: "React, Next.js 15, TypeScript, Node.js, Express, MongoDB, Tailwind CSS",
  },
  {
    title: "Organic Product Sourcing Manager",
    dept: "Supply Chain & Operations",
    exp: "3-5 Years",
    location: "On-site / Field Ops",
    skills: "Organic Certification Standards, Farmer Relations, Quality Audit, Agri Tech",
  },
  {
    title: "Digital Marketing & SEO Lead",
    dept: "Marketing & Communications",
    exp: "3-6 Years",
    location: "New Delhi / Remote",
    skills: "Organic Growth, Google Ads, SEO, Content Strategy, Meta Campaigns, Analytics",
  },
  {
    title: "Expo Sponsorship & Sales Manager",
    dept: "Business Development",
    exp: "5-8 Years",
    location: "New Delhi",
    skills: "B2B Sales, Corporate Sponsorships, Event Expo Pitching, Client Management",
  },
  {
    title: "HR & Talent Acquisition Specialist",
    dept: "Human Resources",
    exp: "2-4 Years",
    location: "New Delhi",
    skills: "IT & Non-IT Hiring, Candidate Screening, Onboarding, Payroll, Performance Management",
  },
];

const REFINE_PROMPTS = [
  "✨ Add 5 Key KPIs / Measurable Goals",
  "💼 Include Salary Range ₹10 LPA - ₹18 LPA with Perks",
  "📍 Make position 100% Remote-friendly",
  "🎯 Add Candidate Screening Interview Questions",
  "⚡ Make tone more energetic & startup-focused",
];

export default function AiJdCreatorPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-1",
      role: "assistant",
      content: `### 👋 Namaste! Welcome to **Bharat Organic Expo AI JD Creator**

I am your AI Recruiter & Job Description Architect powered by **Google Gemini AI**.

I can help you build executive-ready, highly tailored Job Descriptions for any role in **Fullstack Engineering, Organic Farming Ops, Marketing, Sales, or Administration**.

**How would you like to start?**
* 1️⃣ Type your requirements or **Upload DOC / PDF / Image files** 📎 in the chat below
* 2️⃣ Click **Quick Form Generator** above to fill in role details
* 3️⃣ Select one of the preset templates from the left sidebar!`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);

  // Form Modal state
  const [formTitle, setFormTitle] = useState("");
  const [formDept, setFormDept] = useState("Technology / IT");
  const [formExp, setFormExp] = useState("3-5 Years");
  const [formLocation, setFormLocation] = useState("New Delhi (Hybrid)");
  const [formType, setFormType] = useState("Full-time");
  const [formSkills, setFormSkills] = useState("");
  const [formNotes, setFormNotes] = useState("");

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Handle file upload selection
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    for (const file of files) {
      const sizeStr = file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`;

      const newAtt: AttachedFile = {
        id: `att-${Date.now()}-${Math.random()}`,
        file,
        name: file.name,
        size: sizeStr,
        mimeType: file.type || "application/octet-stream",
      };

      if (file.type.startsWith("image/")) {
        const previewUrl = URL.createObjectURL(file);
        newAtt.previewUrl = previewUrl;

        // Convert image to base64
        const base64 = await readFileAsBase64(file);
        newAtt.base64 = base64;
      } else {
        // Read text content for doc/txt/pdf
        try {
          const text = await readFileAsText(file);
          newAtt.text = text;
        } catch {
          const base64 = await readFileAsBase64(file);
          newAtt.base64 = base64;
        }
      }

      setAttachedFiles((prev) => [...prev, newAtt]);
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsText(file);
    });
  };

  const removeAttachment = (id: string) => {
    setAttachedFiles((prev) => prev.filter((a) => a.id !== id));
  };

  // Handle send message
  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputPrompt.trim();
    if ((!textToSend && attachedFiles.length === 0) || isLoading) return;

    const currentAttachments = [...attachedFiles];
    const userMessageContent = textToSend || `Please generate a detailed Job Description based on the attached document(s): ${currentAttachments.map(a => a.name).join(", ")}`;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: userMessageContent,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      attachments: currentAttachments.map((a) => ({ name: a.name, mimeType: a.mimeType })),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!customPrompt) setInputPrompt("");
    setAttachedFiles([]);
    setIsLoading(true);

    try {
      const historyPayload = messages
        .filter((m) => m.id !== "welcome-1")
        .map((m) => ({ role: m.role, content: m.content }));

      const attachmentPayload = currentAttachments.map((att) => ({
        name: att.name,
        mimeType: att.mimeType,
        base64: att.base64,
        text: att.text,
      }));

      const res = await fetch("/api/jd-creator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: historyPayload,
          prompt: userMessageContent,
          attachments: attachmentPayload,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to generate Job Description");
      }

      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err: any) {
      console.error("AI Generation Error:", err);
      const errorMessage: ChatMessage = {
        id: `ai-err-${Date.now()}`,
        role: "assistant",
        content: `❌ **Generation Error**: ${err.message || "Something went wrong while contacting Gemini AI."}\n\nPlease verify your API key or try again in a moment.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Submit from Quick Form Modal
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    setShowFormModal(false);
    const generatedPrompt = `Generate a detailed Job Description for:
- **Title**: ${formTitle}
- **Department**: ${formDept}
- **Experience**: ${formExp}
- **Location**: ${formLocation}
- **Type**: ${formType}
- **Required Skills**: ${formSkills || "Relevant industry expertise"}
- **Special Requirements**: ${formNotes || "Ready for publication"}`;

    handleSend(generatedPrompt);
  };

  // Load preset template
  const handleSelectPreset = (preset: typeof PRESET_ROLES[0]) => {
    setFormTitle(preset.title);
    setFormDept(preset.dept);
    setFormExp(preset.exp);
    setFormLocation(preset.location);
    setFormSkills(preset.skills);

    const promptText = `Generate a high-converting Job Description for **${preset.title}** (${preset.dept}). Location: ${preset.location}, Experience: ${preset.exp}. Key Skills: ${preset.skills}.`;
    handleSend(promptText);
  };

  // Copy to clipboard
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Print JD
  const handlePrint = (content: string) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Job Description - Bharat Organic Expo</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1e293b; line-height: 1.6; }
            h1, h2, h3 { color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #16a34a; padding-bottom: 20px; }
            .logo { font-size: 24px; font-weight: bold; color: #15803d; }
            .subtitle { color: #64748b; font-size: 14px; margin-top: 4px; }
            ul { padding-left: 20px; }
            li { margin-bottom: 6px; }
            .footer { margin-top: 50px; font-size: 12px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 15px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">🌿 BHARAT ORGANIC EXPO</div>
            <div class="subtitle">Official Job Description & Candidate Specification</div>
          </div>
          <div class="content">${formatMarkdownForPrint(content)}</div>
          <div class="footer">
            Generated via Bharat Organic Expo Admin AI Engine on ${new Date().toLocaleDateString()}
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Simple Markdown formatting helper for UI
  const renderFormattedMarkdown = (text: string) => {
    const lines = text.split("\n");
    return (
      <div className="space-y-2 text-[13px] leading-[1.65]">
        {lines.map((line, idx) => {
          if (line.startsWith("### ")) {
            return (
              <h3 key={idx} className="mt-3 text-[15px] font-bold tracking-tight text-slate-900 border-b border-slate-200/60 pb-1 flex items-center gap-2">
                {line.replace("### ", "")}
              </h3>
            );
          }
          if (line.startsWith("## ")) {
            return (
              <h2 key={idx} className="mt-4 text-[16px] font-extrabold tracking-tight text-[#165a2d] border-b-2 border-emerald-500/30 pb-1.5 flex items-center gap-2">
                {line.replace("## ", "")}
              </h2>
            );
          }
          if (line.startsWith("# ")) {
            return (
              <h1 key={idx} className="mt-4 text-[18px] font-black tracking-tight text-[#0f2918] border-b-2 border-emerald-600 pb-2">
                {line.replace("# ", "")}
              </h1>
            );
          }
          if (line.trim().startsWith("* ") || line.trim().startsWith("- ")) {
            const content = line.trim().replace(/^[\*\-]\s*/, "");
            return (
              <div key={idx} className="flex items-start gap-2 pl-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-600" />
                <span dangerouslySetInnerHTML={{ __html: parseBoldText(content) }} />
              </div>
            );
          }
          if (line.trim().startsWith("1.") || line.trim().startsWith("2.") || line.trim().startsWith("3.") || line.trim().startsWith("4.") || line.trim().startsWith("5.") || line.trim().startsWith("6.") || line.trim().startsWith("7.")) {
            return (
              <div key={idx} className="flex items-start gap-2 pl-1 font-medium text-slate-800">
                <span dangerouslySetInnerHTML={{ __html: parseBoldText(line) }} />
              </div>
            );
          }
          if (!line.trim()) {
            return <div key={idx} className="h-1.5" />;
          }
          return (
            <p key={idx} dangerouslySetInnerHTML={{ __html: parseBoldText(line) }} />
          );
        })}
      </div>
    );
  };

  const parseBoldText = (str: string) => {
    return str
      .replace(/\*\*(.*?)\*\*/g, "<strong class='font-bold text-slate-900'>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em class='italic'>$1</em>")
      .replace(/`([^`]+)`/g, "<code class='bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded text-[11px] font-mono border border-emerald-200'>$1</code>");
  };

  function formatMarkdownForPrint(str: string) {
    return str
      .replace(/### (.*)/g, "<h3>$1</h3>")
      .replace(/## (.*)/g, "<h2>$1</h2>")
      .replace(/# (.*)/g, "<h1>$1</h1>")
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/[\*\-]\s*(.*)/g, "<li>$1</li>")
      .replace(/\n/g, "<br/>");
  }

  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-slate-50/70 text-slate-900">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.webp"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* =========================================================
          TOP BAR / HEADER
      ========================================================= */}
      <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-5 py-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-green-500 text-white shadow-md shadow-emerald-600/20">
            <Sparkles className="h-5 w-5 animate-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-slate-900">
                AI Job Description (JD) Creator
              </h1>
              <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-emerald-500/10 to-teal-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 ring-1 ring-emerald-600/20">
                <Zap className="h-3 w-3 text-emerald-600" />
                Gemini 2.5 Multimodal AI
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-500">
              Upload DOC / PDF / Image or type requirements to generate JDs in seconds
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 text-[11px] font-bold text-slate-700 hover:bg-slate-100 transition active:scale-95 cursor-pointer"
          >
            <Paperclip className="h-3.5 w-3.5 text-emerald-600" />
            Attach DOC / PDF / Image
          </button>

          <button
            onClick={() => setShowFormModal(true)}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-emerald-700 px-3 text-[11px] font-bold text-white shadow-xs hover:bg-emerald-800 transition active:scale-95 cursor-pointer"
          >
            <Wand2 className="h-3.5 w-3.5" />
            Quick Form Generator
          </button>

          <button
            onClick={() => setMessages([messages[0]])}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-[11px] font-semibold text-slate-600 hover:bg-slate-50 transition hover:text-slate-900"
            title="Clear Chat History"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear Chat
          </button>
        </div>
      </div>

      {/* =========================================================
          MAIN WORKSPACE (SPLIT VIEW)
      ========================================================= */}
      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[280px_1fr] overflow-hidden">
        {/* LEFT SIDEBAR: PRESETS & RECENT ROLE TEMPLATES */}
        <div className="hidden lg:flex flex-col border-r border-slate-200/80 bg-white p-4 overflow-y-auto">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
              Preset Role Templates
            </span>
            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">
              {PRESET_ROLES.length}
            </span>
          </div>

          <div className="space-y-2">
            {PRESET_ROLES.map((preset, idx) => (
              <div
                key={idx}
                onClick={() => handleSelectPreset(preset)}
                className="group cursor-pointer rounded-xl border border-slate-200/80 bg-slate-50/50 p-3 transition-all hover:border-emerald-500/50 hover:bg-emerald-50/40 hover:shadow-xs"
              >
                <div className="flex items-start justify-between gap-1">
                  <h4 className="text-[12px] font-bold text-slate-800 group-hover:text-emerald-900 leading-snug">
                    {preset.title}
                  </h4>
                  <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-400 group-hover:text-emerald-600 transition-transform group-hover:translate-x-0.5" />
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-1.5 py-0.5 text-[9.5px] font-semibold text-slate-600">
                    <Briefcase className="h-2.5 w-2.5 text-slate-500" />
                    {preset.dept.split("/")[0]}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded bg-emerald-100/60 px-1.5 py-0.5 text-[9.5px] font-bold text-emerald-800">
                    <Clock className="h-2.5 w-2.5 text-emerald-700" />
                    {preset.exp}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-xl border border-emerald-200/80 bg-gradient-to-b from-emerald-50/80 to-teal-50/50 p-3.5">
            <div className="flex items-center gap-2 text-[12px] font-bold text-emerald-900">
              <Sparkles className="h-4 w-4 text-emerald-600" />
              Multimodal File Support
            </div>
            <p className="mt-1.5 text-[11px] leading-relaxed text-emerald-800/80">
              You can upload <strong>PDFs, Word DOCs, Text files, or Images</strong> directly into the chat to auto-extract role responsibilities!
            </p>
          </div>
        </div>

        {/* RIGHT AREA: CHAT WORKSPACE */}
        <div className="flex min-h-0 flex-col bg-slate-50/50 overflow-hidden">
          {/* MESSAGES SCROLL CONTAINER */}
          <div className="min-h-0 flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start gap-3 max-w-4xl ${
                  msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                }`}
              >
                {/* AVATAR */}
                <div
                  className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl font-bold shadow-xs ${
                    msg.role === "user"
                      ? "bg-slate-900 text-white"
                      : "bg-gradient-to-tr from-emerald-600 to-teal-600 text-white"
                  }`}
                >
                  {msg.role === "user" ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Bot className="h-4.5 w-4.5" />
                  )}
                </div>

                {/* BUBBLE CONTENT */}
                <div
                  className={`group relative flex flex-col rounded-2xl p-4 md:p-5 shadow-xs transition-all ${
                    msg.role === "user"
                      ? "bg-slate-900 text-white rounded-tr-none max-w-xl"
                      : "bg-white text-slate-800 border border-slate-200/80 rounded-tl-none max-w-3xl"
                  }`}
                >
                  {/* USER ROLE HEADER */}
                  <div className="mb-2 flex items-center justify-between border-b border-slate-200/40 pb-1.5 text-[10px] font-semibold text-slate-400">
                    <span>{msg.role === "user" ? "You (Admin)" : "Gemini AI Architect"}</span>
                    <span>{msg.timestamp}</span>
                  </div>

                  {/* USER ATTACHMENTS PREVIEW IN CHAT */}
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="mb-2.5 flex flex-wrap gap-1.5">
                      {msg.attachments.map((att, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800/90 px-2.5 py-1 text-[10.5px] font-medium text-emerald-300 ring-1 ring-emerald-500/30"
                        >
                          {att.mimeType.startsWith("image/") ? (
                            <ImageIcon className="h-3.5 w-3.5 text-emerald-400" />
                          ) : (
                            <FileText className="h-3.5 w-3.5 text-emerald-400" />
                          )}
                          {att.name}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* BODY */}
                  {msg.role === "user" ? (
                    <p className="whitespace-pre-wrap text-[13px] leading-relaxed">
                      {msg.content}
                    </p>
                  ) : (
                    renderFormattedMarkdown(msg.content)
                  )}

                  {/* ACTION BAR FOR AI MESSAGES */}
                  {msg.role === "assistant" && msg.id !== "welcome-1" && (
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleCopy(msg.content, msg.id)}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10.5px] font-semibold text-slate-700 hover:bg-slate-100 transition active:scale-95"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="h-3 w-3 text-emerald-600" />
                              <span className="text-emerald-700">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3 text-slate-500" />
                              Copy Ready JD
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => handlePrint(msg.content)}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10.5px] font-semibold text-slate-700 hover:bg-slate-100 transition active:scale-95"
                        >
                          <Printer className="h-3 w-3 text-slate-500" />
                          Print / Export PDF
                        </button>
                      </div>

                      <span className="text-[9.5px] font-medium text-slate-400">
                        Organic Expo Certified JD Format
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* LOADING SPINNER BUBBLE */}
            {isLoading && (
              <div className="flex items-start gap-3 mr-auto max-w-xl">
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white animate-bounce">
                  <Bot className="h-4.5 w-4.5" />
                </div>
                <div className="rounded-2xl rounded-tl-none border border-emerald-200 bg-white p-4 shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="flex space-x-1">
                      <div className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
                      <div className="h-2 w-2 rounded-full bg-teal-600 animate-pulse [animation-delay:0.2s]" />
                      <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse [animation-delay:0.4s]" />
                    </div>
                    <span className="text-[12px] font-semibold text-emerald-800">
                      Gemini AI is analyzing attachments & crafting your Job Description...
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* REFINE PROMPTS SUGGESTIONS BAR */}
          {messages.length > 1 && !isLoading && (
            <div className="shrink-0 px-4 md:px-6 pt-1 pb-2 overflow-x-auto [scrollbar-width:none]">
              <div className="flex items-center gap-2 min-w-max">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Quick Refinement:
                </span>
                {REFINE_PROMPTS.map((promptText, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(promptText)}
                    className="inline-flex items-center gap-1 rounded-full border border-emerald-200/80 bg-white px-3 py-1 text-[10.5px] font-medium text-emerald-800 shadow-2xs hover:bg-emerald-50 hover:border-emerald-300 transition active:scale-95"
                  >
                    {promptText}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* INPUT BAR */}
          <div className="shrink-0 border-t border-slate-200 bg-white p-3 md:p-4 shadow-lg">
            {/* ATTACHMENTS PREVIEW BAR ABOVE TEXTAREA */}
            {attachedFiles.length > 0 && (
              <div className="mb-2.5 flex flex-wrap gap-2 rounded-xl border border-emerald-200/80 bg-emerald-50/40 p-2">
                {attachedFiles.map((att) => (
                  <div
                    key={att.id}
                    className="relative flex items-center gap-2 rounded-lg bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-800 shadow-xs border border-slate-200"
                  >
                    {att.previewUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={att.previewUrl} alt="" className="h-6 w-6 rounded object-cover" />
                    ) : att.mimeType.startsWith("image/") ? (
                      <ImageIcon className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <FileText className="h-4 w-4 text-blue-600" />
                    )}

                    <div className="flex flex-col">
                      <span className="max-w-[140px] truncate text-[11px] font-bold">{att.name}</span>
                      <span className="text-[9px] text-slate-400">{att.size}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeAttachment(att.id)}
                      className="ml-1 rounded-full p-0.5 text-slate-400 hover:bg-slate-100 hover:text-red-500"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="relative flex items-end gap-2 rounded-2xl border border-slate-300 bg-slate-50/80 p-2 transition-within focus-within:border-emerald-600 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-600/20"
            >
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-slate-500 hover:bg-slate-200/60 hover:text-emerald-700 transition"
                title="Attach DOC, PDF or Image file"
              >
                <Paperclip className="h-5 w-5" />
              </button>

              <textarea
                ref={textareaRef}
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={
                  attachedFiles.length > 0
                    ? `Attached ${attachedFiles.length} file(s). Add any specific instructions or press send...`
                    : "Ask Gemini AI or attach DOC/PDF/Image to generate JD... (Press Enter to send)"
                }
                className="max-h-32 min-h-[44px] w-full resize-none bg-transparent px-2 py-2 text-[13px] text-slate-800 outline-none placeholder:text-slate-400"
                rows={1}
              />

              <button
                type="submit"
                disabled={(!inputPrompt.trim() && attachedFiles.length === 0) || isLoading}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md transition hover:brightness-110 disabled:opacity-40 disabled:hover:brightness-100 cursor-pointer"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>

            <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 px-1">
              <span>Supports <strong>PDF, DOC, DOCX, TXT, PNG, JPG</strong> attachments</span>
              <span>Gemini 2.5 Multimodal Engine</span>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================
          QUICK FORM GENERATOR MODAL
      ========================================================= */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-100 text-emerald-700">
                  <Wand2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Quick JD Form Generator
                  </h3>
                  <p className="text-[11px] font-medium text-slate-500">
                    Fill in key criteria & Gemini AI will craft the complete job description
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowFormModal(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Senior Frontend Engineer"
                    className="mt-1 h-9 w-full rounded-lg border border-slate-300 px-3 text-[12px] outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700">
                    Department
                  </label>
                  <input
                    type="text"
                    value={formDept}
                    onChange={(e) => setFormDept(e.target.value)}
                    placeholder="e.g. Engineering / Marketing"
                    className="mt-1 h-9 w-full rounded-lg border border-slate-300 px-3 text-[12px] outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700">
                    Experience Level
                  </label>
                  <select
                    value={formExp}
                    onChange={(e) => setFormExp(e.target.value)}
                    className="mt-1 h-9 w-full rounded-lg border border-slate-300 px-3 text-[12px] outline-none focus:border-emerald-600"
                  >
                    <option value="Entry Level (0-2 Yrs)">Entry Level (0-2 Yrs)</option>
                    <option value="Mid Level (2-5 Yrs)">Mid Level (2-5 Yrs)</option>
                    <option value="Senior Level (5-8 Yrs)">Senior Level (5-8 Yrs)</option>
                    <option value="Executive / Director (8+ Yrs)">Executive / Director (8+ Yrs)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700">
                    Work Location
                  </label>
                  <input
                    type="text"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    placeholder="e.g. New Delhi (Hybrid) / Remote"
                    className="mt-1 h-9 w-full rounded-lg border border-slate-300 px-3 text-[12px] outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700">
                  Key Skills & Technologies
                </label>
                <input
                  type="text"
                  value={formSkills}
                  onChange={(e) => setFormSkills(e.target.value)}
                  placeholder="e.g. Next.js, TypeScript, Tailwind CSS, REST APIs"
                  className="mt-1 h-9 w-full rounded-lg border border-slate-300 px-3 text-[12px] outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700">
                  Special Notes or Requirements
                </label>
                <textarea
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="e.g. Must have organic industry exposure or experience leading a team of 4"
                  className="mt-1 h-20 w-full resize-none rounded-lg border border-slate-300 p-3 text-[12px] outline-none focus:border-emerald-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="h-9 rounded-lg border border-slate-200 px-4 text-[12px] font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 px-5 text-[12px] font-bold text-white shadow-md hover:brightness-110"
                >
                  <Sparkles className="h-4 w-4" />
                  Generate JD with AI
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
