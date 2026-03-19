import { Minus, Plus, Trash } from "lucide-react";
import { Button } from "../ui/button";
import { useDispatch, useSelector } from "react-redux";
import { deleteCartItem, updateCartQuantity } from "@/store/shop/cart-slice";
import { useToast } from "../ui/use-toast";
import { useState, useEffect } from "react";
import { Input } from "../ui/input";
import { Checkbox } from "../ui/checkbox";
import { toggleSelectItem } from "@/store/shop/cart-slice";

function UserCartItemsContent({ cartItem }) {
  const { user } = useSelector((state) => state.auth);
  const { cartItems, selectedItems = [] } = useSelector((state) => state.shopCart);
  const { productList } = useSelector((state) => state.shopProducts);
  const dispatch = useDispatch();
  const { toast } = useToast();
  const [quantityInput, setQuantityInput] = useState(cartItem?.quantity || 1);

  const itemId = `${cartItem.productId}-${cartItem.size || ''}-${cartItem.color || ''}`;
  const isSelected = (selectedItems || []).includes(itemId);

  const handleToggleSelect = () => {
    dispatch(toggleSelectItem({ id: itemId }));
  };

  useEffect(() => {
    setQuantityInput(cartItem?.quantity || 1);
  }, [cartItem?.quantity]);

  function handleUpdateQuantity(getCartItem, typeOfAction) {
    if (typeOfAction == "plus") {
      let getCartItems = cartItems.items || [];

      if (getCartItems.length) {
        const indexOfCurrentCartItem = getCartItems.findIndex(
          (item) =>
            item.productId === getCartItem?.productId &&
            item.size === getCartItem?.size &&
            item.color === getCartItem?.color
        );

        const getCurrentProductIndex = productList.findIndex(
          (product) => product._id === getCartItem?.productId
        );
        const getTotalStock =
          getCurrentProductIndex > -1
            ? productList[getCurrentProductIndex].totalStock
            : null;

        console.log(getCurrentProductIndex, getTotalStock, "getTotalStock");

        if (indexOfCurrentCartItem > -1 && getTotalStock !== null) {
          const getQuantity = getCartItems[indexOfCurrentCartItem].quantity;
          if (getQuantity + 1 > getTotalStock) {
            toast({
              title: `Only ${getQuantity} quantity can be added for this item`,
              variant: "destructive",
            });

            return;
          }
        }
      }
    }

    dispatch(
      updateCartQuantity({
        userId: user?.id,
        productId: getCartItem?.productId,
        size: getCartItem?.size,
        color: getCartItem?.color,
        quantity:
          typeOfAction === "plus"
            ? getCartItem?.quantity + 1
            : getCartItem?.quantity - 1,
      })
    ).then((data) => {
      if (data?.payload?.success) {
        toast({
          title: "Cart item is updated successfully",
        });
      } else {
        toast({
          title: data?.payload?.message || "Requested quantity is not available",
          variant: "destructive",
        });
      }
    });
  }

  function handleCartItemDelete(getCartItem) {
    dispatch(
      deleteCartItem({
        userId: user?.id,
        productId: getCartItem?.productId,
        size: getCartItem?.size,
        color: getCartItem?.color,
      })
    ).then((data) => {
      if (data?.payload?.success) {
        toast({
          title: "Cart item is deleted successfully",
        });
      }
    });
  }

  function handleQuantityChange(newQuantity) {
    const quantity = parseInt(newQuantity);
    if (isNaN(quantity) || quantity < 1) {
      setQuantityInput(cartItem?.quantity || 1);
      return;
    }

    // Check stock
    let getCartItems = cartItems.items || [];
    const getCurrentProductIndex = productList.findIndex(
      (product) => product._id === cartItem?.productId
    );
    let getTotalStock = getCurrentProductIndex > -1
      ? productList[getCurrentProductIndex].totalStock
      : null;

    // If variant, check variant stock
    if (cartItem?.size && cartItem?.color && getCurrentProductIndex > -1) {
      const product = productList[getCurrentProductIndex];
      if (product.variants && product.variants.length > 0) {
        const variant = product.variants.find(v => v.size === cartItem.size && v.color === cartItem.color);
        if (variant) getTotalStock = variant.stock;
      }
    }

    if (quantity > getTotalStock) {
      toast({
        title: `Only ${getTotalStock} quantity available for this item`,
        variant: "destructive",
      });
      setQuantityInput(cartItem?.quantity || 1);
      return;
    }

    dispatch(
      updateCartQuantity({
        userId: user?.id,
        productId: cartItem?.productId,
        size: cartItem?.size,
        color: cartItem?.color,
        quantity: quantity,
      })
    ).then((data) => {
      if (data?.payload?.success) {
        toast({
          title: "Cart item is updated successfully",
        });
        setQuantityInput(quantity);
      } else {
        toast({
          title: data?.payload?.message || "Requested quantity is not available",
          variant: "destructive",
        });
        setQuantityInput(cartItem?.quantity || 1);
      }
    });
  }

  return (
    <div className="flex items-center space-x-4">
      <Checkbox
        checked={isSelected}
        onCheckedChange={handleToggleSelect}
        className="flex-shrink-0 mr-2"
      />
      <img
        src={cartItem?.image}
        alt={cartItem?.title}
        className="w-20 h-20 rounded object-cover"
      />
      <div className="flex-1">
        <h3 className="font-extrabold">{cartItem?.title}</h3>
        <div className="flex flex-col gap-1 mt-1">
          {cartItem?.size ? (
            <span className="text-sm text-muted-foreground">
              Size: {cartItem.size}
            </span>
          ) : null}
          {cartItem?.color ? (
            <span className="text-sm text-muted-foreground">
              Color: {cartItem.color}
            </span>
          ) : null}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <Button
            variant="outline"
            className="h-8 w-8 rounded-full"
            size="icon"
            disabled={cartItem?.quantity === 1}
            onClick={() => {
              handleUpdateQuantity(cartItem, "minus");
              setQuantityInput(cartItem?.quantity - 1);
            }}
          >
            <Minus className="w-4 h-4" />
            <span className="sr-only">Decrease</span>
          </Button>
          <Input
            type="number"
            min="1"
            value={quantityInput}
            onChange={(e) => setQuantityInput(e.target.value)}
            onBlur={(e) => handleQuantityChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleQuantityChange(e.target.value);
              }
            }}
            className="w-16 h-8 text-center font-semibold"
          />
          <Button
            variant="outline"
            className="h-8 w-8 rounded-full"
            size="icon"
            onClick={() => {
              handleUpdateQuantity(cartItem, "plus");
              setQuantityInput(cartItem?.quantity + 1);
            }}
          >
            <Plus className="w-4 h-4" />
            <span className="sr-only">Increase</span>
          </Button>
        </div>
      </div>
      <div className="flex flex-col items-end">
        <p className="font-semibold">
          $
          {(
            (cartItem?.salePrice > 0 ? cartItem?.salePrice : cartItem?.price) *
            cartItem?.quantity
          ).toFixed(2)}
        </p>
        <Trash
          onClick={() => handleCartItemDelete(cartItem)}
          className="cursor-pointer mt-1"
          size={20}
        />
      </div>
    </div>
  );
}

export default UserCartItemsContent;
