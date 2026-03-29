import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import Hero from "./pages/Hero";
import MainLayout from "./layout/MainLayout";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import RegisterNewEvent from "./pages/RegisterNewEvent";
import { useAuth } from "./hook/useAuth";
import AdminProfile from "./pages/AdminProfile";
import StudentProfile from "./pages/StudentProfile";
import OrganizerProfile from "./pages/OrganizerProfile";
import ProtectedRoute from "./routers/ProtectedRoute";
import Login from "./components/Login";
import Loader from "./components/loader";
import { Toaster } from 'react-hot-toast';
<Toaster position="top-right" />

const LoginOrRedirect = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) return <Login />;

  if (user?.role === "STUDENT")
    return <Navigate to="/student-profile" replace />;
  if (user?.role === "ORGANIZER")
    return <Navigate to="/organizer" replace />;
  if (user?.role === "ADMIN") return <Navigate to="/admin/profile" replace />;

  return <Navigate to="/home" replace />;
};

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<MainLayout />}>
      <Route index element={<Hero />} />
      <Route path="home" element={<Home />} />
      <Route path="about" element={<About />} />
      <Route path="contact" element={<Contact />} />
      <Route path="register-event" element={<RegisterNewEvent />} />

      <Route path="auth/login" element={<LoginOrRedirect />} />

      <Route element={<ProtectedRoute allowedRoles={["STUDENT"]} />}>
        <Route path="student-profile" element={<StudentProfile />} />
      </Route>
      <Route element={<ProtectedRoute allowedRoles={["ORGANIZER"]} />}>
        <Route path="organizer/*" element={<OrganizerProfile />} />
      </Route>
      {/* <Route path="organizer/*" element={<OrganizerProfile />} /> */}

      <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
        <Route path="admin/profile" element={<AdminProfile />} />
      </Route>
    </Route>,
  ),
);

function App() {
  const { loading } = useAuth();

  if (loading) return <Loader />;

  return <RouterProvider router={router} />;
}

export default App;
