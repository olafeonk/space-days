import { createHashRouter, RouterProvider } from "react-router-dom";
import { MainLayout } from "components/layouts/main-layout";

import { HomePage } from "./main/home";
import { EventsPage } from "./main/events";
import { AdminEventsPage } from "./admin/events";
import { RegistrationPage } from "./main/registration";
import { TicketsPage } from "./main/tickets";
import { PartnersPage } from "./admin/partners";
import { NotFound } from "components/not-found";
import { AdminLayout } from "components/layouts/admin-layout";
import { AddEventForm } from "./admin/events/add-event";
import { LogInPage } from "./admin/login";
import { LogInSuppPage } from "./admin/login/support";
import { AdminUsersPage } from "./admin/users";
import { ExportPage } from "./admin/export";

const routesConfig = [
  { path: "*", element: <NotFound /> },
  {
    element: <AdminLayout />,
    children: [
      {
        path: "/admin/events",
        element: <AdminEventsPage />,
      },
      {
        path: "/admin/",
        element: <LogInPage />,
      },
      {
        path: "/admin/users",
        element: <AdminUsersPage />,
      },
      {
        path: "/admin/export",
        element: <ExportPage />,
      },
      {
        path: "/token/*",
        element: <LogInSuppPage />,
      },
      {
        path: "/admin/partners",
        element: <PartnersPage />
      },
    ],
  },
  {
    element: <MainLayout />,
    children: [
      {
        path: "/",
        element: <HomePage />,
      },
      {
        path: "/events",
        element: <EventsPage />,
      },
      {
        path: "/registration",
        element: <RegistrationPage />,
      },
      {
        path: "/tickets",
        element: <TicketsPage />,
      },
    ],
  },
];

const router = createHashRouter(routesConfig);

export const Routing = () => {
  return <RouterProvider router={router} />;
};
