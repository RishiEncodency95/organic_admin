import Link from "next/link";
import { BadgeCheck } from "lucide-react";

export default function AdminFooter() {
  return (
    <footer className="relative h-10 shrink-0 border-t border-[#e7e4dc] bg-[#faf9f6]">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-emerald-50/60 to-transparent" />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-[7px] right-0 hidden h-[47px] w-[460px] bg-no-repeat lg:block"
        style={{ backgroundImage: 'url("/assets/footer-tug-of-war.png")', backgroundSize: "460px 47px", backgroundPosition: "right bottom" }}
      />

      <div className="relative z-10 flex h-full items-center overflow-x-auto px-3 text-[10px] font-medium text-slate-600 lg:pr-[390px]">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex items-center gap-2 whitespace-nowrap">
            <BadgeCheck className="h-4 w-4 text-amber-500" />
            Together, we bring dignity to every final journey.
          </span>
          <span className="h-5 w-px bg-slate-300" />
          <span className="whitespace-nowrap">© {new Date().getFullYear()} Bharat Organic Expo. All rights reserved.</span>
          <span className="h-6 w-px bg-slate-300" />
          <span className="whitespace-nowrap">An Initiative of Namo Gange Trust</span>
          <span className="h-6 w-px bg-slate-300" />
          <Link href="https://mokshasewa.org/privacy-policy" target="_blank" rel="noopener noreferrer" className="whitespace-nowrap hover:text-slate-900">Privacy Policy</Link>
          <span className="h-6 w-px bg-slate-300" />
          <Link href="https://mokshasewa.org/terms" target="_blank" rel="noopener noreferrer" className="whitespace-nowrap hover:text-slate-900">Terms &amp; Conditions</Link>
          <span className="h-6 w-px bg-slate-300" />
          <a href="mailto:info@mokshasewa.org" className="whitespace-nowrap hover:text-slate-900">Support</a>
        </div>
      </div>
    </footer>
  );
}
