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
  Archive,
  Calendar,
  CheckCircle,
  Filter,
  Inbox,
  Mail,
  MoreVertical,
  Phone,
  Search,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { AdminRepliesList } from "@/components/admin/AdminRepliesList";
import { ReplyDialog } from "@/components/admin/ReplyDialog";
import type { ContactStatus, Database } from "@/types/database";

type Contact = Database["public"]["Tables"]["contacts"]["Row"];

const CONTACTS_QUERY_KEY = ["contacts"] as const;

const formatId = (id: string) => `C-${id.slice(0, 8)}`;

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const getStatusColor = (status: ContactStatus) => {
  switch (status) {
    case "new":
      return "bg-yellow-500/10 text-yellow-700 border-yellow-300";
    case "replied":
      return "bg-green-500/10 text-green-700 border-green-300";
    case "archived":
      return "bg-gray-500/10 text-gray-700 border-gray-300";
  }
};

const getStatusIcon = (status: ContactStatus) => {
  switch (status) {
    case "new":
      return <Inbox className="h-3 w-3" />;
    case "replied":
      return <CheckCircle className="h-3 w-3" />;
    case "archived":
      return <Archive className="h-3 w-3" />;
  }
};

export const ContactsPanel = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | ContactStatus>("all");
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  const { data: contacts, isLoading, isError } = useQuery<Contact[]>({
    queryKey: CONTACTS_QUERY_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contacts")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ContactStatus }) => {
      const { error } = await supabase
        .from("contacts")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONTACTS_QUERY_KEY });
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
      const { error } = await supabase.from("contacts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONTACTS_QUERY_KEY });
      toast({ title: "Contact deleted" });
    },
    onError: () => {
      toast({
        title: "Failed to delete contact",
        description: "Try again or check your connection.",
        variant: "destructive",
      });
    },
  });

  const filteredContacts = (contacts ?? []).filter((contact) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      contact.name.toLowerCase().includes(term) ||
      contact.email.toLowerCase().includes(term) ||
      contact.message.toLowerCase().includes(term) ||
      contact.id.toLowerCase().includes(term);

    const matchesStatus =
      statusFilter === "all" || contact.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: contacts?.length ?? 0,
    new: contacts?.filter((c) => c.status === "new").length ?? 0,
    replied: contacts?.filter((c) => c.status === "replied").length ?? 0,
    archived: contacts?.filter((c) => c.status === "archived").length ?? 0,
  };

  return (
    <div>
      {isError && (
        <Card className="mb-6 border-destructive/40">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-destructive">Failed to load contacts</p>
              <p className="text-sm text-muted-foreground">
                Check your connection or refresh the page.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards — also act as filter chips */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {(
          [
            { value: "all", label: "Total Messages", count: stats.total, icon: null, accent: "" },
            { value: "new", label: "New", count: stats.new, icon: <Inbox className="h-4 w-4" />, accent: "text-yellow-600" },
            { value: "replied", label: "Replied", count: stats.replied, icon: <CheckCircle className="h-4 w-4" />, accent: "text-green-600" },
            { value: "archived", label: "Archived", count: stats.archived, icon: <Archive className="h-4 w-4" />, accent: "text-gray-600" },
          ] as const
        ).map(({ value, label, count, icon, accent }) => {
          const isActive = statusFilter === value;
          return (
            <Card
              key={value}
              role="button"
              tabIndex={0}
              aria-pressed={isActive}
              onClick={() => setStatusFilter(value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setStatusFilter(value);
                }
              }}
              className={`cursor-pointer transition-all hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                isActive ? "ring-2 ring-primary shadow-md" : ""
              }`}
            >
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2">
                  {icon}
                  {label}
                </CardDescription>
                <CardTitle className={`text-3xl ${accent}`}>{count}</CardTitle>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, message, or ID..."
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
                <DropdownMenuItem onClick={() => setStatusFilter("all")}>All Messages</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("new")}>New</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("replied")}>Replied</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("archived")}>Archived</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {/* Contacts List */}
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
        ) : filteredContacts.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12 text-muted-foreground">
              {contacts && contacts.length === 0
                ? "No contact messages yet."
                : "No messages match your filters."}
            </CardContent>
          </Card>
        ) : (
          filteredContacts.map((contact) => (
            <Card key={contact.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-sm font-mono text-muted-foreground">{formatId(contact.id)}</span>
                          <Badge variant="outline" className={`${getStatusColor(contact.status)} flex items-center gap-1`}>
                            {getStatusIcon(contact.status)}
                            {contact.status}
                          </Badge>
                        </div>
                        <h3 className="text-xl font-semibold">{contact.name}</h3>
                        <p className="text-sm text-muted-foreground">{contact.email}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{contact.phone ?? "(no phone)"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{formatDate(contact.created_at)}</span>
                      </div>
                    </div>

                    <div className="bg-muted/50 p-3 rounded-md">
                      <p className="text-sm text-muted-foreground line-clamp-2">{contact.message}</p>
                    </div>
                  </div>

                  <div className="flex md:flex-col gap-2">
                    <Dialog
                      open={isDetailDialogOpen && selectedContact?.id === contact.id}
                      onOpenChange={(open) => {
                        setIsDetailDialogOpen(open);
                        if (open) setSelectedContact(contact);
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="flex-1 md:flex-none md:w-24"
                          onClick={() => {
                            setSelectedContact(contact);
                            setIsDetailDialogOpen(true);
                          }}
                        >
                          View
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                          <DialogTitle>Contact Message Details</DialogTitle>
                          <DialogDescription>Message ID: {formatId(contact.id)}</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>From</Label>
                              <p className="text-sm font-medium">{contact.name}</p>
                            </div>
                            <div className="space-y-2">
                              <Label>Status</Label>
                              <Badge variant="outline" className={`${getStatusColor(contact.status)} flex items-center gap-1 w-fit`}>
                                {getStatusIcon(contact.status)}
                                {contact.status}
                              </Badge>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                              <Mail className="h-4 w-4" />
                              Email
                            </Label>
                            <p className="text-sm">{contact.email}</p>
                          </div>

                          <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                              <Phone className="h-4 w-4" />
                              Phone
                            </Label>
                            <p className="text-sm">{contact.phone ?? "(not provided)"}</p>
                          </div>

                          <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              Received
                            </Label>
                            <p className="text-sm">{formatDate(contact.created_at)}</p>
                          </div>

                          <div className="space-y-2">
                            <Label>Message</Label>
                            <p className="text-sm bg-muted p-3 rounded-md whitespace-pre-wrap">{contact.message}</p>
                          </div>

                          <div className="space-y-2 pt-2">
                            <Label>Reply History</Label>
                            <AdminRepliesList sourceTable="contacts" sourceId={contact.id} />
                          </div>

                          <div className="flex gap-2 pt-4">
                            {contact.status === "new" && (
                              <>
                                <Button
                                  className="flex-1"
                                  disabled={updateStatusMutation.isPending}
                                  onClick={() =>
                                    updateStatusMutation.mutate(
                                      { id: contact.id, status: "replied" },
                                      { onSuccess: () => setIsDetailDialogOpen(false) },
                                    )
                                  }
                                >
                                  Mark as Replied
                                </Button>
                                <Button
                                  variant="outline"
                                  className="flex-1"
                                  disabled={updateStatusMutation.isPending}
                                  onClick={() =>
                                    updateStatusMutation.mutate(
                                      { id: contact.id, status: "archived" },
                                      { onSuccess: () => setIsDetailDialogOpen(false) },
                                    )
                                  }
                                >
                                  Archive
                                </Button>
                              </>
                            )}
                            {contact.status === "replied" && (
                              <Button
                                variant="outline"
                                className="flex-1"
                                disabled={updateStatusMutation.isPending}
                                onClick={() =>
                                  updateStatusMutation.mutate(
                                    { id: contact.id, status: "archived" },
                                    { onSuccess: () => setIsDetailDialogOpen(false) },
                                  )
                                }
                              >
                                Archive
                              </Button>
                            )}
                            {contact.status === "archived" && (
                              <Button
                                variant="outline"
                                className="flex-1"
                                disabled={updateStatusMutation.isPending}
                                onClick={() =>
                                  updateStatusMutation.mutate(
                                    { id: contact.id, status: "new" },
                                    { onSuccess: () => setIsDetailDialogOpen(false) },
                                  )
                                }
                              >
                                Reopen
                              </Button>
                            )}
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <ReplyDialog
                      to={contact.email}
                      toName={contact.name}
                      defaultSubject="Re: Your message to GreenGrows"
                      sourceTable="contacts"
                      sourceId={contact.id}
                      onSentSuccessfully={() => {
                        if (contact.status === "new") {
                          updateStatusMutation.mutate({
                            id: contact.id,
                            status: "replied",
                          });
                        }
                      }}
                      trigger={
                        <Button
                          variant="outline"
                          className="flex-1 md:flex-none md:w-24"
                        >
                          <Mail className="h-4 w-4 mr-2" />
                          Reply
                        </Button>
                      }
                    />

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {contact.status === "new" && (
                          <>
                            <DropdownMenuItem onClick={() => updateStatusMutation.mutate({ id: contact.id, status: "replied" })}>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Mark as Replied
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateStatusMutation.mutate({ id: contact.id, status: "archived" })}>
                              <Archive className="h-4 w-4 mr-2" />
                              Archive
                            </DropdownMenuItem>
                          </>
                        )}
                        {contact.status === "replied" && (
                          <DropdownMenuItem onClick={() => updateStatusMutation.mutate({ id: contact.id, status: "archived" })}>
                            <Archive className="h-4 w-4 mr-2" />
                            Archive
                          </DropdownMenuItem>
                        )}
                        {contact.status === "archived" && (
                          <DropdownMenuItem onClick={() => updateStatusMutation.mutate({ id: contact.id, status: "new" })}>
                            <Inbox className="h-4 w-4 mr-2" />
                            Mark as New
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem className="text-red-600" onClick={() => deleteMutation.mutate(contact.id)}>
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
  );
};
