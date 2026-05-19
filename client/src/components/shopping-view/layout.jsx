import { Outlet, useLocation } from "react-router-dom";
import ShoppingHeader from "./header";
import ShoppingFooter from "./footer";
import NewsletterSidebar from "./newsletter-sidebar";
import Chatbot from "./chatbot";

function ShoppingLayout() {
  const location = useLocation();
  const isHomePage = location.pathname === "/shop/home";

  return (
    <>
      {isHomePage ? (
        <div className="bg-white">
          <ShoppingHeader />
          <Outlet />
          <NewsletterSidebar />
        </div>
      ) : (
        <div className="flex flex-col bg-white min-h-screen">
          <ShoppingHeader />
          <main className="flex flex-col w-full flex-1 pt-14">
            <Outlet />
          </main>
          <NewsletterSidebar />
          <ShoppingFooter />
        </div>
      )}
      <Chatbot />
    </>
  );
}

export default ShoppingLayout;
