import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import { HomePage } from "./HomePage";

describe("HomePage", () => {
  it("renders the title and primary navigation", () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Track food expiry dates/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /login/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /go to admin/i })).toBeInTheDocument();
  });
});
