import { describe, expect, it } from "vitest";
import { validateStudent } from "./validation";

const valid = {
  name: "Asha Rao",
  email: "asha@example.com",
  phone: "+91 98765 43210",
  course: "Computer Science",
  enrollment_date: "2024-06-01",
};

describe("validateStudent", () => {
  it("accepts a valid student", () => {
    expect(validateStudent(valid)).toEqual({});
  });

  it("requires all fields", () => {
    const errors = validateStudent({ name: " ", email: "", phone: "", course: "", enrollment_date: "" });
    expect(errors.name).toBe("Name is required");
    expect(errors.email).toBe("Email is required");
    expect(errors.phone).toBe("Phone is required");
    expect(errors.course).toBe("Course is required");
    expect(errors.enrollment_date).toBe("Enrollment date is required");
  });

  it("rejects bad email and phone", () => {
    const errors = validateStudent({ ...valid, email: "nope", phone: "12ab" });
    expect(errors.email).toBe("Enter a valid email address");
    expect(errors.phone).toBe("Enter a valid phone number (7-15 digits)");
  });

  it("enforces phone digit count", () => {
    expect(validateStudent({ ...valid, phone: "123456" }).phone).toBeDefined();
    expect(validateStudent({ ...valid, phone: "1234567" }).phone).toBeUndefined();
    expect(validateStudent({ ...valid, phone: "1234567890123456" }).phone).toBeDefined();
  });

  it("enforces max lengths", () => {
    expect(validateStudent({ ...valid, name: "a".repeat(101) }).name).toBe("Name must be at most 100 characters");
    expect(validateStudent({ ...valid, course: "a".repeat(101) }).course).toBe("Course must be at most 100 characters");
  });
});
