import { useSelector } from "react-redux";
import { Badge } from "../ui/badge";
import { DialogContent } from "../ui/dialog";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";

function ShoppingOrderDetailsView({ orderDetails }) {
  const { user } = useSelector((state) => state.auth);

  return (
    <DialogContent className="sm:max-w-[640px] border border-gray-200 bg-white p-0">
      <div className="grid gap-6">
        <div className="grid gap-2 px-6 pt-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-500">
              Order Code
            </p>
            <Label className="text-[11px] uppercase tracking-[0.14em] text-gray-900">
              {orderDetails?.orderCode || "—"}
            </Label>
          </div>
          <div className="flex items-center justify-between border-b border-gray-100 pb-2 pt-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-500">
              Order Date
            </p>
            <Label className="text-[11px] tracking-[0.1em] text-gray-900">
              {orderDetails?.orderDate?.split("T")?.[0] || "—"}
            </Label>
          </div>
          <div className="flex items-center justify-between border-b border-gray-100 pb-2 pt-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-500">
              Order Price
            </p>
            <Label className="text-[11px] tracking-[0.1em] text-gray-900">
              ${orderDetails?.totalAmount}
            </Label>
          </div>
          <div className="flex items-center justify-between border-b border-gray-100 pb-2 pt-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-500">
              Payment Method
            </p>
            <Label className="text-[11px] uppercase tracking-[0.14em] text-gray-900">
              {orderDetails?.paymentMethod}
            </Label>
          </div>
          <div className="flex items-center justify-between border-b border-gray-100 pb-2 pt-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-500">
              Payment Status
            </p>
            <Label className="text-[11px] uppercase tracking-[0.14em] text-gray-900">
              {orderDetails?.paymentStatus}
            </Label>
          </div>
          <div className="flex items-center justify-between pt-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-500">
              Order Status
            </p>
            <Label>
              <Badge
                className={`rounded-full px-2.5 py-1 text-[9px] uppercase tracking-[0.14em] ${
                  orderDetails?.orderStatus === "confirmed"
                    ? "bg-green-600"
                    : orderDetails?.orderStatus === "rejected"
                    ? "bg-red-600"
                    : "bg-gray-900"
                }`}
              >
                {orderDetails?.orderStatus}
              </Badge>
            </Label>
          </div>
        </div>
        <Separator className="bg-gray-200" />
        <div className="grid gap-4">
          <div className="grid gap-2 px-6">
            <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-gray-700">
              Order Details
            </div>
            <ul className="grid gap-3">
              {orderDetails?.cartItems && orderDetails?.cartItems.length > 0
                ? orderDetails?.cartItems.map((item, index) => (
                    <li
                      key={`${item?.productId || "item"}-${index}`}
                      className="flex items-center justify-between border-b border-gray-100 pb-3"
                    >
                      <div className="grid gap-1">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-900">
                          {item.title}
                        </span>
                        <div className="flex gap-2 text-[10px] uppercase tracking-[0.1em] text-gray-400">
                          {item.size ? <span>Size: {item.size}</span> : null}
                          {item.color ? <span>Color: {item.color}</span> : null}
                        </div>
                      </div>
                      <span className="text-[10px] uppercase tracking-[0.1em] text-gray-500">
                        Quantity: {item.quantity}
                      </span>
                      <span className="text-[11px] tracking-[0.08em] text-gray-900">
                        Price: ${item.price}
                      </span>
                    </li>
                  ))
                : null}
            </ul>
          </div>
        </div>
        <div className="grid gap-4">
          <div className="grid gap-2 px-6 pb-6">
            <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-gray-700">
              Shipping Info
            </div>
            <div className="grid gap-0.5 text-[11px] tracking-[0.08em] text-gray-500">
              <span>{user.userName}</span>
              <span>{orderDetails?.addressInfo?.address}</span>
              <span>{orderDetails?.addressInfo?.city}</span>
              <span>{orderDetails?.addressInfo?.pincode}</span>
              <span>{orderDetails?.addressInfo?.phone}</span>
              <span>{orderDetails?.addressInfo?.notes}</span>
            </div>
          </div>
        </div>
      </div>
    </DialogContent>
  );
}

export default ShoppingOrderDetailsView;
