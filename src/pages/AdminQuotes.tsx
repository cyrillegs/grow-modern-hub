import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  Filter,
  LogOut,
  Mail,
  MoreVertical,
  Package,
  Phone,
  Search,
  XCircle,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import type { Database, QuoteStatus } from "@/types/database";

type Quote = Database["public"]["Tables"]["quotes"]["Row"];

const QUOTES_QUERY_KEY = ["quotes"] as const;

const formatId = (id: string) => `Q-${id.slice(0, 8)}`;

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const getStatusColor = (status: QuoteStatus) => {
  switch (status) {
    case "pending":
      return "bg-yellow-500/10 text-yellow-700 border-yellow-300";
    case "processed":
      return "bg-green-500/10 text-green-700 border-green-300";
    case "cancelled":
      return "bg-red-500/10 text-red-700 border-red-300";
  }
};

const getStatusIcon = (status: QuoteStatus) => {
  switch (status) {
    case "pending":
      return <Clock className="h-3 w-3" />;
    case "processed":
      return <CheckCircle className="h-3 w-3" />;
    case "cancelled":
      return <XCircle className="h-3 w-3" />;
  }
};

const AdminQuotes = () => {
  const { signOut } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | QuoteStatus>("all");
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  const { data: quotes, isLoading, isError } = useQuery<Quote[]>({
    queryKey: QUOTES_QUERY_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quotes")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: QuoteStatus }) => {
      const { error } = await supabase
        .from("quotes")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUOTES_QUERY_KEY });
    },
    onError: () => {
      toast({
        title: "Failed to update status",
        description: "Try again or check your connection.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("quotes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUOTES_QUERY_KEY });
      toast({ title: "Quote deleted" });
    },
    onError: () => {
      toast({
        title: "Failed to delete quote",
        description: "Try again or check your connection.",
        variant: "destructive",
      });
    },
  });

  const filteredQuotes = (quotes ?? []).filter((quote) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      quote.name.toLowerCase().includes(term) ||
      quote.email.toLowerCase().includes(term) ||
      quote.product.toLowerCase().includes(term) ||
      quote.id.toLowerCase().includes(term);

    const matchesStatus =
      statusFilter === "all" || quote.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: quotes?.length ?? 0,
    pending: quotes?.filter((q) => q.status === "pending").length ?? 0,
    processed: quotes?.filter((q) => q.status === "processed").length ?? 0,
    cancelled: quotes?.filter((q) => q.status === "cancelled").length ?? 0,
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <Navbar />
      <main className="pt-16">
        <div className="container px-4 py-8 max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">Quote Requests</h1>
              <p className="text-muted-foreground">
                Manage and respond to customer quote requests
              </p>
            </div>
            <Button variant="outline" onClick={signOut} className="gap-2 self-start">
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </div>

          {/* Error banner */}
          {isError && (
            <Card className="mb-6 border-destructive/40">
              <CardContent className="p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-destructive">Failed to load quotes</p>
                  <p className="text-sm text-muted-foreground">
                    Check your connection or refresh the page.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Total Requests</CardDescription>
                <CardTitle className="text-3xl">{stats.total}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Pending
                </CardDescription>
                <CardTitle className="text-3xl text-yellow-600">
                  {stats.pending}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Processed
                </CardDescription>
                <CardTitle className="text-3xl text-green-600">
                  {stats.processed}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2">
                  <XCircle className="h-4 w-4" />
                  Cancelled
                </CardDescription>
                <CardTitle className="text-3xl text-red-600">
                  {stats.cancelled}
                </CardTitle>
              </CardHeader>
            </Card>
          </div>

          {/* Filters and Search */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, email, product, or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <Filter className="h-4 w-4" />
                      Status: {statusFilter === "all" ? "All" : statusFilter}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                      All Requests
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter("pending")}>
                      Pending
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter("processed")}>
                      Processed
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter("cancelled")}>
                      Cancelled
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>

          {/* Quotes List */}
          <div className="space-y-4">
            {isLoading ? (
              [0, 1, 2].map((i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="space-y-3 animate-pulse">
                      <div className="h-4 w-32 bg-muted rounded" />
                      <div className="h-6 w-48 bg-muted rounded" />
                      <div className="h-4 w-64 bg-muted rounded" />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : filteredQuotes.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12 text-muted-foreground">
                  {quotes && quotes.length === 0
                    ? "No quote requests yet."
                    : "No quotes match your filters."}
                </CardContent>
              </Card>
            ) : (
              filteredQuotes.map((quote) => (
                <Card key={quote.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      {/* Left Section - Main Info */}
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <span className="text-sm font-mono text-muted-foreground">
                                {formatId(quote.id)}
                              </span>
                              <Badge
                                variant="outline"
                                className={`${getStatusColor(quote.status)} flex items-center gap-1`}
                              >
                                {getStatusIcon(quote.status)}
                                {quote.status}
                              </Badge>
                            </div>
                            <h3 className="text-xl font-semibold">{quote.name}</h3>
                            <p className="text-sm text-muted-foreground">{quote.email}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span>{quote.phone}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{formatDate(quote.created_at)}</span>
                          </div>
                          <div className="flex items-center gap-2 md:col-span-2">
                            <Package className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{quote.product}</span>
                            <span className="text-muted-foreground">- {quote.quantity}</span>
                          </div>
                        </div>

                        {quote.message && (
                          <div className="bg-muted/50 p-3 rounded-md">
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {quote.message}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Right Section - Actions */}
                      <div className="flex md:flex-col gap-2">
                        <Dialog
                          open={isDetailDialogOpen && selectedQuote?.id === quote.id}
                          onOpenChange={(open) => {
                            setIsDetailDialogOpen(open);
                            if (open) setSelectedQuote(quote);
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              className="flex-1 md:flex-none md:w-24"
                              onClick={() => {
                                setSelectedQuote(quote);
                                setIsDetailDialogOpen(true);
                              }}
                            >
                              View
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[600px]">
                            <DialogHeader>
                              <DialogTitle>Quote Request Details</DialogTitle>
                              <DialogDescription>
                                Request ID: {formatId(quote.id)}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label>Customer Name</Label>
                                  <p className="text-sm font-medium">{quote.name}</p>
                                </div>
                                <div className="space-y-2">
                                  <Label>Status</Label>
                                  <Badge
                                    variant="outline"
                                    className={`${getStatusColor(quote.status)} flex items-center gap-1 w-fit`}
                                  >
                                    {getStatusIcon(quote.status)}
                                    {quote.status}
                                  </Badge>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                  <Mail className="h-4 w-4" />
                                  Email
                                </Label>
                                <p className="text-sm">{quote.email}</p>
                              </div>

                              <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                  <Phone className="h-4 w-4" />
                                  Phone
                                </Label>
                                <p className="text-sm">{quote.phone}</p>
                              </div>

                              <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                  <Package className="h-4 w-4" />
                                  Product & Quantity
                                </Label>
                                <p className="text-sm font-medium">{quote.product}</p>
                                <p className="text-sm text-muted-foreground">{quote.quantity}</p>
                              </div>

                              <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4" />
                                  Request Date
                                </Label>
                                <p className="text-sm">{formatDate(quote.created_at)}</p>
                              </div>

                              <div className="space-y-2">
                                <Label>Additional Details</Label>
                                <p className="text-sm bg-muted p-3 rounded-md">
                                  {quote.message || "No additional details provided."}
                                </p>
                              </div>

                              <div className="flex gap-2 pt-4">
                                {quote.status === "pending" && (
                                  <>
                                    <Button
                                      className="flex-1"
                                      disabled={updateStatusMutation.isPending}
                                      onClick={() =>
                                        updateStatusMutation.mutate(
                                          { id: quote.id, status: "processed" },
                                          { onSuccess: () => setIsDetailDialogOpen(false) },
                                        )
                                      }
                                    >
                                      Mark as Processed
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      className="flex-1"
                                      disabled={updateStatusMutation.isPending}
                                      onClick={() =>
                                        updateStatusMutation.mutate(
                                          { id: quote.id, status: "cancelled" },
                                          { onSuccess: () => setIsDetailDialogOpen(false) },
                                        )
                                      }
                                    >
                                      Cancel Request
                                    </Button>
                                  </>
                                )}
                                {quote.status === "processed" && (
                                  <Button
                                    variant="outline"
                                    className="flex-1"
                                    disabled={updateStatusMutation.isPending}
                                    onClick={() =>
                                      updateStatusMutation.mutate(
                                        { id: quote.id, status: "pending" },
                                        { onSuccess: () => setIsDetailDialogOpen(false) },
                                      )
                                    }
                                  >
                                    Mark as Pending
                                  </Button>
                                )}
                                {quote.status === "cancelled" && (
                                  <Button
                                    variant="outline"
                                    className="flex-1"
                                    disabled={updateStatusMutation.isPending}
                                    onClick={() =>
                                      updateStatusMutation.mutate(
                                        { id: quote.id, status: "pending" },
                                        { onSuccess: () => setIsDetailDialogOpen(false) },
                                      )
                                    }
                                  >
                                    Reopen Request
                                  </Button>
                                )}
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {quote.status === "pending" && (
                              <>
                                <DropdownMenuItem
                                  onClick={() =>
                                    updateStatusMutation.mutate({
                                      id: quote.id,
                                      status: "processed",
                                    })
                                  }
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Mark as Processed
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    updateStatusMutation.mutate({
                                      id: quote.id,
                                      status: "cancelled",
                                    })
                                  }
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Cancel Request
                                </DropdownMenuItem>
                              </>
                            )}
                            {quote.status !== "pending" && (
                              <DropdownMenuItem
                                onClick={() =>
                                  updateStatusMutation.mutate({
                                    id: quote.id,
                                    status: "pending",
                                  })
                                }
                              >
                                <Clock className="h-4 w-4 mr-2" />
                                Mark as Pending
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => deleteMutation.mutate(quote.id)}
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminQuotes;
