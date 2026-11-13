import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import LoginPage from "../pages/LoginPage";

// Plain delegating function (not a vi.fn): vitest's spy wraps returned promises and re-surfaces
// a rejection as an unhandled error attributed to the test, even though the page handles it.
let impl: (email: string, password: string) => Promise<void> = async () => undefined;
const calls: Array<[string, string]> = [];
const login = (email: string, password: string) => {
  calls.push([email, password]);
  return impl(email, password);
};
vi.mock("../auth/AuthContext", () => ({ useAuth: () => ({ user: null, login }) }));

describe("LoginPage", () => {
  beforeEach(() => {
    calls.length = 0;
    impl = async () => undefined;
  });
  afterEach(() => cleanup());

  it("submits trimmed credentials", async () => {
    render(<MemoryRouter><LoginPage /></MemoryRouter>);
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: " a@b.co " } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "secret123" } });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));
    await waitFor(() => expect(calls).toEqual([["a@b.co", "secret123"]]));
  });

  it("shows the server error on failure", async () => {
    impl = () => Promise.reject(new Error("Invalid email or password"));
    render(<MemoryRouter><LoginPage /></MemoryRouter>);
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "a@b.co" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "bad" } });
    fireEvent.submit(screen.getByRole("form", { name: /sign in form/i }));
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Invalid email or password");
  });
});
