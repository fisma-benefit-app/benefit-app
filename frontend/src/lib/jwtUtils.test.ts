import { describe, expect, it } from "vitest";
import { getAppUserRole } from "./jwtUtils";

describe("getAppUserRole", () => {
  it("returns ADMIN when the scope includes ROLE_ADMIN", () => {
    expect(getAppUserRole("ROLE_ADMIN")).toBe("ADMIN");
  });

  it("returns USER when the scope does not include ROLE_ADMIN", () => {
    expect(getAppUserRole("ROLE_USER")).toBe("USER");
  });

  it("recognizes ROLE_ADMIN among multiple authorities", () => {
    expect(getAppUserRole("ROLE_USER ROLE_ADMIN")).toBe("ADMIN");
  });

  it("defaults to USER when scope is missing", () => {
    expect(getAppUserRole(undefined)).toBe("USER");
  });
});
