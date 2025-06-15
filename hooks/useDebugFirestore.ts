export const useDebugFirestore = (collectionName: string) => {
  return {
    logOperation: (operation: string, data?: any) => {
      if (__DEV__) {
        console.log(`[${collectionName}] ${operation}`, data || '');
      }
    }
  };
};
