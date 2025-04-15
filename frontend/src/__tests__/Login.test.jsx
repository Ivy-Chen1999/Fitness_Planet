import { render, screen, fireEvent } from "@testing-library/react";
import Login from "../pages/Login";
import { BrowserRouter } from "react-router-dom";
import { UserProvider } from "../contexts/UserContext";

describe("Login Page", () => {
  test("renders login form and handles input", () => {
    render(
      <UserProvider>
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </UserProvider>
    );

    
    expect(screen.getByText("Login")).toBeInTheDocument();

    
    fireEvent.change(screen.getByLabelText(/Username/i), {
      target: { value: "testuser" }
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: "testpass" }
    });

    
    expect(screen.getByDisplayValue("testuser")).toBeInTheDocument();
    expect(screen.getByDisplayValue("testpass")).toBeInTheDocument();
  });
});
