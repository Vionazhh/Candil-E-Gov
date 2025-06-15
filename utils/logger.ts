/**
 * Logger utility for debugging application
 */
export const logger = {
  enabled: true, // Set false di production
  
  /**
   * Log general application message
   * @param component Component name
   * @param action Action being performed
   * @param data Optional data
   */
  log: (component: string, action: string, data?: any) => {
    if (logger.enabled) {
      console.log(`[${component}] ${action}`, data || "");
    }
  },
  
  /**
   * Log warning message
   * @param component Component name
   * @param action Action being performed
   * @param data Optional data
   */
  warn: (component: string, action: string, data?: any) => {
    if (logger.enabled) {
      console.warn(`[WARN:${component}] ${action}`, data || "");
    }
  },
  
  /**
   * Log Firestore database operations
   * @param collection Collection name
   * @param operation Database operation
   * @param path Collection path
   * @param data Optional data
   */
  firestore: (collection: string, operation: string, path: string, data?: any) => {
    if (logger.enabled) {
      console.log(`[Firestore:${collection}] ${operation}`, { path, data: data || undefined });
    }
  },
  
  /**
   * Log errors
   * @param component Component name
   * @param action Action that caused error
   * @param error Error object
   */
  error: (component: string, action: string, error: any) => {
    if (logger.enabled) {
      console.error(`[ERROR:${component}] ${action}`, error);
    }
  }
};