import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { RoleGate } from "../components/RoleGate";

let isAdmin = false;
vi.mock("../auth/AuthContext", () => ({ useAuth: () => ({ isAdmin }) }));

describe("RoleGate", () => {
  it("hides admin-only content from Staff", () => {
    isAdmin = false;
    render(<RoleGate><button>Delete</button></RoleGate>);
    expect(screen.queryByText("Delete")).toBeNull();
  });

  it("shows admin-only content to Admins", () => {
    isAdmin = true;
    render(<RoleGate><button>Delete</button></RoleGate>);
    expect(screen.getByText("Delete")).toBeInTheDocument();
  });

  it("renders the fallback for Staff when given", () => {
    isAdmin = false;
    render(<RoleGate fallback={<span>Read only</span>}><button>Delete</button></RoleGate>);
    expect(screen.getByText("Read only")).toBeInTheDocument();
  });
});
