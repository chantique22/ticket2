"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { CheckCircle, BookOpen, Loader2 } from "lucide-react"
import Link from "next/link"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { KnowledgeBase } from "@prisma/client"

function SuccessCard() {
    const searchParams = useSearchParams()
    const ticketId = searchParams.get("id")

    const [suggestions, setSuggestions] = useState<KnowledgeBase[]>([])
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        let mounted = true;

        async function fetchSuggestions() {
            if (!ticketId) return;
            setIsLoading(true);
            try {
                const res = await fetch(`/api/tickets/${ticketId}/suggestions`);
                const data = await res.json();
                if (mounted && data.suggestions) {
                    setSuggestions(data.suggestions);
                }
            } catch (err) {
                console.error("Could not fetch KB suggestions", err);
            } finally {
                if (mounted) setIsLoading(false);
            }
        }

        fetchSuggestions();
        return () => { mounted = false; };
    }, [ticketId])

    return (
        <>
            <Card className="w-full max-w-xl text-center shadow-lg border-2 border-green-500/20">
                <CardHeader>
                    <div className="flex justify-center mb-4">
                        <CheckCircle className="h-20 w-20 text-green-500 animate-in zoom-in duration-500" />
                    </div>
                    <CardTitle className="text-3xl">Ticket Submitted!</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground text-lg">
                        Your ticket {ticketId ? `#${ticketId}` : ''} has been successfully created. Our support team will review it shortly.
                    </p>
                </CardContent>
                <CardFooter className="flex justify-center gap-4">
                    <Button asChild variant="outline" size="lg">
                        <Link href="/">Back to Dashboard</Link>
                    </Button>
                    <Button asChild size="lg">
                        <Link href="/ticket/new">Submit Another</Link>
                    </Button>
                </CardFooter>
            </Card>

            {isLoading && (
                <div className="flex items-center gap-2 text-muted-foreground mt-4">
                    <Loader2 className="h-4 w-4 animate-spin" /> Looking for instant solutions...
                </div>
            )}

            {!isLoading && suggestions.length > 0 && (
                <Card className="w-full max-w-2xl shadow-md border-t-4 border-t-primary">
                    <CardHeader className="bg-muted/30">
                        <div className="flex items-center gap-2">
                            <BookOpen className="h-5 w-5 text-primary" />
                            <CardTitle>Suggested Solutions</CardTitle>
                        </div>
                        <CardDescription>
                            While you wait, these knowledge base articles might resolve your issue immediately.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <Accordion type="single" collapsible className="w-full">
                            {suggestions.map((suggestion, index) => (
                                <AccordionItem key={suggestion.id} value={`item-${index}`}>
                                    <AccordionTrigger className="text-left font-medium hover:text-primary transition-colors">
                                        {suggestion.title}
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <div className="space-y-4 text-sm text-muted-foreground pt-2">
                                            <div className="bg-muted/50 p-4 rounded-md border">
                                                <h4 className="font-semibold text-foreground mb-1">Issue Context:</h4>
                                                <p>{suggestion.issue}</p>
                                            </div>
                                            <div className="bg-primary/5 p-4 rounded-md border border-primary/20">
                                                <h4 className="font-semibold text-primary mb-1">Resolution / Steps:</h4>
                                                <div className="whitespace-pre-wrap text-foreground/90">{suggestion.solution}</div>
                                            </div>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </CardContent>
                </Card>
            )}
        </>
    )
}

export default function TicketSuccessPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 py-10">
            <Suspense fallback={<div className="flex items-center justify-center p-10"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
                <SuccessCard />
            </Suspense>
        </div>
    )
}

