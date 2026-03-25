import { Outlet } from "react-router-dom";
import loginSideImage from "@/assets/photo_for_LoginPage.jpg";

function AuthLayout() {
  return (
    <div className="flex min-h-screen w-full">
      <div className="hidden lg:flex relative w-1/2 overflow-hidden">
        <img
          src={loginSideImage}
          alt="Authentication visual"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      <div className="flex flex-1 items-center justify-center bg-white px-6 py-12 sm:px-12 lg:px-20">
        <Outlet />
      </div>
    </div>
  );
}

export default AuthLayout;
