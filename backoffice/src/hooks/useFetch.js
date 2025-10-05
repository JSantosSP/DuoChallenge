import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';

export const useFetch = (key, fetchFn, options = {}) => {
  return useQuery({
    queryKey: [key],
    queryFn: fetchFn,
    ...options
  });
};

export const useCreate = (key, createFn) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [key] });
    }
  });
};

export const useUpdate = (key, updateFn) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [key] });
    }
  });
};

export const useDelete = (key, deleteFn) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [key] });
    }
  });
};