import { Facebook, Instagram, MessageCircle, Send } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";

function ShoppingFooter() {
  return (
    <footer className="bg-gray-100 text-gray-700 py-8 md:py-12 border-t border-gray-200">
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {/* About Us Column */}
          <div className="flex flex-col gap-4">
            <h3 className="font-semibold text-gray-900 text-lg">Về Chúng Tôi</h3>
            <p className="text-sm leading-relaxed">
              Chào mừng bạn đến với cửa hàng của chúng tôi! Chúng tôi chuyên cung cấp các sản phẩm chất lượng cao với dịch vụ tận tâm nhất.
            </p>
            <Link
              to="/shop/about"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
            >
              Tìm hiểu thêm &rarr;
            </Link>
          </div>

          {/* Policies Column */}
          <div className="flex flex-col gap-4">
            <h3 className="font-semibold text-gray-900 text-lg">Chính Sách</h3>
            <ul className="flex flex-col gap-2 text-sm">
              <li>
                <Link to="#" className="hover:text-gray-900 transition-colors">
                  Chính sách bảo hành
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-gray-900 transition-colors">
                  Chính sách đổi trả
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-gray-900 transition-colors">
                  Chính sách vận chuyển
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-gray-900 transition-colors">
                  Điều khoản dịch vụ
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links Column */}
          <div className="flex flex-col gap-4">
            <h3 className="font-semibold text-gray-900 text-lg">Liên Kết Nhanh</h3>
            <ul className="flex flex-col gap-2 text-sm">
              <li>
                <Link to="/shop/home" className="hover:text-gray-900 transition-colors">
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link to="/shop/listing" className="hover:text-gray-900 transition-colors">
                  Cửa hàng
                </Link>
              </li>
              <li>
                <Link to="/shop/account" className="hover:text-gray-900 transition-colors">
                  Tài khoản
                </Link>
              </li>
              <li>
                <Link to="/shop/search" className="hover:text-gray-900 transition-colors">
                  Tìm kiếm
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Column */}
          <div className="flex flex-col gap-4">
            <h3 className="font-semibold text-gray-900 text-lg">Liên Hệ</h3>
            <p className="text-sm">Kết nối với chúng tôi qua các nền tảng:</p>
            <div className="flex items-center gap-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="bg-gray-200 p-2 rounded-full hover:bg-blue-100 hover:text-blue-600 transition-all"
                title="Facebook"
              >
                <Facebook size={20} strokeWidth={1.5} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="bg-gray-200 p-2 rounded-full hover:bg-pink-100 hover:text-pink-600 transition-all"
                title="Instagram"
              >
                <Instagram size={20} strokeWidth={1.5} />
              </a>
              <a
                href="https://zalo.me"
                target="_blank"
                rel="noreferrer"
                className="bg-gray-200 p-2 rounded-full hover:bg-green-100 hover:text-green-600 transition-all"
                title="Zalo"
              >
                <MessageCircle size={20} strokeWidth={1.5} />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 md:mt-12 pt-6 md:pt-8 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-500">
          <p>&copy; {new Date().getFullYear()} E-Shop. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span>Visa</span>
            <span>Mastercard</span>
            <span>Stripe</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default ShoppingFooter;
