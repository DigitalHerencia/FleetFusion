"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import {
  Upload,
  X,
  File,
  Image as ImageIcon,
  FileText,
  FileCode,
  FileAudio,
  FileVideo,
} from "lucide-react";

// Types
export interface FileRejection {
  file: File;
  errors: Array<{ code: string; message: string }>;
}

export interface DropzoneState {
  isDragging: boolean;
  isDisabled: boolean;
  acceptedFiles: File[];
  rejectedFiles: FileRejection[];
  reset: () => void;
}

// Variants
const dropzoneVariants = cva(
  "relative flex cursor-pointer flex-col items-center justify-center border-3 border-dashed border-foreground transition duration-200",
  {
    variants: {
      state: {
        idle: "bg-background shadow-[4px_4px_0px_hsl(var(--shadow-color))] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:bg-muted/30 hover:shadow-[6px_6px_0px_hsl(var(--shadow-color))]",
        dragging:
          "scale-[1.02] border-solid border-primary bg-primary/10 shadow-[8px_8px_0px_hsl(var(--primary))]",
        disabled: "cursor-not-allowed opacity-50 shadow-none",
      },
      variant: {
        default: "p-8",
        compact: "p-6",
        minimal: "border-2 p-3",
      },
    },
    defaultVariants: {
      state: "idle",
      variant: "default",
    },
  },
);

// Dropzone Props
export interface DropzoneProps
  extends
    Omit<React.HTMLAttributes<HTMLDivElement>, "children">,
    VariantProps<typeof dropzoneVariants> {
  onFilesAccepted: (files: File[]) => void;
  onFilesRejected?: (files: FileRejection[]) => void;
  accept?: Record<string, string[]>;
  maxSize?: number;
  maxFiles?: number;
  disabled?: boolean;
  children?: React.ReactNode | ((state: DropzoneState) => React.ReactNode);
}

const Dropzone = React.forwardRef<HTMLDivElement, DropzoneProps>(
  (
    {
      onFilesAccepted,
      onFilesRejected,
      accept,
      maxSize = 10 * 1024 * 1024, // 10MB default
      maxFiles = 10,
      disabled = false,
      variant,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const [isDragging, setIsDragging] = React.useState(false);
    const [isFocused, setIsFocused] = React.useState(false);
    const [acceptedFiles, setAcceptedFiles] = React.useState<File[]>([]);
    const [rejectedFiles, setRejectedFiles] = React.useState<FileRejection[]>(
      [],
    );
    const inputRef = React.useRef<HTMLInputElement>(null);

    const reset = React.useCallback(() => {
      setAcceptedFiles([]);
      setRejectedFiles([]);
      if (inputRef.current) inputRef.current.value = "";
    }, []);

    const state: DropzoneState = {
      isDragging,
      isDisabled: disabled,
      acceptedFiles,
      rejectedFiles,
      reset,
    };

    const stateVariant = disabled
      ? "disabled"
      : isDragging
        ? "dragging"
        : "idle";

    // Validate file
    const validateFile = (file: File): FileRejection | null => {
      const errors: Array<{ code: string; message: string }> = [];

      // Check file size
      if (file.size > maxSize) {
        errors.push({
          code: "file-too-large",
          message: `File is larger than ${formatBytes(maxSize)}`,
        });
      }

      // Check file type
      if (accept) {
        const acceptedTypes = Object.entries(accept).flatMap(
          ([mimeType, extensions]) => {
            return [mimeType, ...extensions];
          },
        );

        const fileType = file.type;
        const fileExtension = `.${file.name.split(".").pop()?.toLowerCase()}`;

        const isAccepted = acceptedTypes.some((type) => {
          if (type.startsWith(".")) {
            return fileExtension === type.toLowerCase();
          }
          if (type.endsWith("/*")) {
            return fileType.startsWith(type.replace("/*", "/"));
          }
          return fileType === type;
        });

        if (!isAccepted) {
          errors.push({
            code: "file-invalid-type",
            message: "File type not accepted",
          });
        }
      }

      return errors.length > 0 ? { file, errors } : null;
    };

    // Process files
    const processFiles = (fileList: FileList | null) => {
      if (!fileList || disabled) return;

      const allFiles = Array.from(fileList);
      const accepted: File[] = [];
      const rejected: FileRejection[] = [];

      allFiles.forEach((file) => {
        const rejection = validateFile(file);
        if (rejection) {
          rejected.push(rejection);
        } else if (accepted.length >= maxFiles) {
          rejected.push({
            file,
            errors: [
              {
                code: "too-many-files",
                message: `Too many files. Maximum is ${maxFiles}.`,
              },
            ],
          });
        } else {
          accepted.push(file);
        }
      });

      setAcceptedFiles(accepted);
      setRejectedFiles(rejected);

      if (accepted.length > 0) {
        onFilesAccepted(accepted);
      }
      if (rejected.length > 0) {
        onFilesRejected?.(rejected);
      }
    };

    // Event handlers
    const handleDragEnter = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled) {
        setIsDragging(true);
      }
    };

    const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      // dragleave also fires when the cursor moves onto a child element; only
      // clear the highlight when the pointer actually leaves the dropzone.
      if (
        e.relatedTarget &&
        e.currentTarget.contains(e.relatedTarget as Node)
      ) {
        return;
      }
      setIsDragging(false);
    };

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      processFiles(e.dataTransfer.files);
    };

    const handleClick = () => {
      if (!disabled) {
        inputRef.current?.click();
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (!disabled && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        inputRef.current?.click();
      }
    };

    const handleFocus = () => setIsFocused(true);
    const handleBlur = () => setIsFocused(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      processFiles(e.target.files);
      e.target.value = "";
    };

    // Build accept string for input
    const acceptString = accept
      ? Object.entries(accept)
          .flatMap(([mimeType, extensions]) => [mimeType, ...extensions])
          .join(",")
      : undefined;

    return (
      <div
        ref={ref}
        className={cn(
          dropzoneVariants({ state: stateVariant, variant }),
          isFocused &&
            !disabled &&
            "outline outline-2 outline-offset-2 outline-primary",
          className,
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        aria-label="File upload area"
        {...props}
      >
        <input
          ref={inputRef}
          type="file"
          accept={acceptString}
          multiple={maxFiles > 1}
          disabled={disabled}
          onChange={handleInputChange}
          className="hidden"
        />

        {typeof children === "function" ? (
          // The render prop intentionally receives reset(), whose ref access
          // occurs only if the consumer invokes it from an event.
          // eslint-disable-next-line react-hooks/refs
          children(state)
        ) : children ? (
          children
        ) : (
          <DefaultDropzoneContent isDragging={isDragging} variant={variant} />
        )}
      </div>
    );
  },
);
Dropzone.displayName = "Dropzone";

// Default content
function DefaultDropzoneContent({
  isDragging,
  variant,
}: {
  isDragging: boolean;
  variant: DropzoneProps["variant"];
}) {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <div
        className={cn(
          "flex h-16 w-16 items-center justify-center border-3 border-foreground bg-muted transition duration-200",
          isDragging &&
            "-translate-x-1 -translate-y-1 border-primary bg-primary shadow-[4px_4px_0px_hsl(var(--foreground))]",
        )}
      >
        <Upload
          className={cn(
            "h-8 w-8 transition duration-200",
            isDragging
              ? "animate-bounce text-primary-foreground"
              : "text-foreground",
          )}
        />
      </div>
      {variant !== "minimal" && (
        <>
          <p className="text-lg font-black tracking-wide uppercase">
            {isDragging ? "Drop files here" : "Drag & drop files"}
          </p>
          <p className="text-sm font-bold text-muted-foreground">
            or click to browse
          </p>
        </>
      )}
    </div>
  );
}

