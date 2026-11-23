import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { describe, expect, it } from "vitest";
import { AuthProvider } from "@/contexts/AuthContext";
import { GuestRoute, ProtectedRoute } from "./guards";

function renderAt(path: string) {
  const router = createMemoryRouter(
    [
      { element: <GuestRoute />, children: [{ path: "/login", element: <p>tela de login</p> }] },
      { path: "/app", element: <ProtectedRoute />, children: [{ path: "dashboard", element: <p>dashboard</p> }] },
    ],
    { initialEntries: [path] },
  );
  render(
    <QueryClientProvider client={new QueryClient()}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>,
  );
  return router;
}

describe("route guards", () => {
  it("redirects anonymous visitors from private routes to login, keeping the origin", () => {
    const router = renderAt("/app/dashboard");
    expect(screen.getByText("tela de login")).toBeInTheDocument();
    expect(router.state.location.state).toEqual({ from: "/app/dashboard" });
  });

  it("shows the login page to anonymous visitors", () => {
    renderAt("/login");
    expect(screen.getByText("tela de login")).toBeInTheDocument();
  });
});
