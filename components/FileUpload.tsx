"use client";

import { ChangeEvent, DragEvent, useState } from "react";
import { useTranslations } from "next-intl";

import { uploadFile } from "@/actions/upload";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

type FileUploadProps = {
  requestId: string;
  onUploaded?: () => void;
};

export default function FileUpload({ requestId, onUploaded }: FileUploadProps) {
  const t = useTranslations("PortalRequest.upload");
  const [dragActive, setDragActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const resetState = () => {
    setDragActive(false);
    setProgress(0);
    setStatusMessage(null);
    setError(null);
  };

  const handleFile = async (file: File) => {
    resetState();
    setIsLoading(true);
    setProgress(10);
    setStatusMessage(t("states.validating"));

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      setError(t("errors.unsupportedType"));
      setIsLoading(false);
      setProgress(0);
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError(t("errors.fileTooLarge"));
      setIsLoading(false);
      setProgress(0);
      return;
    }

    try {
      setProgress(30);
      setStatusMessage(t("states.scanning"));

      await uploadFile(file, requestId);

      setProgress(100);
      setStatusMessage(t("states.complete"));
      onUploaded?.();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : t("errors.uploadFailed"),
      );
      setProgress(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = async (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);

    if (isLoading) {
      return;
    }

    const file = event.dataTransfer.files?.[0];
    if (file) {
      await handleFile(file);
    }
  };

  const handleChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await handleFile(file);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-[2rem] border border-foreground/10 bg-card p-6">
        <div
          role="button"
          tabIndex={0}
          onDragEnter={() => setDragActive(true)}
          onDragLeave={() => setDragActive(false)}
          onDragOver={(event) => {
            event.preventDefault();
            event.stopPropagation();
            setDragActive(true);
          }}
          onDrop={handleDrop}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              document.getElementById("file-upload-input")?.click();
            }
          }}
          className={`flex min-h-[220px] flex-col items-center justify-center gap-4 rounded-[1.5rem] border-2 border-dashed px-4 py-8 text-center transition ${
            dragActive ? "border-emerald-500 bg-emerald-50" : "border-foreground/10 bg-background"
          }`}
        >
          <p className="text-lg font-semibold text-foreground">{t("title")}</p>
          <p className="max-w-xl text-sm leading-6 text-foreground/75">{t("description")}</p>
          <label
            htmlFor="file-upload-input"
            className="inline-flex cursor-pointer rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background transition hover:bg-foreground/90"
          >
            {t("actions.chooseFile")}
          </label>
          <input
            id="file-upload-input"
            type="file"
            accept={ALLOWED_MIME_TYPES.join(",")}
            onChange={handleChange}
            disabled={isLoading}
            className="hidden"
          />
        </div>
      </div>

      {isLoading && (
        <div className="space-y-2">
          <div className="h-2 overflow-hidden rounded-full bg-foreground/10">
            <div
              className="h-full rounded-full bg-foreground transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-foreground/70">{statusMessage}</p>
        </div>
      )}

      {error && (
        <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-2 text-sm text-foreground/70 sm:grid-cols-2">
        <span>{t("hints.maximumSize")}</span>
        <span>{t("hints.allowedTypes")}</span>
      </div>
    </div>
  );
}
