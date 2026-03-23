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
  { path: "/organizer", element: <OrganizerProfile />, roles: [ROLES.ORGANIZER] },
  { path: "/admin/profile", element: <AdminProfile />, roles: [ROLES.ADMIN] },
];


// import {
//   Route,
//   createBrowserRouter,
//   createRoutesFromElements,
//   RouterProvider
// } from "react-router-dom";
// import Hero from "./pages/Hero";
// import MainLayout from "./layout/MainLayout";
// import { useAuth } from "./hook/useAuth";
// import ProtectedRoute from "./routers/ProtectedRoute";
// import Login from "./components/Login";
// import Loader from "./components/loader";
// import { routesConfig } from "./routers/routesConfig";


// // add isAuthenticated check in login route to redirect to home if already logged in
// // check nested routes for student, organizer, admin profiles and add protected route for them

// const router = createBrowserRouter(
//   createRoutesFromElements(
//     <Route path="/" element={<MainLayout />}>
//       <Route index element={<Hero />} />
//       <Route path="auth/login" element={<Login />} />
//       {routesConfig.map((route, i) => {
//         if (route.public) {
//           return <Route key={i} path={route.path} element={route.element} />;
//         }

//         return (
//           <Route
//             key={i}
//             element={<ProtectedRoute allowedRoles={route.roles} />}
//           >
//             <Route path={route.path} element={route.element} />
//           </Route>
//         );
//       })}
//     </Route>,
//   ),
// );

// function App() {
//   const { loading } = useAuth();

//   if (loading) return <Loader />;

//   return <RouterProvider router={router} />;
// }

// export default App;
