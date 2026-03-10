import { prisma } from "@/lib/prisma";

/**
 * Based on the text content of a ticket, tries to find relevant knowledge base articles.
 * Uses a simple full-text search approach matching subject/description keywords against KB articles.
 */
export async function suggestKnowledgeBase(subject: string, description: string, categoryId?: number) {
    const searchText = `${subject} ${description}`.toLowerCase();
    
    // Extract keywords (simplistic tokenize: split by non-word, filter short words)
    const keywords = searchText.split(/\W+/)
                               .filter(word => word.length > 4)
                               .slice(0, 10); // Take first 10 significant keywords

    if (keywords.length === 0) return [];

    const OR_Conditions = keywords.map(keyword => ({
        OR: [
            { title: { contains: keyword, mode: 'insensitive' as const } },
            { issue: { contains: keyword, mode: 'insensitive' as const } },
            { solution: { contains: keyword, mode: 'insensitive' as const } }
        ]
    }));

    // Build the query
    const queryParams: any = {
        where: { OR: OR_Conditions },
        take: 3, // limit to top 3 suggestions
    };

    // Optionally boost by category if provided
    if (categoryId) {
        // Could do more complex scoring, but for standard Prisma, we just filter or sort.
        // Easiest is to prefer same category and then fallback, 
        // but just querying globally is better if category was misclassified.
        // We will just return the most relevant using OR.
    }

    const suggestions = await prisma.knowledgeBase.findMany(queryParams);
    return suggestions;
}
