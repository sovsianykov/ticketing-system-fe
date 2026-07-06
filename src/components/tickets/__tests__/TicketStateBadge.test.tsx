import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { TicketStateBadge, TicketTypeBadge } from "../TicketStateBadge";

jest.mock("@/lib/utils", () => ({
  cn: (...args: string[]) => args.filter(Boolean).join(" "),
}));

describe("TicketStateBadge", () => {
  it("displays 'New' for state new", () => {
    render(<TicketStateBadge state="new" />);
    expect(screen.getByText("New")).toBeInTheDocument();
  });

  it("displays 'In Progress' for state in_progress", () => {
    render(<TicketStateBadge state="in_progress" />);
    expect(screen.getByText("In Progress")).toBeInTheDocument();
  });

  it("displays 'Done' for state done", () => {
    render(<TicketStateBadge state="done" />);
    expect(screen.getByText("Done")).toBeInTheDocument();
  });

  it("displays 'Ready for Implementation' for state ready_for_implementation", () => {
    render(<TicketStateBadge state="ready_for_implementation" />);
    expect(screen.getByText("Ready for Implementation")).toBeInTheDocument();
  });

  it("displays 'Ready for Acceptance' for state ready_for_acceptance", () => {
    render(<TicketStateBadge state="ready_for_acceptance" />);
    expect(screen.getByText("Ready for Acceptance")).toBeInTheDocument();
  });
});

describe("TicketTypeBadge", () => {
  it("displays 'Bug' capitalized", () => {
    render(<TicketTypeBadge type="bug" />);
    expect(screen.getByText("Bug")).toBeInTheDocument();
  });

  it("displays 'Feature' capitalized", () => {
    render(<TicketTypeBadge type="feature" />);
    expect(screen.getByText("Feature")).toBeInTheDocument();
  });

  it("displays 'Fix' capitalized", () => {
    render(<TicketTypeBadge type="fix" />);
    expect(screen.getByText("Fix")).toBeInTheDocument();
  });
});
