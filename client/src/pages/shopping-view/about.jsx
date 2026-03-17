import React from "react";

function ShoppingAbout() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">
          Về Chúng Tôi
        </h1>
        <div className="max-w-3xl mx-auto space-y-8 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Câu Chuyện Của Chúng Tôi</h2>
            <p className="text-lg">
              Chào mừng bạn đến với cửa hàng của chúng tôi! Được thành lập với niềm đam mê mang đến những sản phẩm chất lượng nhất cho khách hàng, chúng tôi luôn nỗ lực không ngừng để hoàn thiện dịch vụ và trải nghiệm mua sắm của bạn.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Sứ Mệnh</h2>
            <p className="text-lg">
              Sứ mệnh của chúng tôi là cung cấp những sản phẩm đa dạng, từ thời trang đến đồ gia dụng, với mức giá hợp lý nhất mà không làm giảm đi chất lượng. Chúng tôi tin rằng mọi người đều xứng đáng được sử dụng những sản phẩm tốt nhất.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Giá Trị Cốt Lõi</h2>
            <ul className="list-disc pl-6 space-y-4 text-lg">
              <li><strong>Chất lượng hàng đầu:</strong> Mọi sản phẩm đều được kiểm tra kỹ lưỡng trước khi đến tay bạn.</li>
              <li><strong>Khách hàng là trọng tâm:</strong> Sự hài lòng của bạn là thước đo thành công của chúng tôi.</li>
              <li><strong>Sự minh bạch:</strong> Luôn trung thực trong mọi quy trình kinh doanh và giao dịch.</li>
            </ul>
          </section>

          <section className="bg-gray-50 p-8 rounded-xl border border-gray-100 shadow-sm mt-12">
            <p className="text-xl font-medium text-center italic text-gray-600">
              "Cảm ơn bạn đã tin tưởng và đồng hành cùng chúng tôi trên hành trình phát triển!"
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

export default ShoppingAbout;
