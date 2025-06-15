import { COLLECTIONS } from "@/config/firestore";
import { Category } from "@/types/Category";
import { BaseService } from "./BaseService";

/**
 * Service for managing categories
 */
export class CategoryService extends BaseService<Category> {
  constructor() {
    super(COLLECTIONS.CATEGORIES);
    
    // Ensure root document exists
    // this.ensureRootDocumentExists().catch(err => 
    //   console.error("Failed to ensure root document", err)
    // );
  }

  /**
   * Get all categories
   * @param page Page number
   * @param limit Items per page
   * @returns List response with categories
   */
  async getAllCategories(page = 1, limit = 50) {
    return this.getAll({
      page,
      limit,
      orderByField: "title",
      orderDirection: "asc"
    });
  }

  /**
   * Get featured categories
   * @param limit Maximum number of categories to return
   * @returns List response with featured categories
   */
  async getFeaturedCategories(limit = 10) {
    return this.getAll({
      limit,
      filters: [["featured", "==", true]],
      orderByField: "title",
      orderDirection: "asc"
    });
  }
}

/**
 * Singleton instance of CategoryService
 */
export const categoryService = new CategoryService();

export default categoryService;
