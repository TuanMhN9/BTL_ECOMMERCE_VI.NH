import { Card, CardContent, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { brandOptionsMap, categoryOptionsMap } from "@/config";
import { Badge } from "../ui/badge";
import { useState } from "react";

function ShoppingProductTile({
  product,
  handleGetProductDetails,
  handleAddtoCart,
}) {
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");

  const isSelectionRequired =
    (product?.sizes?.length > 0 && !selectedSize) ||
    (product?.colors?.length > 0 && !selectedColor);

  return (
    <Card className="w-full max-w-sm mx-auto flex flex-col h-full overflow-hidden">
      <div onClick={() => handleGetProductDetails(product?._id)} className="cursor-pointer group">
        <div className="relative overflow-hidden">
          <img
            src={product?.image}
            alt={product?.title}
            className="w-full h-[300px] object-cover rounded-t-lg transition-transform duration-300 group-hover:scale-110"
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
        <CardContent className="p-4 flex-1">
          <h2 className="text-xl font-bold mb-1 truncate">{product?.title}</h2>
          <div className="flex justify-between items-center mb-2">
            <span className="text-[14px] text-muted-foreground">
              {categoryOptionsMap[product?.category]}
            </span>
            <span className="text-[14px] text-muted-foreground">
              {brandOptionsMap[product?.brand]}
            </span>
          </div>
          <div className="flex justify-between items-center mb-3">
            <span
              className={`${
                product?.salePrice > 0 ? "line-through opacity-50" : ""
              } text-lg font-semibold text-primary`}
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
                <span className="text-[12px] font-semibold text-muted-foreground uppercase">Size:</span>
                <div className="flex flex-wrap gap-1">
                  {product?.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSize(selectedSize === size ? "" : size);
                      }}
                      className={`min-w-[32px] h-8 flex items-center justify-center text-[12px] font-medium border transition-all duration-200 ${
                        selectedSize === size
                          ? "bg-primary text-primary-foreground border-primary shadow-md"
                          : "bg-background text-foreground border-muted hover:border-primary"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
            {product?.colors && product?.colors.length > 0 ? (
              <div className="flex flex-col gap-1">
                <span className="text-[12px] font-semibold text-muted-foreground uppercase">Color:</span>
                <div className="flex flex-wrap gap-1">
                  {product?.colors.map((color) => (
                    <button
                      key={color}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedColor(selectedColor === color ? "" : color);
                      }}
                      className={`w-8 h-8 border transition-all duration-200 relative ${
                        selectedColor === color
                          ? "p-0.5 border-primary shadow-md ring-1 ring-primary"
                          : "p-1 border-muted hover:border-primary"
                      }`}
                    >
                      <div
                        className="w-full h-full"
                        style={{ backgroundColor: color.toLowerCase() }}
                        title={color}
                      />
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </CardContent>
      </div>
      <CardFooter className="p-4 pt-0">
        {product?.totalStock <= 0 ? (
          <Button className="w-full opacity-60 cursor-not-allowed" disabled>
            Out Of Stock
          </Button>
        ) : (
          <div className="flex flex-col w-full gap-2">
            <Button
              onClick={() => {
                if (!isSelectionRequired) {
                  handleAddtoCart(
                    product?._id,
                    product?.totalStock,
                    selectedSize,
                    selectedColor
                  );
                }
              }}
              disabled={isSelectionRequired}
              className={`w-full font-bold transition-all duration-300 ${
                isSelectionRequired
                  ? "bg-muted text-muted-foreground hover:bg-muted"
                  : "bg-primary hover:bg-primary/90"
              }`}
            >
              {isSelectionRequired ? "Select Variants" : "Add to Cart"}
            </Button>
            {isSelectionRequired && (
               <p className="text-[10px] text-destructive font-medium text-center animate-pulse">
                Please pick a size and color
              </p>
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  );
}

export default ShoppingProductTile;
