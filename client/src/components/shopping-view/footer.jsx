import { Facebook, Instagram, MessageCircle, Send } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";

function ShoppingFooter() {
  return (
    <footer className="bg-slate-900 text-slate-300 py-12 border-t">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About Us Column */}
          <div className="flex flex-col gap-4">
            <h3 className="font-bold text-white text-lg">Về Chúng Tôi</h3>
            <p className="text-sm leading-relaxed">
              Chào mừng bạn đến với cửa hàng của chúng tôi! Chúng tôi chuyên cung cấp các sản phẩm chất lượng cao với dịch vụ tận tâm nhất.
            </p>
            <Link
              to="/shop/about"
              className="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
            >
              Tìm hiểu thêm &rarr;
            </Link>
          </div>

          {/* Policies Column */}
          <div className="flex flex-col gap-4">
            <h3 className="font-bold text-white text-lg">Chính Sách</h3>
            <ul className="flex flex-col gap-2 text-sm">
              <li>
                <Link to="#" className="hover:text-white transition-colors">
                  Chính sách bảo hành
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-white transition-colors">
                  Chính sách đổi trả
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-white transition-colors">
                  Chính sách vận chuyển
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-white transition-colors">
                  Điều khoản dịch vụ
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links Column */}
          <div className="flex flex-col gap-4">
            <h3 className="font-bold text-white text-lg">Liên Kết Nhanh</h3>
            <ul className="flex flex-col gap-2 text-sm">
              <li>
                <Link to="/shop/home" className="hover:text-white transition-colors">
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link to="/shop/listing" className="hover:text-white transition-colors">
                  Cửa hàng
                </Link>
              </li>
              <li>
                <Link to="/shop/account" className="hover:text-white transition-colors">
                  Tài khoản
                </Link>
              </li>
              <li>
                <Link to="/shop/search" className="hover:text-white transition-colors">
                  Tìm kiếm
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Column */}
          <div className="flex flex-col gap-4">
            <h3 className="font-bold text-white text-lg">Liên Hệ</h3>
            <p className="text-sm">Kết nối với chúng tôi qua các nền tảng:</p>
            <div className="flex items-center gap-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="bg-slate-800 p-2 rounded-full hover:bg-primary hover:text-white transition-all"
                title="Facebook"
              >
                <Facebook size={20} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="bg-slate-800 p-2 rounded-full hover:bg-primary hover:text-white transition-all"
                title="Instagram"
              >
                <Instagram size={20} />
              </a>
              <a
                href="https://zalo.me"
                target="_blank"
                rel="noreferrer"
                className="bg-slate-800 p-2 rounded-full hover:bg-primary hover:text-white transition-all"
                title="Zalo"
              >
                <MessageCircle size={20} />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
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
