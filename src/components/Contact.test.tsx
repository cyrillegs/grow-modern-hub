import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Contact from "./Contact";

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

describe("<Contact />", () => {
  beforeEach(() => {
    insertMock.mockReset();
    toastMock.mockReset();
  });

  it("renders the form heading and submit button", () => {
    render(<Contact />);
    expect(screen.getByRole("heading", { name: /send us a message/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /send message/i })).toBeInTheDocument();
  });

  it("shows inline validation errors when submitting empty form", async () => {
    const user = userEvent.setup();
    render(<Contact />);

    await user.click(screen.getByRole("button", { name: /send message/i }));

    expect(await screen.findByText(/name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/please enter a valid email/i)).toBeInTheDocument();
    expect(screen.getByText(/message is required/i)).toBeInTheDocument();
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("submits valid data to Supabase and fires a success toast", async () => {
    insertMock.mockResolvedValue({ error: null });
    const user = userEvent.setup();
    render(<Contact />);

    await user.type(screen.getByLabelText(/name/i), "Juan Dela Cruz");
    await user.type(screen.getByLabelText(/email/i), "juan@example.com");
    await user.type(screen.getByLabelText(/message/i), "Hello GreenGrows");
    await user.click(screen.getByRole("button", { name: /send message/i }));

    await vi.waitFor(() => {
      expect(insertMock).toHaveBeenCalledWith({
        name: "Juan Dela Cruz",
        email: "juan@example.com",
        phone: null,
        message: "Hello GreenGrows",
      });
    });

    expect(toastMock).toHaveBeenCalledWith(
      expect.objectContaining({ title: expect.stringMatching(/message sent/i) }),
    );
  });

  it("shows an error toast when Supabase insert fails", async () => {
    insertMock.mockResolvedValue({ error: { message: "DB down" } });
    const user = userEvent.setup();
    render(<Contact />);

    await user.type(screen.getByLabelText(/name/i), "Test User");
    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/message/i), "Hi");
    await user.click(screen.getByRole("button", { name: /send message/i }));

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
