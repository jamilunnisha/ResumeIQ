import { useRef, useState } from "react";
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  LoaderCircle,
  X,
  AlertCircle,
} from "lucide-react";

function UploadBox({
  onUpload,
  uploading = false,
  uploadMessage = "",
  error = "",
}) {
  const fileInputRef = useRef(null);

  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFile = (file) => {
    if (!file) {
      return;
    }

    if (file.type !== "application/pdf") {
      alert("Please select a PDF resume.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("File size must be less than 10 MB.");
      return;
    }

    setSelectedFile(file);

    if (onUpload) {
      onUpload(file);
    }
  };

  const handleInputChange = (event) => {
    const file = event.target.files?.[0];

    handleFile(file);

    event.target.value = "";
  };

  const handleDrop = (event) => {
    event.preventDefault();

    setIsDragging(false);

    const file = event.dataTransfer.files?.[0];

    handleFile(file);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
  };

  const openFilePicker = () => {
    if (!uploading) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

      {/* Header */}

      <div className="mb-6 flex items-start justify-between">

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-indigo-500">
            Resume ingestion
          </p>

          <h3 className="mt-1 text-xl font-bold tracking-tight text-slate-900">
            Upload a resume
          </h3>

          <p className="mt-1.5 max-w-xl text-sm leading-6 text-slate-400">
            Upload a candidate's PDF resume and ResumeIQ will extract
            structured information automatically.
          </p>
        </div>

        <div className="hidden h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 sm:flex">
          <FileText size={19} />
        </div>

      </div>


      {/* Drop zone */}

      <div
        onClick={openFilePicker}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-200 sm:p-10 ${
          isDragging
            ? "border-indigo-400 bg-indigo-50"
            : uploading
              ? "cursor-not-allowed border-slate-200 bg-slate-50"
              : "border-slate-200 bg-slate-50/70 hover:border-indigo-300 hover:bg-indigo-50/40"
        }`}
      >

        {/* Upload icon */}

        <div
          className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl transition-all ${
            isDragging
              ? "bg-indigo-100 text-indigo-600"
              : "bg-white text-slate-500 shadow-sm"
          }`}
        >

          {uploading ? (
            <LoaderCircle
              size={28}
              className="animate-spin text-indigo-600"
            />
          ) : (
            <UploadCloud
              size={29}
              strokeWidth={1.8}
            />
          )}

        </div>


        {/* Main text */}

        <h4 className="mt-5 text-sm font-bold text-slate-800">

          {uploading
            ? "Processing your resume..."
            : isDragging
              ? "Drop your resume here"
              : "Drag & drop your resume here"}

        </h4>


        <p className="mt-2 text-xs text-slate-400">
          or click anywhere to browse from your computer
        </p>


        {/* Browse button */}

        {!uploading && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              openFilePicker();
            }}
            className="mt-5 rounded-xl bg-slate-950 px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-600"
          >
            Browse PDF
          </button>
        )}


        {/* File restrictions */}

        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[11px] text-slate-400">

          <span>PDF only</span>

          <span className="h-1 w-1 rounded-full bg-slate-300" />

          <span>Maximum 10 MB</span>

          <span className="h-1 w-1 rounded-full bg-slate-300" />

          <span>Automatic parsing</span>

        </div>


        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          className="hidden"
          onChange={handleInputChange}
          disabled={uploading}
        />

      </div>


      {/* Selected file */}

      {selectedFile && (
        <div className="mt-4 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">

          <div className="flex min-w-0 items-center gap-3">

            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-indigo-600 shadow-sm">
              <FileText size={17} />
            </div>

            <div className="min-w-0">

              <p className="truncate text-sm font-semibold text-slate-700">
                {selectedFile.name}
              </p>

              <p className="text-[11px] text-slate-400">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>

            </div>

          </div>


          {!uploading && (
            <button
              type="button"
              onClick={removeSelectedFile}
              className="rounded-lg p-2 text-slate-400 transition hover:bg-white hover:text-slate-700"
            >
              <X size={17} />
            </button>
          )}

        </div>
      )}


      {/* Processing status */}

      {uploading && (
        <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3">

          <div className="flex items-center gap-3">

            <LoaderCircle
              size={18}
              className="animate-spin text-indigo-600"
            />

            <div className="flex-1">

              <p className="text-xs font-semibold text-indigo-700">
                Resume is being processed
              </p>

              <p className="mt-0.5 text-[11px] text-indigo-500">
                Extracting candidate information and saving it to the database...
              </p>

            </div>

          </div>


          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-indigo-100">

            <div className="h-full w-2/3 animate-pulse rounded-full bg-indigo-500" />

          </div>

        </div>
      )}


      {/* Success */}

      {uploadMessage && !error && !uploading && (
        <div className="mt-4 flex items-start gap-3 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3">

          <CheckCircle2
            size={18}
            className="mt-0.5 shrink-0 text-emerald-600"
          />

          <div>

            <p className="text-xs font-semibold text-emerald-700">
              Resume processed successfully
            </p>

            <p className="mt-0.5 text-[11px] text-emerald-600">
              {uploadMessage}
            </p>

          </div>

        </div>
      )}


      {/* Error */}

      {error && (
        <div className="mt-4 flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3">

          <AlertCircle
            size={18}
            className="mt-0.5 shrink-0 text-red-600"
          />

          <div>

            <p className="text-xs font-semibold text-red-700">
              Upload failed
            </p>

            <p className="mt-0.5 text-[11px] text-red-600">
              {error}
            </p>

          </div>

        </div>
      )}

    </div>
  );
}

export default UploadBox;