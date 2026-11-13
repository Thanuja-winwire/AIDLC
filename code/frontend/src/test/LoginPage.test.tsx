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
    login.mockImplementation(() => Promise.reject(new Error("Invalid email or password")));
    render(<MemoryRouter><LoginPage /></MemoryRouter>);
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "a@b.co" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "bad" } });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Invalid email or password");
  });
});
