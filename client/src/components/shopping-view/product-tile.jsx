import { Card, CardContent, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { brandOptionsMap, categoryOptionsMap } from "@/config";
import { Badge } from "../ui/badge";
import { useState } from "react";
import { useToast } from "../ui/use-toast";

function ShoppingProductTile({
  product,
  handleGetProductDetails,
  handleAddtoCart,
}) {
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const { toast } = useToast();

  const isSelectionRequired = product?.sizes?.length > 0 || product?.colors?.length > 0;

  const getVariantStock = (size, color) => {
    if (!product?.variants) return product?.totalStock || 0;
    const variant = product.variants.find(v => v.size === size && v.color === color);
    return variant ? variant.stock : 0;
  };

  const isVariantOutOfStock = (size, color) => {
    return getVariantStock(size, color) <= 0;
  };

  return (
    <Card className="w-full max-w-xs mx-auto flex flex-col h-full overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow border border-gray-200">
      <div onClick={() => handleGetProductDetails(product?._id)} className="cursor-pointer group">
        <div className="relative overflow-hidden">
          <img
            src={product?.image}
            alt={product?.title}
            className="w-full aspect-[3/4] object-cover rounded-t-lg transition-transform duration-300 group-hover:scale-110"
          />
          {product?.totalStock <= 0 ? (
            <Badge className="absolute top-2 left-2 bg-red-500 hover:bg-red-600">
              Out Of Stock
            </Badge>
          ) : product?.totalStock < 10 ? (
            <Badge className="absolute top-2 left-2 bg-red-500 hover:bg-red-600">
              {`Only ${product?.totalStock} items left`}
            </Badge>
          ) : product?.salePrice > 0 ? (
            <Badge className="absolute top-2 left-2 bg-red-500 hover:bg-red-600">
              Sale
            </Badge>
          ) : null}
        </div>
        <CardContent className="p-3 flex-1">
          <h2 className="text-xl font-semibold mb-1 truncate leading-tight">{product?.title}</h2>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">
              {categoryOptionsMap[product?.category]}
            </span>
            <span className="text-sm text-muted-foreground">
              {brandOptionsMap[product?.brand]}
            </span>
          </div>
          <div className="flex justify-between items-center mb-3">
            <span
              className={`${product?.salePrice > 0 ? "line-through opacity-50" : ""
                } text-base font-semibold text-primary`}
            >
              ${product?.price}
            </span>
            {product?.salePrice > 0 ? (
              <span className="text-xl font-bold text-red-600">
                ${product?.salePrice}
              </span>
            ) : null}
          </div>

          <div className="flex flex-col gap-3 pt-2 border-t border-muted">
            {product?.sizes && product?.sizes.length > 0 ? (
              <div className="flex flex-col gap-1">
                <div className="flex gap-1 overflow-hidden">
                  {product?.sizes.slice(0, 4).map((size) => {
                    const isOutOfStock = isVariantOutOfStock(size, selectedColor || product?.colors?.[0] || "");
                    return (
                      <button
                        key={size}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!isOutOfStock) {
                            setSelectedSize(selectedSize === size ? "" : size);
                          }
                        }}
                        className={`w-10 h-10 flex items-center justify-center text-sm font-medium border transition-all duration-200 rounded-none flex-shrink-0 ${
                          isOutOfStock
                            ? "line-through opacity-50 cursor-not-allowed bg-gray-100"
                            : selectedSize === size
                            ? "bg-primary text-primary-foreground border-primary shadow-md"
                            : "bg-background text-foreground border-muted hover:border-primary"
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                  {product?.sizes.length > 4 && (
                    <button
                      className="w-10 h-10 flex items-center justify-center text-sm font-medium border border-muted bg-background text-foreground rounded-none cursor-default flex-shrink-0"
                    >
                      +{product?.sizes.length - 4}
                    </button>
                  )}
                </div>
              </div>
            ) : null}
            {product?.colors && product?.colors.length > 0 ? (
              <div className="flex flex-col gap-1">
                <div className="flex gap-1 overflow-hidden">
                  {product?.colors.slice(0, 5).map((color) => {
                    const isOutOfStock = isVariantOutOfStock(selectedSize || product?.sizes?.[0] || "", color);
                    return (
                      <button
                        key={color}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!isOutOfStock) {
                            setSelectedColor(selectedColor === color ? "" : color);
                          }
                        }}
                        className={`w-8 h-8 border transition-all duration-200 relative rounded-none flex-shrink-0 ${
                          isOutOfStock
                            ? "line-through opacity-50 cursor-not-allowed"
                            : selectedColor === color
                            ? "p-0.5 border-primary shadow-md ring-1 ring-primary"
                            : "p-1 border-muted hover:border-primary"
                        }`}
                      >
                        <div
                          className={`w-full h-full ${isOutOfStock ? "line-through" : ""}`}
                          style={{ backgroundColor: color.toLowerCase() }}
                          title={color}
                        />
                      </button>
                    );
                  })}
                  {product?.colors.length > 5 && (
                    <button
                      className="w-8 h-8 flex items-center justify-center text-sm font-medium border border-muted bg-background text-foreground rounded-none cursor-default flex-shrink-0"
                    >
                      +{product?.colors.length - 5}
                    </button>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </CardContent>
      </div>
      <CardFooter className="p-3 pt-0">
        {product?.totalStock <= 0 ? (
          <Button className="w-full opacity-60 cursor-not-allowed h-10 rounded-none uppercase font-semibold" disabled>
            Out Of Stock
          </Button>
        ) : (
          <div className="flex flex-col w-full gap-2">
            <Button
              onClick={(e) => {
                e.stopPropagation();
                if (isSelectionRequired) {
                  const isSizeMissing = product?.sizes?.length > 0 && !selectedSize;
                  const isColorMissing = product?.colors?.length > 0 && !selectedColor;

                  if (isSizeMissing && isColorMissing) {
                    toast({
                      title: "Please select size and color",
                      variant: "destructive",
                    });
                  } else if (isSizeMissing) {
                    toast({
                      title: "Please select a size",
                      variant: "destructive",
                    });
                  } else if (isColorMissing) {
                    toast({
                      title: "Please select a color",
                      variant: "destructive",
                    });
                  } else {
                    handleAddtoCart(
                      product?._id,
                      product?.totalStock,
                      selectedSize,
                      selectedColor
                    );
                  }
                } else {
                  handleAddtoCart(
                    product?._id,
                    product?.totalStock,
                    selectedSize,
                    selectedColor
                  );
                }
              }}
              className="w-full h-10 font-semibold bg-black hover:bg-gray-800 transition-all duration-300 rounded-none uppercase"
            >
              Add to Cart
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}

export default ShoppingProductTile;
