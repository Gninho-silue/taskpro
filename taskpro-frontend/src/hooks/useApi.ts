import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

interface ApiState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

export const useApi = <T>(
  apiCall: () => Promise<T>,
  dependencies: any[] = []
) => {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      try {
        const result = await apiCall();
        if (isMounted) {
          setState({
            data: result,
            isLoading: false,
            error: null,
          });
        }
      } catch (error: any) {
        if (isMounted) {
          const errorMessage = error.response?.data?.message || error.message || 'Une erreur est survenue';
          setState({
            data: null,
            isLoading: false,
            error: errorMessage,
          });
          toast.error(errorMessage);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, dependencies);

  const refetch = () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    apiCall()
      .then(result => {
        setState({
          data: result,
          isLoading: false,
          error: null,
        });
      })
      .catch(error => {
        const errorMessage = error.response?.data?.message || error.message || 'Une erreur est survenue';
        setState({
          data: null,
          isLoading: false,
          error: errorMessage,
        });
        toast.error(errorMessage);
      });
  };

  return {
    ...state,
    refetch,
  };
};