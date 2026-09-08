"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  FolderClosed,
  Headphones,
  HeartHandshake,
  MapPin,
  Phone,
  Send,
  ShieldCheck,
  Tag,
} from "lucide-react";

const gallery = [
  {
    id: 1,
    src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=85",
    alt: "Service preview",
  },
  {
    id: 2,
    src: "https://images.unsplash.com/photo-1515569067071-ec3b51335dd0?auto=format&fit=crop&w=500&q=85",
    alt: "Ambulance support",
  },
  {
    id: 3,
    src: "https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=500&q=85",
    alt: "Ritual support",
  },
  {
    id: 4,
    src: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=500&q=85",
    alt: "Family support",
  },
];

const benefits = [
  "Free transportation at the nearest area",
  "Cremation at partner or nearest crematorium",
  "Complete cremation arrangements",
  "Priest & ritual support",
  "Assistance with paperwork & formalities",
  "Support for unclaimed & financially weak families",
];

const included = [
  "Dead body pickup & transport",
  "Cremation booking & coordination",
  "Wood, samagri & other essentials",
  "Priest & rituals",
  "Post-cremation support & guidance",
  "Hassle-free & compassionate service",
];

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-[12px]">
      <div className="grid h-[38px] w-[38px] shrink-0 place-items-center rounded-full bg-[#eef7f1] text-[#147044]">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-[9.5px] font-extrabold text-[#4b5870]">{label}</p>
        <p className="mt-[3px] text-[10.5px] font-semibold leading-[1.35] text-[#273654]">
          {value}
        </p>
      </div>
    </div>
  );
}

