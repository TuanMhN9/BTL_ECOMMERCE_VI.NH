import { StarIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import { Dialog, DialogContent } from "../ui/dialog";
import { Separator } from "../ui/separator";
import { Input } from "../ui/input";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { useToast } from "../ui/use-toast";
import { setProductDetails } from "@/store/shop/products-slice";
import { Label } from "../ui/label";
import StarRatingComponent from "../common/star-rating";
import { useEffect, useState } from "react";
import { addReview, getReviews } from "@/store/shop/review-slice";

function ProductDetailsDialog({ open, setOpen, productDetails }) {
  const [reviewMsg, setReviewMsg] = useState("");
  const [rating, setRating] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);
  const { reviews } = useSelector((state) => state.shopReview);

  const { toast } = useToast();

  function handleRatingChange(getRating) {
    console.log(getRating, "getRating");

    setRating(getRating);
  }

  function handleAddToCart(getCurrentProductId, getTotalStock) {
    let getCartItems = cartItems.items || [];

    if (getCartItems.length) {
      const indexOfCurrentItem = getCartItems.findIndex(
        (item) => item.productId === getCurrentProductId
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
    if (
      productDetails?.sizes &&
      productDetails.sizes.length > 0 &&
      selectedSize === ""
    ) {
      toast({
        title: "Please select a size",
        variant: "destructive",
      });
      return;
    }

    if (
      productDetails?.colors &&
      productDetails.colors.length > 0 &&
      selectedColor === ""
    ) {
      toast({
        title: "Please select a color",
        variant: "destructive",
      });
      return;
    }

    dispatch(
      addToCart({
        userId: user?.id,
        productId: getCurrentProductId,
        quantity: 1,
        size: selectedSize,
        color: selectedColor,
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

  function handleDialogClose() {
    setOpen(false);
    dispatch(setProductDetails());
    setRating(0);
    setReviewMsg("");
    setSelectedSize("");
    setSelectedColor("");
  }

  function handleAddReview() {
    dispatch(
      addReview({
        productId: productDetails?._id,
        userId: user?.id,
        userName: user?.userName,
        reviewMessage: reviewMsg,
        reviewValue: rating,
      })
    ).then((data) => {
      if (data.payload.success) {
        setRating(0);
        setReviewMsg("");
        dispatch(getReviews(productDetails?._id));
        toast({
          title: "Review added successfully!",
        });
      }
    });
  }

  useEffect(() => {
    if (productDetails !== null) {
      dispatch(getReviews(productDetails?._id));
    }
  }, [productDetails, dispatch]);

  console.log(reviews, "reviews");

  const averageReview =
    reviews && reviews.length > 0
      ? reviews.reduce((sum, reviewItem) => sum + reviewItem.reviewValue, 0) /
        reviews.length
      : 0;

  const [mainImage, setMainImage] = useState("");

  useEffect(() => {
    if (productDetails) {
      setMainImage(productDetails.image);
    }
  }, [productDetails]);

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:p-12 max-w-[90vw] sm:max-w-[80vw] lg:max-w-[70vw] overflow-y-auto max-h-[90vh]">
        <div className="flex flex-col gap-4">
          <div className="relative overflow-hidden rounded-lg bg-muted aspect-square">
            <img
              src={mainImage || productDetails?.image}
              alt={productDetails?.title}
              width={600}
              height={600}
              className="w-full h-full object-cover transition-all duration-300 ease-in-out"
            />
          </div>
          {productDetails?.images && productDetails.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-primary/20">
              {productDetails.images.map((imgUrl, index) => (
                <div
                  key={index}
                  onClick={() => setMainImage(imgUrl)}
                  className={`relative flex-shrink-0 w-20 h-20 rounded-md overflow-hidden cursor-pointer border-2 transition-all duration-200 ${
                    mainImage === imgUrl
                      ? "border-primary scale-105 shadow-md"
                      : "border-transparent opacity-70 hover:opacity-100 hover:border-muted-foreground"
                  }`}
                >
                  <img
                    src={imgUrl}
                    alt={`${productDetails?.title} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="">
          <div>
            <h1 className="text-3xl font-extrabold">{productDetails?.title}</h1>
            <p className="text-muted-foreground text-xl mb-5 mt-4">
              {productDetails?.description}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <p
              className={`text-3xl font-bold text-primary ${
                productDetails?.salePrice > 0 ? "line-through" : ""
              }`}
            >
              ${productDetails?.price}
            </p>
            {productDetails?.salePrice > 0 ? (
              <p className="text-2xl font-bold text-muted-foreground">
                ${productDetails?.salePrice}
              </p>
            ) : null}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center gap-0.5">
              <StarRatingComponent rating={averageReview} />
            </div>
            <span className="text-muted-foreground">
              ({averageReview.toFixed(2)})
            </span>
          </div>
          <div className="flex flex-col gap-4 mt-5">
            {productDetails?.sizes && productDetails.sizes.length > 0 ? (
              <div className="flex flex-col gap-2">
                <span className="text-lg font-bold">Sizes</span>
                <div className="flex flex-wrap gap-2">
                  {productDetails.sizes.map((size) => (
                    <Button
                      key={size}
                      variant={selectedSize === size ? "default" : "outline"}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 transition-all duration-200 ${
                        selectedSize === size
                          ? "ring-2 ring-primary ring-offset-2 scale-105"
                          : "hover:bg-secondary/20"
                      }`}
                    >
                      {size}
                    </Button>
                  ))}
                </div>
              </div>
            ) : null}
            {productDetails?.colors && productDetails.colors.length > 0 ? (
              <div className="flex flex-col gap-2">
                <span className="text-lg font-bold">Colors</span>
                <div className="flex flex-wrap gap-2">
                  {productDetails.colors.map((color) => (
                    <Button
                      key={color}
                      variant={selectedColor === color ? "default" : "outline"}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 transition-all duration-200 ${
                        selectedColor === color
                          ? "ring-2 ring-primary ring-offset-2 scale-105"
                          : "hover:bg-secondary/20"
                      }`}
                    >
                      {color}
                    </Button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
          <div className="mt-5 mb-5 flex flex-col gap-3">
            {productDetails?.totalStock <= 0 ? (
              <Button className="w-full opacity-60 cursor-not-allowed">
                Out of Stock
              </Button>
            ) : (
              <>
                <Button
                  className={`w-full py-6 text-lg font-bold transition-all duration-300 ${
                    (productDetails?.sizes?.length > 0 && !selectedSize) ||
                    (productDetails?.colors?.length > 0 && !selectedColor)
                      ? "bg-muted-foreground/20 text-muted-foreground hover:bg-muted-foreground/30"
                      : "bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl"
                  }`}
                  onClick={() =>
                    handleAddToCart(
                      productDetails?._id,
                      productDetails?.totalStock
                    )
                  }
                >
                  Add to Cart
                </Button>
                {((productDetails?.sizes?.length > 0 && !selectedSize) ||
                  (productDetails?.colors?.length > 0 && !selectedColor)) && (
                  <p className="text-sm text-destructive font-medium text-center animate-pulse">
                    Please select your preferred size and color
                  </p>
                )}
              </>
            )}
          </div>
          <Separator />
          <div className="max-h-[300px] overflow-auto">
            <h2 className="text-xl font-bold mb-4">Reviews</h2>
            <div className="grid gap-6">
              {reviews && reviews.length > 0 ? (
                reviews.map((reviewItem) => (
                  <div className="flex gap-4">
                    <Avatar className="w-10 h-10 border">
                      <AvatarFallback>
                        {reviewItem?.userName[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid gap-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold">{reviewItem?.userName}</h3>
                      </div>
                      <div className="flex items-center gap-0.5">
                        <StarRatingComponent rating={reviewItem?.reviewValue} />
                      </div>
                      <p className="text-muted-foreground">
                        {reviewItem.reviewMessage}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <h1>No Reviews</h1>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ProductDetailsDialog;
