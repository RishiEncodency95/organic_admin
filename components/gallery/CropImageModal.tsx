"use client";

import { useRef, useState, useEffect } from "react";
import ReactCrop, { centerCrop, makeAspectCrop, type Crop, type PixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Maximize2, RectangleHorizontal } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { pixelCropToFile } from "@/lib/cropImage";

interface CropImageModalProps {
  isOpen: boolean;
  imageSrc: string | null;
  fileName?: string;
  onCancel: () => void;
  onCropped: (file: File) => void | Promise<void>;
}

const GALLERY_ASPECT = 4 / 3;

const centeredAspectCrop = (width: number, height: number, aspect: number): Crop =>
  centerCrop(
    makeAspectCrop({ unit: "%", width: 80 }, aspect, width, height),
    width,
    height
  );

const centeredFreeCrop = (width: number, height: number): Crop =>
  centerCrop({ unit: "%" as const, width: 80, height: 80 }, width, height);

export default function CropImageModal({
  isOpen,
  imageSrc,
  fileName = "cropped-image.jpg",
  onCancel,
  onCropped,
}: CropImageModalProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [aspectMode, setAspectMode] = useState<"free" | "locked">("free");
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [isSaving, setIsSaving] = useState(false);

  // Reset to a fresh centered selection whenever a new image is opened.
  useEffect(() => {
    setCrop(undefined);
    setCompletedCrop(undefined);
    setAspectMode("free");
  }, [imageSrc]);

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop(
      aspectMode === "locked"
        ? centeredAspectCrop(width, height, GALLERY_ASPECT)
        : centeredFreeCrop(width, height)
    );
  };

  const switchAspect = (mode: "free" | "locked") => {
    setAspectMode(mode);
    const img = imgRef.current;
    if (!img) return;
    if (mode === "locked") {
      setCrop(centeredAspectCrop(img.width, img.height, GALLERY_ASPECT));
    } else {
      // Keep the current selection but drop the aspect lock so every handle
      // (left, right, top, bottom, corners) can be dragged independently.
      setCrop((c) => (c ? { ...c } : centeredFreeCrop(img.width, img.height)));
    }
  };

  const handleClose = () => {
    setCrop(undefined);
    setCompletedCrop(undefined);
    onCancel();
  };

  const handleApply = async () => {
    if (!imgRef.current || !completedCrop || !completedCrop.width || !completedCrop.height) return;
    setIsSaving(true);
    try {
      const file = await pixelCropToFile(imgRef.current, completedCrop, fileName);
      await onCropped(file);
      setCrop(undefined);
      setCompletedCrop(undefined);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Crop Photo"
      size="md"
      footer={
        <>
          <button
            type="button"
            onClick={handleClose}
            disabled={isSaving}
            className="inline-flex h-[32px] items-center gap-1.5 px-[14px] text-[12px] font-semibold text-red-600 transition-all hover:bg-red-100 active:scale-95 disabled:opacity-50"
            style={{
              background: "#fff1f2",
              borderRadius: "4px",
              boxShadow: "rgba(0,0,0,0.02) 0px 1px 3px 0px, rgba(220,38,38,0.15) 0px 0px 0px 1px",
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={isSaving || !completedCrop?.width}
            className="inline-flex h-[32px] items-center gap-1.5 px-[14px] text-[12px] font-semibold text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
            style={{
              background: "#16a34a",
              borderRadius: "4px",
              boxShadow: "rgba(0,0,0,0.02) 0px 1px 3px 0px, rgba(22,163,74,0.2) 0px 0px 0px 1px",
            }}
          >
            {isSaving ? "Saving..." : "Apply Crop"}
          </button>
        </>
      }
    >
      <div className="space-y-3">
        {/* ASPECT MODE TOGGLE */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => switchAspect("free")}
            className={`inline-flex h-[26px] items-center gap-1.5 rounded-[4px] border px-2.5 text-[9.5px] font-bold transition ${
              aspectMode === "free"
                ? "border-[#16a34a] bg-[#ecfdf3] text-[#15803d]"
                : "border-[#cbd5e1] bg-white text-[#334155] hover:bg-slate-50"
            }`}
          >
            <Maximize2 className="h-3 w-3" />
            Free Crop
          </button>
          <button
            type="button"
            onClick={() => switchAspect("locked")}
            className={`inline-flex h-[26px] items-center gap-1.5 rounded-[4px] border px-2.5 text-[9.5px] font-bold transition ${
              aspectMode === "locked"
                ? "border-[#16a34a] bg-[#ecfdf3] text-[#15803d]"
                : "border-[#cbd5e1] bg-white text-[#334155] hover:bg-slate-50"
            }`}
          >
            <RectangleHorizontal className="h-3 w-3" />
            4:3 (Gallery Card)
          </button>
        </div>

        <div className="flex max-h-[420px] w-full items-center justify-center overflow-auto rounded-[8px] bg-[#111827] p-2">
          {imageSrc && (
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={aspectMode === "locked" ? GALLERY_ASPECT : undefined}
              minWidth={20}
              minHeight={20}
              keepSelection
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                ref={imgRef}
                src={imageSrc}
                alt="Crop source"
                crossOrigin="anonymous"
                onLoad={onImageLoad}
                style={{ maxHeight: 400, maxWidth: "100%", display: "block" }}
              />
            </ReactCrop>
          )}
        </div>

        <p className="text-[9px] font-medium text-[#64748b]">
          Drag any edge or corner of the box to crop freely from the left, right, top or bottom —
          or switch to 4:3 to match the fixed Gallery / Glimpses card shape.
        </p>
      </div>
    </Modal>
  );
}
