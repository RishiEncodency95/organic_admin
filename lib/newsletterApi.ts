import { api } from "./api";
import { NewsletterSubscriber } from "./types";

export const newsletterApi = {
  list: () => api.get<NewsletterSubscriber[]>("/newsletter/admin"),
};
