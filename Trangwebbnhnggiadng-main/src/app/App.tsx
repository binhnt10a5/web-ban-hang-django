import React, { useEffect } from "react";
import { RouterProvider } from "react-router";
import { router } from "./routes";
import { Toaster } from "./components/ui/sonner";
import { initializeMockData } from "./services/mockData";

export default function App() {
  useEffect(() => {
    // Initialize mock data on first load
    initializeMockData();
  }, []);

  return (
    <>
      <RouterProvider router={router} />
      <Toaster position="top-right" />
    </>
  );
}