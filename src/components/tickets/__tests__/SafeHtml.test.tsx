import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { SafeHtml } from "../SafeHtml";

jest.mock("@/lib/utils", () => ({
  cn: (...args: string[]) => args.filter(Boolean).join(" "),
}));

describe("SafeHtml", () => {
  it("renders nothing when html is null", () => {
    const { container } = render(<SafeHtml html={null} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing when html is undefined", () => {
    const { container } = render(<SafeHtml html={undefined} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing when html is empty string", () => {
    const { container } = render(<SafeHtml html="" />);
    expect(container.firstChild).toBeNull();
  });

  it("renders safe HTML content", () => {
    const { container } = render(<SafeHtml html="<p>Hello world</p>" />);
    expect(container.querySelector("p")?.textContent).toBe("Hello world");
  });

  it("strips script tags", () => {
    const { container } = render(<SafeHtml html='<p>Safe</p><script>alert("xss")</script>' />);
    expect(container.innerHTML).not.toContain("<script>");
    expect(container.innerHTML).not.toContain("alert");
  });

  it("strips on* event handlers", () => {
    const { container } = render(<SafeHtml html='<p onclick="evil()">Click</p>' />);
    expect(container.innerHTML).not.toContain("onclick");
  });

  it("applies custom className", () => {
    const { container } = render(<SafeHtml html="<p>Text</p>" className="custom-class" />);
    expect(container.firstChild).toHaveClass("custom-class");
  });
});
