import { createCrudApi } from "./crudApi";
import { BlogPost, GalleryItem, Testimonial, Faq } from "./types";

// Services/Pandits/Drivers were part of the paid-booking model and no longer exist on the
// backend — the PRD replaces them with a unified Volunteer directory (M3) and has no priced
// service catalog. Re-add here once that module exists.
export const blogApi = createCrudApi<BlogPost>("blog");
export const galleryApi = createCrudApi<GalleryItem>("gallery");
export const testimonialsApi = createCrudApi<Testimonial>("testimonials");
export const faqsApi = createCrudApi<Faq>("faqs");
