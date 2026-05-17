import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ProductsPanel } from "./ProductsPanel";

const state = vi.hoisted(() => ({
  rows: [] as Array<Record<string, unknown>>,
  selectError: null as null | { message: string },
}));

const insertMock = vi.hoisted(() => vi.fn());
const updateEqMock = vi.hoisted(() => vi.fn(() => Promise.resolve({ error: null })));
const deleteEqMock = vi.hoisted(() => vi.fn(() => Promise.resolve({ error: null })));
const toastMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: vi.fn((table: string) => {
      if (table !== "products") {
        throw new Error(`Unexpected table access in test: ${table}`);
      }

      const orderChain = {
        order: vi.fn(),
      };

      orderChain.order
        .mockImplementationOnce(() => orderChain)
        .mockImplementationOnce(() =>
          Promise.resolve({ data: state.rows, error: state.selectError }),
        );

      return {
        select: vi.fn(() => orderChain),
        insert: insertMock,
        update: vi.fn(() => ({
          eq: updateEqMock,
        })),
        delete: vi.fn(() => ({
          eq: deleteEqMock,
        })),
      };
    }),
  },
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: toastMock }),
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

const sampleProducts = [
  {
    id: "00000000-0000-0000-0000-000000000010",
    created_at: "2026-05-15T00:00:00Z",
    name: "NPK 20-20-20",
    slug: "npk-20-20-20",
    description: "Balanced crop nutrition.",
    features: ["Balanced ratio", "Water soluble"],
    npk: "20-20-20",
    application: "Foliar spray",
    coverage: "25 lbs per acre",
    price: "$42/bag (25kg)",
    image_key: "specialty",
    icon_key: "sprout",
    sort_order: 10,
    is_featured: true,
    is_active: true,
  },
  {
    id: "00000000-0000-0000-0000-000000000011",
    created_at: "2026-05-15T00:00:00Z",
    name: "Organic Compost Blend",
    slug: "organic-compost-blend",
    description: "Organic soil improver.",
    features: ["Improves soil structure", "Slow-release nutrients"],
    npk: "5-3-2",
    application: "Broadcast",
    coverage: "2 tons per acre",
    price: "$25/bag (40kg)",
    image_key: "organic",
    icon_key: "leaf",
    sort_order: 20,
    is_featured: false,
    is_active: false,
  },
];

describe("<ProductsPanel />", () => {
  beforeEach(() => {
    state.rows = [];
    state.selectError = null;
    insertMock.mockReset();
    updateEqMock.mockClear();
    deleteEqMock.mockClear();
    toastMock.mockReset();
  });

  it("renders products from Supabase and reflects them in stats", async () => {
    state.rows = sampleProducts;
    renderWithClient(<ProductsPanel />);

    expect(await screen.findByText("NPK 20-20-20")).toBeInTheDocument();
    expect(screen.getByText("Organic Compost Blend")).toBeInTheDocument();

    const totalCard = screen.getByRole("button", { name: /all products/i });
    expect(totalCard).toHaveTextContent("2");
  });

  it("filters products when a stats card is clicked", async () => {
    state.rows = sampleProducts;
    const user = userEvent.setup();
    renderWithClient(<ProductsPanel />);

    await screen.findByText("NPK 20-20-20");

    await user.click(screen.getByRole("button", { name: /^\s*featured/i }));

    await waitFor(() => {
      expect(screen.queryByText("Organic Compost Blend")).not.toBeInTheDocument();
    });
    expect(screen.getByText("NPK 20-20-20")).toBeInTheDocument();
  });

  it("submits a new product to Supabase", async () => {
    insertMock.mockResolvedValue({ error: null });
    const user = userEvent.setup();
    renderWithClient(<ProductsPanel />);

    await user.click(screen.getByRole("button", { name: /add product/i }));
    expect(
      await screen.findByRole("heading", { name: /add product/i }),
    ).toBeInTheDocument();

    await user.type(screen.getByLabelText(/^name$/i), "Calcium Nitrate");
    await user.clear(screen.getByLabelText(/slug/i));
    await user.type(screen.getByLabelText(/slug/i), "calcium-nitrate");
    await user.type(screen.getByLabelText(/price/i), "$48/bag (25kg)");
    await user.clear(screen.getByLabelText(/sort order/i));
    await user.type(screen.getByLabelText(/sort order/i), "80");
    await user.type(screen.getByLabelText(/npk ratio/i), "15.5-0-0 + 19% Ca");
    await user.type(screen.getByLabelText(/coverage/i), "20 lbs per acre");
    await user.type(
      screen.getByLabelText(/application/i),
      "Fertigation or foliar spray",
    );
    await user.type(
      screen.getByLabelText(/description/i),
      "Premium calcium and nitrogen source for deficiency prevention.",
    );
    await user.type(
      screen.getByLabelText(/features/i),
      "Water soluble{enter}Improves fruit firmness",
    );

    await user.click(screen.getByRole("button", { name: /create product/i }));

    await waitFor(() => {
      expect(insertMock).toHaveBeenCalledWith({
        name: "Calcium Nitrate",
        slug: "calcium-nitrate",
        description:
          "Premium calcium and nitrogen source for deficiency prevention.",
        features: ["Water soluble", "Improves fruit firmness"],
        npk: "15.5-0-0 + 19% Ca",
        application: "Fertigation or foliar spray",
        coverage: "20 lbs per acre",
        price: "$48/bag (25kg)",
        image_key: "specialty",
        icon_key: "sprout",
        sort_order: 80,
        is_featured: false,
        is_active: true,
      });
    });

    expect(toastMock).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Product added",
      }),
    );
  });
});
