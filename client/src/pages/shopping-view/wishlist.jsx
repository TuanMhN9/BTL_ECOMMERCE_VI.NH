import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchWishlist, removeFromWishlist } from "@/store/shop/wishlist-slice";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import ShoppingProductTile from "@/components/shopping-view/product-tile";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Heart, ShoppingCart } from "lucide-react";

function ShoppingWishlist() {
  const dispatch = useDispatch();
  const { wishlist, isLoading } = useSelector((state) => state.wishlist);
  const { cartItems } = useSelector((state) => state.shopCart);
  const { user } = useSelector((state) => state.auth);
  const { toast } = useToast();
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchWishlist(user.id));
    }
  }, [dispatch, user?.id]);

  function handleGetProductDetails(getCurrentProductId) {
    // Implement product details dialog if needed
    console.log(getCurrentProductId);
  }

  function handleAddtoCart(getCurrentProductId, getTotalStock, size, color) {
    let getCartItems = cartItems.items || [];

    if (getCartItems.length) {
      const indexOfCurrentItem = getCartItems.findIndex(
        (item) =>
          item.productId === getCurrentProductId &&
          item.size === size &&
          item.color === color
      );
      if (indexOfCurrentItem > -1) {
        const getQuantity = getCartItems[indexOfCurrentItem].quantity;
        if (getQuantity + 1 > getTotalStock) {
          toast({
            title: `Only ${getQuantity} quantity can be added for this item`,
            variant: "destructive",
          });
          return;
        }
      }
    }

    dispatch(
      addToCart({
        userId: user?.id,
        productId: getCurrentProductId,
        quantity: 1,
        size,
        color,
      })
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchCartItems(user?.id));
        toast({
          title: "Product is added to cart",
        });
      } else {
        toast({
          title: data?.payload?.message || "Requested quantity is not available",
          variant: "destructive",
        });
      }
    });
  }

  function handleRemoveFromWishlist(productId) {
    dispatch(removeFromWishlist({ userId: user?.id, productId })).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchWishlist(user.id));
        toast({
          title: "Product removed from wishlist",
        });
      }
    });
  }

  if (isLoading) {
    return <div className="text-center py-12">Loading wishlist...</div>;
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 lg:p-12 xl:p-16">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-center">My Wishlist</h1>
        <p className="text-muted-foreground text-center mt-2">
          {wishlist?.length || 0} items in your wishlist
        </p>
      </div>

      {wishlist && wishlist.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {wishlist.map((wishlistItem) => (
            <div key={wishlistItem.productId._id} className="relative">
              <ShoppingProductTile
                product={wishlistItem.productId}
                handleGetProductDetails={handleGetProductDetails}
                handleAddtoCart={handleAddtoCart}
              />
              <Button
                onClick={() => handleRemoveFromWishlist(wishlistItem.productId._id)}
                variant="outline"
                size="icon"
                className="absolute top-2 right-2 bg-white border border-gray-300 hover:bg-gray-50"
              >
                <Heart className="h-4 w-4 text-red-500 fill-red-500" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">Your wishlist is empty</h2>
          <p className="text-muted-foreground">Start adding products you love!</p>
        </div>
      )}
    </div>
  );
}

export default ShoppingWishlist;