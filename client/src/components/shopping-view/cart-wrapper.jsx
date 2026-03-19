import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";
import UserCartItemsContent from "./cart-items-content";
import { useDispatch, useSelector } from "react-redux";
import { selectAllItems, clearSelectedItems } from "@/store/shop/cart-slice";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { useToast } from "../ui/use-toast";

function UserCartWrapper({ cartItems, setOpenCartSheet }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { selectedItems = [] } = useSelector((state) => state.shopCart);

  const allItemIds = cartItems && cartItems.length > 0
    ? cartItems.map(item => `${item.productId}-${item.size || ''}-${item.color || ''}`)
    : [];

  const isAllSelected = cartItems && cartItems.length > 0 && selectedItems?.length === cartItems.length;

  const handleSelectAll = () => {
    if (isAllSelected) {
      dispatch(clearSelectedItems());
    } else {
      dispatch(selectAllItems(allItemIds));
    }
  };

  const selectedCartItems = cartItems && cartItems.length > 0
    ? cartItems.filter(item => (selectedItems || []).includes(`${item.productId}-${item.size || ''}-${item.color || ''}`))
    : [];

  const totalCartAmount =
    selectedCartItems && selectedCartItems.length > 0
      ? selectedCartItems.reduce(
        (sum, currentItem) =>
          sum +
          (currentItem?.salePrice > 0
            ? currentItem?.salePrice
            : currentItem?.price) *
          currentItem?.quantity,
        0
      )
      : 0;

  return (
    <SheetContent className="sm:max-w-md overflow-y-auto">
      <SheetHeader>
        <SheetTitle>Your Cart</SheetTitle>
      </SheetHeader>
      
      {cartItems && cartItems.length > 0 ? (
        <div className="flex items-center space-x-2 mt-4 ml-1">
          <Checkbox id="selectAll" checked={isAllSelected} onCheckedChange={handleSelectAll} />
          <Label htmlFor="selectAll" className="font-semibold cursor-pointer">Select All Items</Label>
        </div>
      ) : null}

      <div className="mt-8 space-y-4">
        {cartItems && cartItems.length > 0
          ? cartItems.map((item, idx) => <UserCartItemsContent key={idx} cartItem={item} />)
          : null}
      </div>
      <div className="mt-8 space-y-4">
        <div className="flex justify-between">
          <span className="font-bold">Total</span>
          <span className="font-bold">${totalCartAmount}</span>
        </div>
      </div>
      <Button
        onClick={() => {
          if (!selectedItems || selectedItems.length === 0) {
            toast({
              title: "Please select at least one item to checkout",
              variant: "destructive",
            });
            return;
          }
          navigate("/shop/checkout");
          setOpenCartSheet(false);
        }}
        className="w-full mt-6"
      >
        Checkout Selected Items
      </Button>
    </SheetContent>
  );
}

export default UserCartWrapper;
