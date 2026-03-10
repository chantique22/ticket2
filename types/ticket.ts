export type TicketStatus = "OPEN" | "ON_HOLD" | "ON_GOING" | "RESOLVED";
export type TicketPriority = "LOW" | "NORMAL" | "HIGH" | "URGENT";

export interface Ticket {
    id: number;
    details: string;
    pcName: string;
    status: TicketStatus;
    priority: TicketPriority;
    reportBy: string;
    pic?: string | null;
    analysis?: string | null;
    correction?: string | null;
    prevention?: string | null;
    action?: string | null;
    startTime?: string | Date | null;
    finishTime?: string | Date | null;
    createdAt: string | Date;
    updatedAt: string | Date;
    userId: string;
    // Formatted fields for frontend
    user?: string | null;
    division?: string | null;
    category?: string | null;
    subCategory?: string | null;
}

export interface Category {
    id: number;
    name: string;
    subCategories: SubCategory[];
}

export interface SubCategory {
    id: number;
    name: string;
    categoryId: number;
}