export default function PreviewServiceView() {
  const router = useRouter();
  const [activeImage, setActiveImage] = useState(gallery[0]);

  return (
    <main
      style={{
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
      className="h-full min-h-0 w-full overflow-y-auto overflow-x-hidden bg-[#fffefb] px-[18px] py-[14px] text-[#142347] [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300"
    >
      <div className="min-h-full w-full">
        {/* HEADER */}
        <header className="flex items-start justify-between gap-[16px]">
          <div>
            <h1 className="text-[28px] font-extrabold leading-none tracking-[-0.03em] text-[#075b33]">
              Preview Service
            </h1>

            <nav className="mt-[10px] flex items-center gap-[8px] text-[11px] font-semibold text-[#1d2b58]">
              <span>Dashboard</span>
              <span className="text-[#7b8597]">›</span>
              <span>Services Management</span>
              <span className="text-[#7b8597]">›</span>
              <span>Preview Service</span>
            </nav>
          </div>

          <div className="flex items-center gap-[12px]">
            <button
              type="button"
              onClick={() => router.push("/services/new")}
              className="inline-flex h-[40px] items-center gap-[8px] rounded-[6px] border border-[#dfe3e7] bg-white px-[18px] text-[10.5px] font-bold text-[#273655] hover:bg-slate-50 transition"
            >
              <ArrowLeft className="h-[15px] w-[15px]" />
              Back to Edit
            </button>

            <button
              type="button"
              onClick={() => { alert("Service published successfully!"); router.push("/services"); }}
              className="inline-flex h-[40px] items-center gap-[8px] rounded-[6px] bg-[linear-gradient(180deg,#076636_0%,#03542c_100%)] px-[20px] text-[10.5px] font-bold text-white shadow-[0_7px_16px_rgba(5,94,49,.12)] hover:opacity-95 transition"
            >
              <Send className="h-[15px] w-[15px]" />
              Publish Service
            </button>
          </div>
        </header>

        {/* MAIN PREVIEW CARD */}
        <section className="mt-[18px] overflow-hidden rounded-[10px] border border-[#e6e9ec] bg-white px-[28px] py-[22px] shadow-[0_1px_3px_rgba(15,23,42,0.025)]">
          {/* TOP AREA */}
          <div className="grid items-start gap-[30px] xl:grid-cols-[430px_minmax(0,1fr)]">
            {/* GALLERY */}
            <div>
              <img
                src={activeImage.src}
                alt={activeImage.alt}
                className="h-[280px] w-full rounded-[8px] border border-[#e5e8eb] object-cover"
              />

              <div className="mt-[14px] grid grid-cols-4 gap-[12px]">
                {gallery.map((image) => (
                  <button
                    key={image.id}
                    type="button"
                    onClick={() => setActiveImage(image)}
                    className={`overflow-hidden rounded-[7px] border-2 ${activeImage.id === image.id
                        ? "border-[#246f48]"
                        : "border-transparent"
                      }`}
                  >
                    <img
                      src={image.src}
                      alt={image.alt}
                      className="h-[62px] w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* SERVICE SUMMARY */}
            <div className="min-w-0 pt-[8px]">
              <span className="inline-flex rounded-[5px] border border-emerald-200 bg-emerald-50 px-[10px] py-[4px] text-[8.5px] font-extrabold text-emerald-700">
                Active
              </span>

              <h2 className="mt-[16px] max-w-[760px] text-[28px] font-extrabold leading-[1.15] tracking-[-0.03em] text-[#10204a]">
                Dignified Final Journey &amp; Cremation Support
              </h2>

              <p className="mt-[12px] max-w-[760px] text-[12px] font-semibold leading-[1.7] text-[#4d5d79]">
                We ensure every individual receives a respectful final journey
                and complete cremation support with compassion, dignity, and
                care.
              </p>

              <div className="mt-[18px] flex flex-wrap gap-[12px]">
                {[
                  [HeartHandshake, "Compassionate Support"],
                  [Clock3, "24×7 Availability"],
                  [ShieldCheck, "Verified & Trusted"],
                ].map(([Icon, label]) => {
                  const ItemIcon = Icon as typeof HeartHandshake;

                  return (
                    <span
                      key={String(label)}
                      className="inline-flex h-[38px] items-center gap-[9px] rounded-[7px] bg-[linear-gradient(90deg,#eef7f1,#f6fbf8)] px-[14px] text-[10px] font-extrabold text-[#286446]"
                    >
                      <ItemIcon className="h-[16px] w-[16px]" />
                      {String(label)}
                    </span>
                  );
                })}
              </div>

              <div className="mt-[20px] border-t border-[#e8ece9] pt-[18px]">
                <div className="grid grid-cols-2 gap-x-[56px] gap-y-[16px]">
                  <InfoItem
                    icon={<FolderClosed className="h-[17px] w-[17px]" />}
                    label="Category"
                    value="Final Journey Services"
                  />

                  <InfoItem
                    icon={<Clock3 className="h-[17px] w-[17px]" />}
                    label="Response Time"
                    value="Within 30 Minutes"
                  />

                  <InfoItem
                    icon={<Tag className="h-[17px] w-[17px]" />}
                    label="Service Type"
                    value="On-ground Support"
                  />

                  <InfoItem
                    icon={<MapPin className="h-[17px] w-[17px]" />}
                    label="Service Area"
                    value="Delhi NCR"
                  />

                  <InfoItem
                    icon={<Clock3 className="h-[17px] w-[17px]" />}
                    label="Availability"
                    value="24×7 (All Days)"
                  />

                  <InfoItem
                    icon={<Headphones className="h-[17px] w-[17px]" />}
                    label="Support"
                    value="Helpline & On-ground Team"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* DIVIDER */}
          <div className="my-[22px] h-px bg-[#e8ece9]" />

          {/* DESCRIPTION + PROMISE */}
          <div className="grid items-start gap-[30px] xl:grid-cols-[minmax(0,1fr)_375px]">
            <div>
              <h3 className="text-[14px] font-extrabold text-[#17234a]">
                Service Description
              </h3>

              <p className="mt-[10px] max-w-[900px] text-[10.5px] font-semibold leading-[1.65] text-[#44516a]">
                Moksha Sewa provides complete support for the final journey with
                dignity and respect.
                <br />
                Our team handles transportation, cremation arrangements, priest
                services, and all necessary rituals,
                <br />
                ensuring a hassle-free experience for the family.
              </p>
            </div>

            <div className="rounded-[8px] border border-[#e2e9e5] bg-[linear-gradient(90deg,#f5faf7,#fbfdfb)] px-[18px] py-[16px]">
              <div className="flex items-start gap-[12px]">
                <HeartHandshake className="mt-[1px] h-[24px] w-[24px] shrink-0 text-[#16844d]" />

                <div>
                  <h4 className="text-[12px] font-extrabold text-[#286446]">
                    Our Promise
                  </h4>
                  <p className="mt-[8px] text-[10px] font-semibold leading-[1.55] text-[#55627a]">
                    We treat every case with humanity,
                    <br />
                    dignity and respect, like our own family.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* BENEFITS / INCLUDED */}
          <div className="mt-[26px] grid gap-[46px] xl:grid-cols-2">
            <div>
              <h3 className="text-[14px] font-extrabold text-[#17234a]">
                Key Benefits
              </h3>

              <div className="mt-[12px] space-y-[10px]">
                {benefits.map((benefit) => (
                  <div key={benefit} className="flex items-start gap-[10px]">
                    <CheckCircle2 className="mt-[1px] h-[16px] w-[16px] shrink-0 text-[#147044]" />
                    <span className="text-[10.5px] font-semibold leading-[1.4] text-[#34425e]">
                      {benefit}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-[14px] font-extrabold text-[#17234a]">
                What&apos;s Included
              </h3>

              <div className="mt-[12px] space-y-[10px]">
                {included.map((item) => (
                  <div key={item} className="flex items-start gap-[10px]">
                    <CheckCircle2 className="mt-[1px] h-[16px] w-[16px] shrink-0 text-[#147044]" />
                    <span className="text-[10.5px] font-semibold leading-[1.4] text-[#34425e]">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-[22px] flex min-h-[76px] items-center justify-between gap-[20px] rounded-[8px] bg-[linear-gradient(90deg,#eef7f1,#f7fbf8)] px-[22px]">
            <div className="flex min-w-0 items-center gap-[14px]">
              <div className="grid h-[46px] w-[46px] shrink-0 place-items-center rounded-full bg-[#e4f3e8] text-[#167047]">
                <Headphones className="h-[23px] w-[23px]" />
              </div>

              <div className="min-w-0">
                <p className="text-[12px] font-extrabold text-[#274735]">
                  Need this service?
                </p>
                <p className="mt-[5px] text-[10px] font-semibold text-[#5d6a82]">
                  Our team is ready to help you 24×7.
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-[14px]">
              <button
                type="button"
                className="inline-flex h-[40px] items-center gap-[9px] rounded-[6px] border border-[#1b7a4d] bg-white px-[22px] text-[10px] font-extrabold text-[#14683d]"
              >
                <Phone className="h-[15px] w-[15px]" />
                Request Sewa Help
              </button>

              <button
                type="button"
                className="inline-flex h-[40px] items-center gap-[9px] rounded-[6px] bg-[linear-gradient(180deg,#076636_0%,#03542c_100%)] px-[22px] text-[10px] font-extrabold text-white"
              >
                <Phone className="h-[15px] w-[15px]" />
                Call Helpline
              </button>
            </div>
          </div>
        </section>

        {/* FOOT NOTE */}
        <section className="mt-[14px] flex min-h-[46px] items-center rounded-[8px] border border-[#dbe7f4] bg-[linear-gradient(90deg,#f1f7ff,#f8fbff)] px-[18px]">
          <span className="mr-[10px] grid h-[18px] w-[18px] place-items-center rounded-full border border-[#5796d5] text-[10px] font-extrabold text-[#5796d5]">
            i
          </span>
          <p className="text-[9.5px] font-semibold text-[#53627c]">
            This is how your service will appear on the website to visitors.
          </p>
        </section>
      </div>
    </main>
  );
}
