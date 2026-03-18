import { Outlet } from "react-router-dom";
import ShoppingHeader from "./header";
import ShoppingFooter from "./footer";

function ShoppingLayout() {
  return (
    <div className="flex flex-col bg-white min-h-screen">
      {/* common header */}
      <ShoppingHeader />
      <main className="flex flex-col w-full flex-1">
        <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
          <Outlet />
        </div>
      </main>
      <ShoppingFooter />
    </div>
  );
}

export default ShoppingLayout;
