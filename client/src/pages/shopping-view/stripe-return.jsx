import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { capturePayment } from "@/store/shop/order-slice";
import { clearCart } from "@/store/shop/cart-slice";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";

function StripeReturnPage() {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  // Lấy params từ Stripe success_url
  const params = new URLSearchParams(location.search);
  const orderId = params.get("orderId");
  const sessionId = params.get("session_id");

  useEffect(() => {
    if (orderId && sessionId) {
      // Gọi action capturePayment với tham số mới
      dispatch(capturePayment({ orderId, sessionId })).then((data) => {
        sessionStorage.removeItem("currentOrderId");
        if (data?.payload?.success) {
          dispatch(clearCart());
          navigate(`/shop/payment-success?orderId=${orderId}`);
        }
      });
    }
  }, [orderId, sessionId, dispatch, navigate]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Processing Stripe Payment... Please wait!</CardTitle>
      </CardHeader>
    </Card>
  );
}

export default StripeReturnPage;