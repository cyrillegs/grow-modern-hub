import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ContactsPanel } from "./ContactsPanel";

// Hoisted mock state for fluent supabase chains
const state = vi.hoisted(() => ({
  rows: [] as Array<Record<string, unknown>>,
  selectError: null as null | { message: string },
}));

vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() =>
          Promise.resolve({ data: state.rows, error: state.selectError }),
        ),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null })),
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null })),
      })),
    })),
  },
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

const renderWithClient = (ui: React.ReactElement) => {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
};

const sampleContacts = [
  {
    id: "00000000-0000-0000-0000-000000000001",
    created_at: "2026-05-13T00:00:00Z",
    name: "Juan Dela Cruz",
    email: "juan@example.com",
    phone: "+63 912 345 6789",
    message: "Hi, I have a question about your fertilizers.",
    status: "new",
    admin_notes: null,
  },
  {
    id: "00000000-0000-0000-0000-000000000002",
    created_at: "2026-05-12T00:00:00Z",
    name: "Maria Santos",
    email: "maria@example.com",
    phone: null,
    message: "Following up on my previous inquiry.",
    status: "replied",
    admin_notes: null,
  },
];

describe("<ContactsPanel />", () => {
  beforeEach(() => {
    state.rows = [];
    state.selectError = null;
  });

  it("shows the empty state when there are no contacts", async () => {
    renderWithClient(<ContactsPanel />);
    expect(await screen.findByText(/no contact messages yet/i)).toBeInTheDocument();
  });

  it("renders contacts from Supabase and reflects them in stats", async () => {
    state.rows = sampleContacts;
    renderWithClient(<ContactsPanel />);

    expect(await screen.findByText("Juan Dela Cruz")).toBeInTheDocument();
    expect(screen.getByText("Maria Santos")).toBeInTheDocument();

    // Total count = 2
    const totalCard = screen.getByRole("button", { name: /total messages/i });
    expect(totalCard).toHaveTextContent("2");
  });

  it("filters contacts when a stats card is clicked", async () => {
    state.rows = sampleContacts;
    const user = userEvent.setup();
    renderWithClient(<ContactsPanel />);

    await screen.findByText("Juan Dela Cruz");

    // Click the "Replied" filter chip
    await user.click(screen.getByRole("button", { name: /^\s*replied/i }));

    // Only Maria (replied) should remain visible
    await waitFor(() => {
      expect(screen.queryByText("Juan Dela Cruz")).not.toBeInTheDocument();
    });
    expect(screen.getByText("Maria Santos")).toBeInTheDocument();
  });

  it("filters contacts via the search input", async () => {
    state.rows = sampleContacts;
    const user = userEvent.setup();
    renderWithClient(<ContactsPanel />);

    await screen.findByText("Juan Dela Cruz");

    await user.type(screen.getByPlaceholderText(/search by name/i), "Maria");

    await waitFor(() => {
      expect(screen.queryByText("Juan Dela Cruz")).not.toBeInTheDocument();
    });
    expect(screen.getByText("Maria Santos")).toBeInTheDocument();
  });

  it("shows the error banner when the query fails", async () => {
    state.selectError = { message: "Connection refused" };
    renderWithClient(<ContactsPanel />);
    expect(await screen.findByText(/failed to load contacts/i)).toBeInTheDocument();
  });
});
