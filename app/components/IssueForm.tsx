"use client";

import { ChangeEvent, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useApiFetcher } from "../providers/Providers";
import LoadingSkeleton from "./LoadingSkeleton";

export type IssueFormValues = {
  title: string;
  description: string;
  type: string;
  area: string;
  address?: string;
  image?: string;
};

type IssueFormProps = {
  initialValues?: Partial<IssueFormValues>;
  issueId?: string;
  mode?: "create" | "edit";
  onSuccessRedirect?: string | null;
  submitLabel?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  cancelLabel?: string;
};

type ApiResponse<T> = {
  success: boolean;
  data: T;
  error?: string;
};

export default function IssueForm({
  initialValues,
  issueId,
  mode,
  onSuccessRedirect,
  submitLabel,
  onSuccess,
  onCancel,
  cancelLabel,
}: IssueFormProps) {
  const router = useRouter();
  const api = useApiFetcher();
  const resolvedMode: "create" | "edit" = mode ?? (issueId ? "edit" : "create");
  const resolvedSubmitLabel = submitLabel ?? (resolvedMode === "create" ? "Create Issue" : "Save Changes");
  const redirectTarget =
    onSuccessRedirect !== undefined
      ? onSuccessRedirect
      : resolvedMode === "create"
      ? "/my-issues"
      : null;

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    setValue,
    watch,
  } = useForm<IssueFormValues>({
    defaultValues: {
      title: initialValues?.title ?? "",
      description: initialValues?.description ?? "",
      type: initialValues?.type ?? "",
      area: initialValues?.area ?? "",
      address: initialValues?.address ?? "",
      image: initialValues?.image ?? "",
    },
  });

  const imageValue = watch("image");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async (data: IssueFormValues) => {
      const url = resolvedMode === "edit" && issueId ? `/issues/${issueId}` : "/issues";
      const method = resolvedMode === "edit" && issueId ? "PUT" : "POST";

      const response = await api<ApiResponse<Record<string, unknown>>>({
        url,
        method,
        data,
      });

      if (!response.success) {
        throw new Error(response.error || "Failed to save issue");
      }

      return response.data;
    },
    onSuccess: () => {
      toast.success(resolvedMode === "create" ? "Issue created successfully" : "Issue updated successfully");
      if (resolvedMode === "create") {
        reset();
      }
      if (redirectTarget) {
        router.replace(redirectTarget);
      }
      onSuccess?.();
    },
    onError: (error: unknown) => {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    },
  });

  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await api<ApiResponse<{ url: string }>>({
        url: "/uploads",
        method: "POST",
        data: formData,
      });

      if (!response.success || !response.data?.url) {
        throw new Error(response.error || "Failed to upload image");
      }

      setValue("image", response.data.url, { shouldDirty: true, shouldValidate: true });
      toast.success("Image uploaded");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to upload image";
      setUploadError(message);
      toast.error(message);
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const handleClearImage = () => {
    setValue("image", "", { shouldDirty: true, shouldValidate: true });
    setUploadError(null);
  };

  const onSubmit = (data: IssueFormValues) => {
    if (!isDirty) return;
    const normalized: IssueFormValues = {
      ...data,
      address: data.address?.trim() || undefined,
      image: data.image?.trim() || undefined,
    };
    mutation.mutate(normalized);
  };

  return (
    <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
      <div className="grid gap-5">
        <div>
          <label htmlFor="title" className="block text-base font-semibold text-slate-800 mb-2">
            Title
          </label>
          <input
            id="title"
            type="text"
            {...register("title", { required: "Title is required", minLength: { value: 3, message: "Title must be at least 3 characters" } })}
            className="w-full rounded-md border border-slate-200 bg-white text-slate-900 shadow-sm placeholder:text-slate-500 focus:border-blue-600 focus:ring-blue-500 text-base px-4 py-3"
            placeholder="Enter the issue title"
          />
          {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
        </div>

        <div>
          <label htmlFor="description" className="block text-base font-semibold text-slate-800 mb-2">
            Description
          </label>
          <textarea
            id="description"
            rows={4}
            {...register("description", { required: "Description is required", minLength: { value: 6, message: "Description must be at least 6 characters" } })}
            className="w-full rounded-md border border-slate-200 bg-white text-slate-900 shadow-sm placeholder:text-slate-500 focus:border-blue-600 focus:ring-blue-500 text-base px-4 py-3"
            placeholder="Describe the issue in detail (what, where, impact)"
          />
          {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}
        </div>

        <div className="grid gap-5">
          <div>
            <label htmlFor="type" className="block text-base font-semibold text-slate-800 mb-2">
              Type
            </label>
            <select
              id="type"
              {...register("type", { required: "Type is required" })}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 text-slate-900 shadow-sm placeholder:text-slate-500 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-base px-4 py-3 transition hover:border-slate-300"
            >
              <option value="">Select issue type</option>
              <option value="Lighting">Lighting</option>
              <option value="Infrastructure">Infrastructure</option>
              <option value="Water & Sewage">Water & Sewage</option>
              <option value="Waste">Waste</option>
              <option value="Buildings">Buildings</option>
              <option value="Parks & Green Spaces">Parks & Green Spaces</option>
              <option value="Transportation">Transportation</option>
              <option value="Security & Safety">Security & Safety</option>
            </select>
            {errors.type && <p className="text-xs text-red-500 mt-1">{errors.type.message}</p>}
          </div>

          <div>
            <label htmlFor="area" className="block text-base font-semibold text-slate-800 mb-2">
              Area
            </label>
            <select
              id="area"
              {...register("area", { required: "Area is required" })}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 text-slate-900 shadow-sm placeholder:text-slate-500 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-base px-4 py-3 transition hover:border-slate-300"
            >
              <option value="">Select area</option>
              <option value="Gaza">Gaza</option>
              <option value="Khan Younis">Khan Younis</option>
              <option value="Deir al-Balah">Deir al-Balah</option>
              <option value="Rafah">Rafah</option>
              <option value="North Gaza">North Gaza</option>
              <option value="Middle Gaza">Middle Gaza</option>
            </select>
            {errors.area && <p className="text-xs text-red-500 mt-1">{errors.area.message}</p>}
          </div>

          <div>
            <label htmlFor="address" className="block text-base font-semibold text-slate-800 mb-2">
              Address
            </label>

            <textarea
              id="address"
              rows={2}
              {...register("address", {
                setValueAs: (value) => value?.trim() || "",
              })}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 text-slate-900 shadow-sm placeholder:text-slate-500 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-base px-4 py-3 transition hover:border-slate-300"
              placeholder="Street name, nearby landmarks, building number"
            />
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label htmlFor="imageUpload" className="block text-base font-semibold text-slate-800 mb-2">
              Upload image (optional)
            </label>
            <input
              id="imageUpload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploading}
              className="block w-full rounded-md border border-slate-200 bg-white text-slate-900 shadow-sm text-base px-4 py-3 cursor-pointer disabled:cursor-not-allowed"
            />
            {uploading && <p className="text-xs text-slate-500 mt-1">Uploading...</p>}
            {uploadError && <p className="text-xs text-red-500 mt-1">{uploadError}</p>}
          </div>
          {imageValue && (
            <div className="mt-3 space-y-2">
              <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                <img
                  src={imageValue}
                  alt="Selected issue image"
                  className="w-full max-w-full max-h-64 object-contain"
                />
              </div>
              <p className="text-xs text-green-700">
                Image ready:{" "}
                <a href={imageValue} target="_blank" rel="noreferrer" className="underline">
                </a>
                <button
                  type="button"
                  onClick={handleClearImage}
                  className="ml-3 text-blue-700 underline"
                >
                  Remove
                </button>
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {mutation.isError && (
          <p className="text-sm text-red-400">
            {(mutation.error as Error)?.message || "An unknown error occurred."}
          </p>
        )}

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end sm:gap-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-400 hover:bg-slate-50 cursor-pointer"
            >
              {cancelLabel ?? "Cancel"}
            </button>
          )}
          <button
            type="submit"
            disabled={!isDirty || mutation.isPending}
            className="inline-flex items-center justify-center rounded-md bg-gradient-to-r from-blue-700 via-indigo-600 to-fuchsia-600 px-6 py-3 text-base font-semibold text-white shadow-[0_16px_45px_-18px_rgba(59,130,246,0.65)] hover:-translate-y-0.5 hover:shadow-[0_20px_60px_-16px_rgba(99,102,241,0.55)] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
          >
            {mutation.isPending ? (
              <span className="flex items-center gap-2">
                <LoadingSkeleton count={1} variant="card" className="h-5 w-5 bg-white/30" />
                Saving...
              </span>
            ) : (
              resolvedSubmitLabel
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
