import { describe, it, expect } from "vitest";
import { gmailComposeUrl, replyBodyTemplate } from "./email-links";

describe("gmailComposeUrl", () => {
  it("builds a Gmail compose URL with to and subject", () => {
    const url = gmailComposeUrl({
      to: "juan@example.com",
      subject: "Re: Your quote request",
    });
    expect(url).toBe(
      "https://mail.google.com/mail/?view=cm&to=juan%40example.com&su=Re%3A+Your+quote+request",
    );
  });

  it("includes the body when provided", () => {
    const url = gmailComposeUrl({
      to: "maria@example.com",
      subject: "Re: Hi",
      body: "Hello there",
    });
    expect(url).toContain("body=Hello+there");
  });

  it("encodes special characters in the email address", () => {
    const url = gmailComposeUrl({
      to: "test+e2e@example.com",
      subject: "Hi",
    });
    expect(url).toContain("to=test%2Be2e%40example.com");
  });

  it("omits the body param when body is not provided", () => {
    const url = gmailComposeUrl({
      to: "x@y.com",
      subject: "S",
    });
    expect(url).not.toContain("body=");
  });
});

describe("replyBodyTemplate", () => {
  it("includes the customer's name in the greeting", () => {
    const body = replyBodyTemplate("Juan Dela Cruz");
    expect(body).toMatch(/^Hi Juan Dela Cruz,/);
  });

  it("ends with the GreenGrows sign-off", () => {
    expect(replyBodyTemplate("Anyone")).toMatch(/— The GreenGrows team$/);
  });
});
