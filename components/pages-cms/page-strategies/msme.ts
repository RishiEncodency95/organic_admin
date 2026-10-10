import { api } from "@/lib/api";
import type { SectionsDraft, SetSectionsDraft } from "./types";
import type { CmsJson, CmsRecord } from "@/lib/cmsJson";

const DIRECTOR_MESSAGE_ENDPOINT = "/website/participate/msme/official-message";
const isDirectorMessage = (sec: CmsRecord) =>
  sec.key === "msme-director-message" || sec.name === "Msmedirectormessage";

export function syncMsmeSectionsFromLiveApi(setSectionsDraft: SetSectionsDraft): void {
  api.get(DIRECTOR_MESSAGE_ENDPOINT)
    .then((res: CmsJson) => {
      const data = res?.data?.data || res?.data || res;
      if (data) {
        setSectionsDraft((prev) =>
          prev.map((sec) =>
            isDirectorMessage(sec)
              ? {
                  ...sec,
                  enabled: data.enabled !== false,
                  eyebrow: data.eyebrow || sec.eyebrow,
                  title: data.title || sec.title,
                  subtitle: data.subtitle || sec.subtitle,
                  messageTitle: data.messageTitle || sec.messageTitle,
                  quote: data.quote || sec.quote,
                  authorName: data.authorName || sec.authorName,
                  authorDesignation: data.authorDesignation || sec.authorDesignation,
                  videoUrl: data.videoUrl ?? sec.videoUrl,
                  thumbnailImage: data.thumbnailImage ?? sec.thumbnailImage ?? "",
                  thumbnailAlt: data.thumbnailAlt ?? sec.thumbnailAlt ?? "",
                }
              : sec
          )
        );
      }
    })
    .catch(() => {});
}

export async function saveMsmeSections(sectionsDraft: SectionsDraft): Promise<void> {
  const messageSec = sectionsDraft.find(isDirectorMessage);
  if (messageSec) {
    await api.put(DIRECTOR_MESSAGE_ENDPOINT, {
      enabled: messageSec.enabled !== false,
      eyebrow: messageSec.eyebrow || "",
      title: messageSec.title || "",
      subtitle: messageSec.subtitle || "",
      messageTitle: messageSec.messageTitle || "",
      quote: messageSec.quote || "",
      authorName: messageSec.authorName || "",
      authorDesignation: messageSec.authorDesignation || "",
      videoUrl: messageSec.videoUrl || "",
      thumbnailImage: messageSec.thumbnailImage || "",
      thumbnailAlt: messageSec.thumbnailAlt || "",
    });
  }
}
