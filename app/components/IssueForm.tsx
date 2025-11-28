"use client";

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
  image?: string;
};

type IssueFormProps = {
  initialValues?: Partial<IssueFormValues>;
  onSuccessRedirect?: string;
  submitLabel?: string;
};

type ApiResponse<T> = {
  success: boolean;
  data: T;
  error?: string;
};

export default function IssueForm({
  initialValues,
  onSuccessRedirect = "/",
  submitLabel = "Create Issue",
}: IssueFormProps) {
  const router = useRouter();
  const api = useApiFetcher();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<IssueFormValues>({
    defaultValues: {
      title: initialValues?.title ?? "",
      description: initialValues?.description ?? "",
      type: initialValues?.type ?? "",
      area: initialValues?.area ?? "",
      image: initialValues?.image ?? "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: IssueFormValues) => {
      const response = await api<ApiResponse<Record<string, unknown>>>({
        url: "/issues",
        method: "POST",
        data,
      });

      if (!response.success) {
        throw new Error(response.error || "Failed to create issue");
      }

      return response.data;
    },
    onSuccess: () => {
      toast.success("Issue saved successfully");
      reset();
      router.push(onSuccessRedirect);
    },
    onError: (error: unknown) => {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    },
  });

  const onSubmit = (data: IssueFormValues) => mutation.mutate(data);

  return (
    <form
      className="space-y-6"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="grid gap-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            id="title"
            type="text"
            {...register("title", { required: "Title is required", minLength: { value: 3, message: "Title must be at least 3 characters" } })}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
            placeholder="e.g., Broken streetlight near Elm St."
          />
          {errors.title && <p className="text-xs text-red-600 mt-1">{errors.title.message}</p>}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            rows={4}
            {...register("description", { required: "Description is required", minLength: { value: 6, message: "Description must be at least 6 characters" } })}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
            placeholder="Describe the issue in detail..."
          />
          {errors.description && <p className="text-xs text-red-600 mt-1">{errors.description.message}</p>}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <input
              id="type"
              type="text"
              {...register("type", { required: "Type is required", minLength: { value: 2, message: "Type must be at least 2 characters" } })}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              placeholder="e.g., Lighting"
            />
            {errors.type && <p className="text-xs text-red-600 mt-1">{errors.type.message}</p>}
          </div>

          <div>
            <label htmlFor="area" className="block text-sm font-medium text-gray-700 mb-1">
              Area
            </label>
            <input
              id="area"
              type="text"
              {...register("area", { required: "Area is required" })}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              placeholder="e.g., Elm Street"
            />
            {errors.area && <p className="text-xs text-red-600 mt-1">{errors.area.message}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
            Image URL (optional)
          </label>
          <input
            id="image"
            type="url"
            {...register("image", {
              pattern: {
                value: /^(https?:\/\/)/i,
                message: "Please enter a valid URL",
              },
            })}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
            placeholder="https://example.com/photo.jpg"
          />
          {errors.image && <p className="text-xs text-red-600 mt-1">{errors.image.message}</p>}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {mutation.isError && (
          <p className="text-sm text-red-600">
            {(mutation.error as Error)?.message || "An unknown error occurred."}
          </p>
        )}

        <button
          type="submit"
          disabled={mutation.isPending}
          className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {mutation.isPending ? (
            <span className="flex items-center gap-2">
              <LoadingSkeleton count={1} variant="card" className="h-5 w-5 bg-white/30" />
              Saving...
            </span>
          ) : (
            submitLabel
          )}
        </button>
      </div>
    </form>
  );
}

