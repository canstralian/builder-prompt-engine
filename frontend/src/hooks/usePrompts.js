/**
 * React Query hooks for prompt CRUD operations and execution.
 *
 * Provides cached, deduplicated data fetching with automatic
 * background refetching and optimistic updates.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../services/api";

const PROMPTS_KEY = ["prompts"];

/**
 * Fetch all prompts with optional category filter.
 *
 * @param {string} [category] - Optional category to filter by.
 * @returns {import("@tanstack/react-query").UseQueryResult}
 */
export function usePrompts(category) {
  return useQuery({
    queryKey: [...PROMPTS_KEY, { category }],
    queryFn: async () => {
      const params = category ? { category } : {};
      const { data } = await api.get("/prompts", { params });
      return data;
    },
  });
}

/**
 * Fetch a single prompt by ID.
 *
 * @param {string} id - Prompt UUID.
 * @returns {import("@tanstack/react-query").UseQueryResult}
 */
export function usePrompt(id) {
  return useQuery({
    queryKey: [...PROMPTS_KEY, id],
    queryFn: async () => {
      const { data } = await api.get(`/prompts/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

/**
 * Create a new prompt template.
 *
 * @returns {import("@tanstack/react-query").UseMutationResult}
 */
export function useCreatePrompt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newPrompt) => {
      const { data } = await api.post("/prompts", newPrompt);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROMPTS_KEY });
    },
  });
}

/**
 * Update a prompt (creates a new version).
 *
 * @returns {import("@tanstack/react-query").UseMutationResult}
 */
export function useUpdatePrompt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }) => {
      const { data } = await api.put(`/prompts/${id}`, updates);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROMPTS_KEY });
    },
  });
}

/**
 * Delete a prompt by ID.
 *
 * @returns {import("@tanstack/react-query").UseMutationResult}
 */
export function useDeletePrompt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      await api.delete(`/prompts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROMPTS_KEY });
    },
  });
}

/**
 * Execute a prompt against an LLM provider.
 *
 * @returns {import("@tanstack/react-query").UseMutationResult}
 */
export function useExecutePrompt() {
  return useMutation({
    mutationFn: async ({ promptId, ...executionData }) => {
      const { data } = await api.post(
        `/prompts/${promptId}/execute`,
        executionData
      );
      return data;
    },
  });
}
