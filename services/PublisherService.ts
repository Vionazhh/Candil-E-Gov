import { COLLECTIONS, getSubcollectionRef } from "@/config/firestore";
import { Publisher } from "@/types/Book";
import { logger } from "@/utils/logger";
import {
    CollectionReference,
    getDocs,
    orderBy,
    query,
    QueryDocumentSnapshot,
    where
} from "firebase/firestore";
import { BaseService, ListResponse } from "./BaseService";

/**
 * Extended Publisher interface with additional fields for PublisherService
 */
export interface PublisherDetailed extends Publisher {
    website?: string;
    email?: string;
    phone?: string;
    description?: string;
    bookCount?: number;
}

/**
 * Service for managing publishers
 */
export class PublisherService extends BaseService<PublisherDetailed> {
    constructor() {
        super(COLLECTIONS.PUBLISHERS);
    }

    /**
     * Get all publishers with pagination
     * @param page Page number
     * @param pageSize Number of items per page
     * @returns List of publishers with pagination
     */
    async getAllPublishers(page = 1, pageSize = 20): Promise<ListResponse<PublisherDetailed>> {
        try {
            return await this.getAll({
                page,
                limit: pageSize,
                orderByField: "name",
                orderDirection: "asc"
            });
        } catch (error) {
            logger.error('PublisherService', 'Failed to get publishers', error);
            return {
                items: [],
                page,
                limit: pageSize,
                total: 0,
                hasMore: false
            };
        }
    }

    /**
     * Search publishers by name
     * @param searchTerm Search term
     * @param page Page number
     * @param pageSize Number of items per page
     * @returns List of publishers matching the search term
     */
    async searchPublishers(searchTerm: string, page = 1, pageSize = 20): Promise<ListResponse<PublisherDetailed>> {
        try {
            return await this.search("name", searchTerm, {
                page,
                limit: pageSize
            });
        } catch (error) {
            logger.error('PublisherService', 'Failed to search publishers', error);
            return {
                items: [],
                page,
                limit: pageSize,
                total: 0,
                hasMore: false
            };
        }
    }

    /**
     * Get a publisher by ID
     * @param id Publisher ID
     * @returns Publisher details or null if not found
     */
    async getPublisherById(id: string): Promise<PublisherDetailed | null> {
        try {
            return await this.getById(id);
        } catch (error) {
            logger.error('PublisherService', `Failed to get publisher with ID: ${id}`, error);
            return null;
        }
    }

    /**
     * Create a new publisher
     * @param publisher Publisher data
     * @returns Created publisher with ID
     */
    async createPublisher(publisher: Omit<PublisherDetailed, 'id'>): Promise<PublisherDetailed> {
        return this.create(publisher);
    }

    /**
     * Update a publisher
     * @param id Publisher ID
     * @param data Publisher data to update
     * @returns Updated publisher
     */
    async updatePublisher(id: string, data: Partial<PublisherDetailed>): Promise<PublisherDetailed> {
        return this.update(id, data);
    }

    /**
     * Delete a publisher
     * @param id Publisher ID
     * @returns True if successful
     */
    async deletePublisher(id: string): Promise<boolean> {
        return this.delete(id);
    }
}

// Export singleton instance
const publisherService = new PublisherService();
export default publisherService;
