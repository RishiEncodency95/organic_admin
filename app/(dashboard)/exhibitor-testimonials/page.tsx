"use client";

import TestimonialsManager, { EXHIBITOR_TESTIMONIALS_CONFIG } from "@/components/testimonials/TestimonialsManager";

export default function ExhibitorTestimonialsPage() {
  return <TestimonialsManager config={EXHIBITOR_TESTIMONIALS_CONFIG} />;
}
