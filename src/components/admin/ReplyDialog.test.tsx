import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ReplyDialog } from "./ReplyDialog";

const state = vi.hoisted(() => ({
  invokeResponse: { data: { ok: true } as { ok?: boolean; warning?: string }, error: null as null | { message: string } },
}));

const invokeMock = vi.hoisted(() => vi.fn());
const toastMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/supabase", () => ({
  supabase: {
    functions: {
      invoke: invokeMock,
    },
  },
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: toastMock }),
}));

const renderWithClient = (ui: React.ReactElement) => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
};

const renderDialog = (overrides: Partial<React.ComponentProps<typeof ReplyDialog>> = {}) =>
  renderWithClient(
    <ReplyDialog
      to="juan@example.com"
      toName="Juan Dela Cruz"
      defaultSubject="Re: Your quote"
      sourceTable="quotes"
      sourceId="00000000-0000-0000-0000-000000000001"
      trigger={<Button>Reply</Button>}
      {...overrides}
    />,
  );

describe("<ReplyDialog />", () => {
  beforeEach(() => {
    invokeMock.mockReset();
    toastMock.mockReset();
    state.invokeResponse = { data: { ok: true }, error: null };
  });

  it("opens the dialog with subject and body pre-filled", async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.click(screen.getByRole("button", { name: "Reply" }));

    expect(
      await screen.findByRole("heading", { name: /reply to juan dela cruz/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/subject/i)).toHaveValue("Re: Your quote");
    const body = (screen.getByLabelText(/message/i) as HTMLTextAreaElement).value;
    expect(body).toContain("Hi Juan Dela Cruz,");
    expect(body).toContain("The GreenGrows team");
  });

  it("rejects empty subject and body with validation errors", async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.click(screen.getByRole("button", { name: "Reply" }));

    // Clear the pre-filled fields
    await user.clear(screen.getByLabelText(/subject/i));
    await user.clear(screen.getByLabelText(/message/i));

    await user.click(screen.getByRole("button", { name: /send reply/i }));

    expect(await screen.findByText(/subject is required/i)).toBeInTheDocument();
    expect(screen.getByText(/message is required/i)).toBeInTheDocument();
    expect(invokeMock).not.toHaveBeenCalled();
  });

  it("calls the send-reply Edge Function with the right payload and shows success toast", async () => {
    invokeMock.mockResolvedValue({ data: { ok: true }, error: null });
    const onSentSuccessfully = vi.fn();
    const user = userEvent.setup();
    renderDialog({ onSentSuccessfully });

    await user.click(screen.getByRole("button", { name: "Reply" }));

    // Pre-filled subject + body are sufficient; just submit.
    await user.click(screen.getByRole("button", { name: /send reply/i }));

    await waitFor(() => {
      expect(invokeMock).toHaveBeenCalledWith("send-reply", {
        body: {
          to: "juan@example.com",
          subject: "Re: Your quote",
          body: expect.stringContaining("Hi Juan Dela Cruz,"),
          sourceTable: "quotes",
          sourceId: "00000000-0000-0000-0000-000000000001",
        },
      });
    });

    expect(toastMock).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Reply sent",
      }),
    );
    expect(onSentSuccessfully).toHaveBeenCalled();
  });

  it("shows destructive toast when Edge Function returns an error", async () => {
    invokeMock.mockResolvedValue({
      data: null,
      error: { message: "Edge Function failure" },
    });
    const onSentSuccessfully = vi.fn();
    const user = userEvent.setup();
    renderDialog({ onSentSuccessfully });

    await user.click(screen.getByRole("button", { name: "Reply" }));
    await user.click(screen.getByRole("button", { name: /send reply/i }));

    await waitFor(() => {
      expect(toastMock).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Failed to send reply",
          variant: "destructive",
        }),
      );
    });
    expect(onSentSuccessfully).not.toHaveBeenCalled();
  });

  it("surfaces the warning when the email sent but logging failed", async () => {
    invokeMock.mockResolvedValue({
      data: { ok: true, warning: "Email sent but reply log failed" },
      error: null,
    });
    const user = userEvent.setup();
    renderDialog();

    await user.click(screen.getByRole("button", { name: "Reply" }));
    await user.click(screen.getByRole("button", { name: /send reply/i }));

    await waitFor(() => {
      expect(toastMock).toHaveBeenCalledWith(
        expect.objectContaining({
          title: expect.stringMatching(/logging failed/i),
        }),
      );
    });
  });
});
