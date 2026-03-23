import Home from "../pages/Home";
import About from "../pages/About";
import Contact from "../pages/Contact";
import StudentProfile from "../pages/StudentProfile";
import OrganizerProfile from "../pages/OrganizerProfile";
import AdminProfile from "../pages/AdminProfile";
import { ROLES } from "../utils/constants";
import RegisterNewEvent from "../pages/RegisterNewEvent";

export const routesConfig = [
  { path: "/home", element: <Home />, public: true },
  { path: "/about", element: <About />, public: true },
  { path: "/contact", element: <Contact />, public: true },
  { path: "/register-event", element: <RegisterNewEvent /> },
  { path: "/student/profile", element: <StudentProfile />, roles: [ROLES.STUDENT] },
  { path: "/organizer/profile", element: <OrganizerProfile />, roles: [ROLES.ORGANIZER] },
  { path: "/admin/profile", element: <AdminProfile />, roles: [ROLES.ADMIN] },
];
