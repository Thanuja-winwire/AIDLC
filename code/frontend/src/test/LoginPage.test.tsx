import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import LoginPage from "../pages/LoginPage";

const login = vi.fn();
vi.mock("../auth/AuthContext", () => ({ useAuth: () => ({ user: null, login }) }));

describe("LoginPage", () => {
  beforeEach(() => login.mockReset());
  afterEach(() => cleanup());

  it("submits trimmed credentials", async () => {
    login.mockResolvedValue(undefined);
    render(<MemoryRouter><LoginPage /></MemoryRouter>);
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: " a@b.co " } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "secret123" } });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));
    await waitFor(() => expect(login).toHaveBeenCalledWith("a@b.co", "secret123"));
  });

  it("shows the server error on failure", async () => {
    // Thenable, not a real Promise: vitest's mock result tracking can otherwise flag the rejection as unhandled.
    login.mockImplementation(() => ({
      then: (_ok: unknown, fail: (e: unknown) => void) => fail(new Error("Invalid email or password")),
    }));
    const { container } = render(<MemoryRouter><LoginPage /></MemoryRouter>);
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "a@b.co" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "bad" } });
    fireEvent.submit(screen.getByRole("form", { name: /sign in form/i }));
    try {
      const alert = await screen.findByRole("alert");
      expect(alert).toHaveTextContent("Invalid email or password");
    } catch (e) {
      console.log("DIAG login calls:", JSON.stringify(login.mock.calls));
      console.log("DIAG DOM:", container.innerHTML);
      throw e;
    }
  });
});
