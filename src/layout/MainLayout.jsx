import { useLocation, Outlet } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ScrollToTop from "../utils/ScrollToTop";

function MainLayout() {
  const location = useLocation();

  const hideHeaderRoutes = ["/", "/auth/login", "/organizer", "/admin/profile"];

  const shouldHide = hideHeaderRoutes.some((path) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.toLowerCase().startsWith(path.toLowerCase());
  });

  return (
    <>
      <ScrollToTop />
      <div className="flex flex-col text-white">
        {!shouldHide && <Header />}
        <main
          className={`grow min-h-screen ${!shouldHide ? "px-6 md:px-12 lg:px-24" : ""}`}
        >
          <Outlet />
        </main>

        {!shouldHide && <Footer />}
      </div>
    </>
  );
}

export default MainLayout;