// File List Component
export interface FileListProps extends React.HTMLAttributes<HTMLDivElement> {
  files: Array<{
    file: File;
    progress?: number;
    error?: string;
    uploading?: boolean;
  }>;
  onRemove?: (file: File) => void;
}

const FileList = React.forwardRef<HTMLDivElement, FileListProps>(
  ({ files, onRemove, className, ...props }, ref) => {
    if (files.length === 0) return null;

    return (
      <div ref={ref} className={cn("mt-4 space-y-2", className)} {...props}>
        {files.map((item, index) => (
          <FileListItem
            key={`${item.file.name}-${index}`}
            file={item.file}
            {...(item.progress === undefined
              ? {}
              : { progress: item.progress })}
            {...(item.error === undefined ? {} : { error: item.error })}
            {...(item.uploading === undefined
              ? {}
              : { uploading: item.uploading })}
            {...(onRemove ? { onRemove: () => onRemove(item.file) } : {})}
          />
        ))}
      </div>
    );
  },
);
FileList.displayName = "FileList";

// File List Item
interface FileListItemProps {
  file: File;
  progress?: number;
  error?: string;
  uploading?: boolean;
  onRemove?: () => void;
}

function FileListItem({
  file,
  progress,
  error,
  uploading,
  onRemove,
}: FileListItemProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 border-3 border-foreground bg-background p-3 shadow-[3px_3px_0px_hsl(var(--shadow-color))]",
        error &&
          "border-destructive bg-destructive/10 shadow-[3px_3px_0px_hsl(var(--destructive))]",
      )}
    >
      <div className="flex h-10 w-10 items-center justify-center border-3 border-foreground bg-muted">
        {renderFileIcon(file.type)}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold">{file.name}</p>
        <p className="text-xs text-muted-foreground">
          {formatBytes(file.size)}
        </p>
        {error && <p className="text-xs font-bold text-destructive">{error}</p>}
        {uploading && progress !== undefined && (
          <Progress value={progress} className="mt-1 h-2" />
        )}
      </div>

      {uploading ? (
        <Spinner size="sm" />
      ) : onRemove ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="flex h-8 w-8 items-center justify-center border-3 border-foreground bg-background transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-destructive hover:text-destructive-foreground hover:shadow-[2px_2px_0px_hsl(var(--foreground))]"
        >
          <X className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  );
}

// Helpers
function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.min(
    Math.floor(Math.log(bytes) / Math.log(k)),
    sizes.length - 1,
  );
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function renderFileIcon(mimeType: string) {
  const className = "h-5 w-5";
  if (mimeType.startsWith("image/")) return <ImageIcon className={className} />;
  if (mimeType.startsWith("video/")) return <FileVideo className={className} />;
  if (mimeType.startsWith("audio/")) return <FileAudio className={className} />;
  if (mimeType.includes("pdf") || mimeType.includes("document"))
    return <FileText className={className} />;
  if (
    mimeType.includes("code") ||
    mimeType.includes("javascript") ||
    mimeType.includes("json")
  )
    return <FileCode className={className} />;
  return <File className={className} />;
}

export { Dropzone, FileList, dropzoneVariants };
