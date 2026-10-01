"use client";

import { Bot } from "lucide-react";
import ComingSoon from "@/components/ui/ComingSoon";
import ApplicationSentModal from "@/components/ApplicationSentModal";
import CandidateDetailsModal from "@/components/CandidateDetailsModal";
import ForwardToHRModal from "@/components/ForwardToHRModal";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useState, useEffect, Suspense } from "react";

function PageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isCandidateModalOpen, setIsCandidateModalOpen] = useState(false);
  const [isForwardToHRModalOpen, setIsForwardToHRModalOpen] = useState(false);

  useEffect(() => {
    const modalParam = searchParams.get("modal");
    if (modalParam === "submitform") {
      setIsSubmitModalOpen(true);
      setIsCandidateModalOpen(false);
      setIsForwardToHRModalOpen(false);
    } else if (modalParam === "candidatedetails") {
      setIsCandidateModalOpen(true);
      setIsSubmitModalOpen(false);
      setIsForwardToHRModalOpen(false);
    } else if (modalParam === "forwardtohr") {
      setIsForwardToHRModalOpen(true);
      setIsCandidateModalOpen(false);
      setIsSubmitModalOpen(false);
    } else {
      setIsSubmitModalOpen(false);
      setIsCandidateModalOpen(false);
    }
  }, [searchParams]);

  const handleCloseModal = () => {
    setIsSubmitModalOpen(false);
    setIsCandidateModalOpen(false);
    setIsForwardToHRModalOpen(false);
    router.replace(pathname, { scroll: false });
  };

  return (
    <>
      <ComingSoon
        icon={Bot}
        title="Applications & AI Response"
        description="Review candidate applications and manage AI-assisted responses from here."
      />
      
      <ApplicationSentModal 
        isOpen={isSubmitModalOpen} 
        onClose={handleCloseModal} 
      />
      
      <CandidateDetailsModal 
        isOpen={isCandidateModalOpen} 
        onClose={handleCloseModal} 
      />

      <ForwardToHRModal
        isOpen={isForwardToHRModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
}

export default function ApplicationsAiResponsePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PageContent />
    </Suspense>
  );
}
