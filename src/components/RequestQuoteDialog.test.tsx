import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "@/components/ui/button";
import { RequestQuoteDialog } from "./RequestQuoteDialog";

const insertMock = vi.fn();
const toastMock = vi.fn();

vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: vi.fn(() => ({ insert: insertMock })),
  },
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: toastMock }),
}));

const renderDialog = (product = "NPK 20-20-20") =>
  render(
    <RequestQuoteDialog
      product={product}
      trigger={<Button>Open Quote</Button>}
    />,
  );

describe("<RequestQuoteDialog />", () => {
  beforeEach(() => {
    insertMock.mockReset();
    toastMock.mockReset();
  });

  it("opens the dialog and shows the form when the trigger is clicked", async () => {
    const user = userEvent.setup();
    renderDialog("NPK 20-20-20");

    await user.click(screen.getByRole("button", { name: /open quote/i }));

    expect(
      await screen.findByRole("heading", { name: /request quote — npk 20-20-20/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /submit quote request/i }),
    ).toBeInTheDocument();
  });

  it("shows validation errors when submitting empty form", async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.click(screen.getByRole("button", { name: /open quote/i }));
    await user.click(screen.getByRole("button", { name: /submit quote request/i }));

    expect(await screen.findByText(/name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/please enter a valid email/i)).toBeInTheDocument();
    expect(screen.getByText(/phone is required/i)).toBeInTheDocument();
    expect(screen.getByText(/estimated quantity is required/i)).toBeInTheDocument();
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("submits valid data to Supabase with the product name and fires success toast", async () => {
    insertMock.mockResolvedValue({ error: null });
    const user = userEvent.setup();
    renderDialog("Urea (46-0-0)");

    await user.click(screen.getByRole("button", { name: /open quote/i }));
    await user.type(screen.getByLabelText(/name/i), "Juan Farmer");
    await user.type(screen.getByLabelText(/email/i), "juan@farm.ph");
    await user.type(screen.getByLabelText(/phone/i), "+63 917 123 4567");
    await user.type(screen.getByLabelText(/estimated quantity/i), "200 bags");
    await user.click(screen.getByRole("button", { name: /submit quote request/i }));

    await vi.waitFor(() => {
      expect(insertMock).toHaveBeenCalledWith({
        name: "Juan Farmer",
        email: "juan@farm.ph",
        phone: "+63 917 123 4567",
        product: "Urea (46-0-0)",
        quantity: "200 bags",
        message: null,
      });
    });

    expect(toastMock).toHaveBeenCalledWith(
      expect.objectContaining({
        title: expect.stringMatching(/quote request sent/i),
      }),
    );
  });

  it("shows destructive toast when Supabase insert fails", async () => {
    insertMock.mockResolvedValue({ error: { message: "DB down" } });
    const user = userEvent.setup();
    renderDialog();

    await user.click(screen.getByRole("button", { name: /open quote/i }));
    await user.type(screen.getByLabelText(/name/i), "Test");
    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/phone/i), "555");
    await user.type(screen.getByLabelText(/estimated quantity/i), "1");
    await user.click(screen.getByRole("button", { name: /submit quote request/i }));

    await vi.waitFor(() => {
      expect(toastMock).toHaveBeenCalledWith(
        expect.objectContaining({
          title: expect.stringMatching(/failed to send/i),
          variant: "destructive",
        }),
      );
    });
  });
});
