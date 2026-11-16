import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { vi } from "vitest";
import { RequireAuth } from "./guards";

const useAuth = vi.fn();
vi.mock("./AuthContext", () => ({ useAuth: () => useAuth() }));

function renderAt(role?: "admin") {
  return render(
    <MemoryRouter initialEntries={["/admin"]}>
      <Routes>
        <Route path="/login" element={<div>login page</div>} />
        <Route path="/plans" element={<div>plans page</div>} />
        <Route element={<RequireAuth role={role} />}>
          <Route path="/admin" element={<div>admin page</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe("RequireAuth", () => {
  it("redirects anonymous users to login", () => {
    useAuth.mockReturnValue({ user: null, loading: false });
    renderAt("admin");
    expect(screen.getByText("login page")).toBeInTheDocument();
  });
  it("redirects customers away from admin", () => {
    useAuth.mockReturnValue({ user: { role: "customer" }, loading: false });
    renderAt("admin");
    expect(screen.getByText("plans page")).toBeInTheDocument();
  });
  it("lets admins in", () => {
    useAuth.mockReturnValue({ user: { role: "admin" }, loading: false });
    renderAt("admin");
    expect(screen.getByText("admin page")).toBeInTheDocument();
  });
});
