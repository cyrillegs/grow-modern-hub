import { useState } from "react";
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
  Search,
  MoreVertical,
  CheckCircle,
  Clock,
  XCircle,
  Mail,
  Phone,
  Package,
  Calendar,
  Filter,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Mock data - In a real app, this would come from your backend/database
const mockQuotes = [
  {
    id: "Q001",
    name: "Juan Dela Cruz",
    email: "juan@example.com",
    phone: "+63 912 345 6789",
    product: "NPK 20-20-20",
    quantity: "100 bags",
    message: "Need this for my 5-hectare corn farm. Delivery to Nueva Ecija.",
    status: "pending",
    date: "2024-12-08T10:30:00",
  },
  {
    id: "Q002",
    name: "Maria Santos",
    email: "maria.santos@farm.com",
    phone: "+63 917 654 3210",
    product: "Urea (46-0-0)",
    quantity: "200 bags",
    message: "Bulk order for cooperative. Need best price for 200 bags.",
    status: "processed",
    date: "2024-12-07T14:20:00",
  },
  {
    id: "Q003",
    name: "Pedro Reyes",
    email: "pedro.reyes@gmail.com",
    phone: "+63 905 123 4567",
    product: "Organic Compost Blend",
    quantity: "50 bags",
    message: "Interested in organic fertilizer for vegetable garden.",
    status: "pending",
    date: "2024-12-08T09:15:00",
  },
  {
    id: "Q004",
    name: "Ana Garcia",
    email: "ana.garcia@agri.ph",
    phone: "+63 918 765 4321",
    product: "DAP (18-46-0)",
    quantity: "150 bags",
    message: "For rice planting season. Need delivery schedule.",
    status: "cancelled",
    date: "2024-12-06T16:45:00",
  },
  {
    id: "Q005",
    name: "Roberto Cruz",
    email: "roberto@farmcoop.ph",
    phone: "+63 922 333 4444",
    product: "Liquid NPK 10-5-5",
    quantity: "500 gallons",
    message: "Large scale operation. Looking for volume discount.",
    status: "processed",
    date: "2024-12-05T11:00:00",
  },
];

const AdminQuotes = () => {
  const [quotes, setQuotes] = useState(mockQuotes);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/10 text-yellow-700 border-yellow-300";
      case "processed":
        return "bg-green-500/10 text-green-700 border-green-300";
      case "cancelled":
        return "bg-red-500/10 text-red-700 border-red-300";
      default:
        return "bg-gray-500/10 text-gray-700 border-gray-300";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="h-3 w-3" />;
      case "processed":
        return <CheckCircle className="h-3 w-3" />;
      case "cancelled":
        return <XCircle className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const updateQuoteStatus = (id, newStatus) => {
    setQuotes(
      quotes.map((q) => (q.id === id ? { ...q, status: newStatus } : q))
    );
  };

  const deleteQuote = (id) => {
    setQuotes(quotes.filter((q) => q.id !== id));
  };

  const filteredQuotes = quotes.filter((quote) => {
    const matchesSearch =
      quote.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || quote.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: quotes.length,
    pending: quotes.filter((q) => q.status === "pending").length,
    processed: quotes.filter((q) => q.status === "processed").length,
    cancelled: quotes.filter((q) => q.status === "cancelled").length,
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <Navbar />
      <main className="pt-16">
        <div className="container px-4 py-8 max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Quote Requests</h1>
            <p className="text-muted-foreground">
              Manage and respond to customer quote requests
            </p>
          </div>

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
                    <DropdownMenuItem
                      onClick={() => setStatusFilter("pending")}
                    >
                      Pending
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setStatusFilter("processed")}
                    >
                      Processed
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setStatusFilter("cancelled")}
                    >
                      Cancelled
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>

          {/* Quotes List */}
          <div className="space-y-4">
            {filteredQuotes.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12 text-muted-foreground">
                  No quote requests found
                </CardContent>
              </Card>
            ) : (
              filteredQuotes.map((quote) => (
                <Card
                  key={quote.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      {/* Left Section - Main Info */}
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <span className="text-sm font-mono text-muted-foreground">
                                {quote.id}
                              </span>
                              <Badge
                                variant="outline"
                                className={`${getStatusColor(
                                  quote.status
                                )} flex items-center gap-1`}
                              >
                                {getStatusIcon(quote.status)}
                                {quote.status}
                              </Badge>
                            </div>
                            <h3 className="text-xl font-semibold">
                              {quote.name}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {quote.email}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span>{quote.phone}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{formatDate(quote.date)}</span>
                          </div>
                          <div className="flex items-center gap-2 md:col-span-2">
                            <Package className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{quote.product}</span>
                            <span className="text-muted-foreground">
                              - {quote.quantity}
                            </span>
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
                          open={
                            isDetailDialogOpen && selectedQuote?.id === quote.id
                          }
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
                                Request ID: {quote.id}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label>Customer Name</Label>
                                  <p className="text-sm font-medium">
                                    {quote.name}
                                  </p>
                                </div>
                                <div className="space-y-2">
                                  <Label>Status</Label>
                                  <Badge
                                    variant="outline"
                                    className={`${getStatusColor(
                                      quote.status
                                    )} flex items-center gap-1 w-fit`}
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
                                <p className="text-sm font-medium">
                                  {quote.product}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {quote.quantity}
                                </p>
                              </div>

                              <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4" />
                                  Request Date
                                </Label>
                                <p className="text-sm">
                                  {formatDate(quote.date)}
                                </p>
                              </div>

                              <div className="space-y-2">
                                <Label>Additional Details</Label>
                                <p className="text-sm bg-muted p-3 rounded-md">
                                  {quote.message ||
                                    "No additional details provided."}
                                </p>
                              </div>

                              <div className="flex gap-2 pt-4">
                                {quote.status === "pending" && (
                                  <>
                                    <Button
                                      className="flex-1"
                                      onClick={() => {
                                        updateQuoteStatus(
                                          quote.id,
                                          "processed"
                                        );
                                        setIsDetailDialogOpen(false);
                                      }}
                                    >
                                      Mark as Processed
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      className="flex-1"
                                      onClick={() => {
                                        updateQuoteStatus(
                                          quote.id,
                                          "cancelled"
                                        );
                                        setIsDetailDialogOpen(false);
                                      }}
                                    >
                                      Cancel Request
                                    </Button>
                                  </>
                                )}
                                {quote.status === "processed" && (
                                  <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => {
                                      updateQuoteStatus(quote.id, "pending");
                                      setIsDetailDialogOpen(false);
                                    }}
                                  >
                                    Mark as Pending
                                  </Button>
                                )}
                                {quote.status === "cancelled" && (
                                  <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => {
                                      updateQuoteStatus(quote.id, "pending");
                                      setIsDetailDialogOpen(false);
                                    }}
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
                                    updateQuoteStatus(quote.id, "processed")
                                  }
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Mark as Processed
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    updateQuoteStatus(quote.id, "cancelled")
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
                                  updateQuoteStatus(quote.id, "pending")
                                }
                              >
                                <Clock className="h-4 w-4 mr-2" />
                                Mark as Pending
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => deleteQuote(quote.id)}
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
