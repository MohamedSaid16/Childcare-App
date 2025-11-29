import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';

export const useFetch = (url, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token, logout } = useAuth();

  const fetchData = useCallback(async (fetchUrl = url, fetchOptions = options) => {
    try {
      setLoading(true);
      setError(null);

      const config = {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
          ...fetchOptions.headers,
        },
        ...fetchOptions,
      };

      const response = await fetch(fetchUrl, config);
      
      if (!response.ok) {
        if (response.status === 401) {
          logout();
          throw new Error('Authentication failed');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Request failed');
      }

      setData(result.data || result);
      return result;
    } catch (err) {
      const errorMessage = err.message || 'An error occurred while fetching data';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [url, options, token, logout]);

  useEffect(() => {
    if (url && !options.manual) {
      fetchData();
    }
  }, [fetchData, options.manual]);

  const refetch = useCallback((newUrl, newOptions) => {
    return fetchData(newUrl, newOptions);
  }, [fetchData]);

  const mutate = useCallback(async (newData, mutationOptions = {}) => {
    try {
      setLoading(true);
      setError(null);

      const config = {
        method: mutationOptions.method || 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
          ...mutationOptions.headers,
        },
        body: JSON.stringify(newData),
      };

      const response = await fetch(mutationOptions.url || url, config);
      
      if (!response.ok) {
        if (response.status === 401) {
          logout();
          throw new Error('Authentication failed');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Mutation failed');
      }

      // Update local data if optimistic update is enabled
      if (mutationOptions.optimisticUpdate) {
        setData(prevData => mutationOptions.optimisticUpdate(prevData, newData));
      }

      // Refetch data if needed
      if (mutationOptions.revalidate) {
        await fetchData();
      }

      return result;
    } catch (err) {
      const errorMessage = err.message || 'An error occurred while mutating data';
      setError(errorMessage);
      
      // Revert optimistic update on error
      if (mutationOptions.optimisticUpdate && mutationOptions.onError) {
        mutationOptions.onError(err);
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, [url, token, logout, fetchData]);

  return {
    data,
    loading,
    error,
    refetch,
    mutate,
    setData // For manual data updates
  };
};

// Specialized hooks for common operations
export const useApiGet = (url, options = {}) => {
  return useFetch(url, { ...options, method: 'GET' });
};

export const useApiPost = (url, options = {}) => {
  const [mutate, setMutate] = useState(null);
  
  const hook = useFetch(url, { ...options, method: 'POST', manual: true });
  
  useEffect(() => {
    setMutate(() => hook.mutate);
  }, [hook.mutate]);

  return {
    ...hook,
    mutate
  };
};

export const useApiPut = (url, options = {}) => {
  const [mutate, setMutate] = useState(null);
  
  const hook = useFetch(url, { ...options, method: 'PUT', manual: true });
  
  useEffect(() => {
    setMutate(() => hook.mutate);
  }, [hook.mutate]);

  return {
    ...hook,
    mutate
  };
};

export const useApiDelete = (url, options = {}) => {
  const [mutate, setMutate] = useState(null);
  
  const hook = useFetch(url, { ...options, method: 'DELETE', manual: true });
  
  useEffect(() => {
    setMutate(() => hook.mutate);
  }, [hook.mutate]);

  return {
    ...hook,
    mutate
  };
};

// Hook for paginated data
export const usePaginatedFetch = (url, initialPage = 1, pageSize = 10) => {
  const [page, setPage] = useState(initialPage);
  const [total, setTotal] = useState(0);
  
  const { data, loading, error, refetch } = useFetch(
    `${url}?page=${page}&limit=${pageSize}`
  );

  useEffect(() => {
    if (data?.total) {
      setTotal(data.total);
    }
  }, [data]);

  const goToPage = (newPage) => {
    setPage(newPage);
  };

  const nextPage = () => {
    if (page < Math.ceil(total / pageSize)) {
      setPage(prev => prev + 1);
    }
  };

  const prevPage = () => {
    if (page > 1) {
      setPage(prev => prev - 1);
    }
  };

  return {
    data: data?.data || data,
    loading,
    error,
    page,
    pageSize,
    total,
    totalPages: Math.ceil(total / pageSize),
    goToPage,
    nextPage,
    prevPage,
    refetch: () => refetch(`${url}?page=${page}&limit=${pageSize}`)
  };
};

// Hook for infinite scrolling
export const useInfiniteFetch = (url, pageSize = 10) => {
  const [page, setPage] = useState(1);
  const [data, setData] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  
  const { data: fetchedData, loading, error, refetch } = useFetch(
    `${url}?page=${page}&limit=${pageSize}`
  );

  useEffect(() => {
    if (fetchedData) {
      if (Array.isArray(fetchedData.data)) {
        if (page === 1) {
          setData(fetchedData.data);
        } else {
          setData(prev => [...prev, ...fetchedData.data]);
        }
        
        setHasMore(fetchedData.data.length === pageSize);
      } else if (Array.isArray(fetchedData)) {
        if (page === 1) {
          setData(fetchedData);
        } else {
          setData(prev => [...prev, ...fetchedData]);
        }
        
        setHasMore(fetchedData.length === pageSize);
      }
    }
  }, [fetchedData, page, pageSize]);

  const loadMore = () => {
    if (hasMore && !loading) {
      setPage(prev => prev + 1);
    }
  };

  const refresh = () => {
    setPage(1);
    setData([]);
    setHasMore(true);
    refetch(`${url}?page=1&limit=${pageSize}`);
  };

  return {
    data,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
    page
  };
};

export default useFetch;