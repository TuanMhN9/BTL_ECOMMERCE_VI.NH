import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardFooter } from "../ui/card";

function AdminProductTile({
  product,
  setFormData,
  setOpenCreateProductsDialog,
  setCurrentEditedId,
  handleDelete,
}) {
  return (
    <Card className="w-full max-w-sm mx-auto flex flex-col h-full">
      <div className="relative">
        <img
          src={product?.image}
          alt={product?.title}
          className="w-full h-[300px] object-cover rounded-t-lg"
        />
        {product?.totalStock === 0 ? (
          <Badge
            variant="destructive"
            className="absolute top-2 left-2 px-2 py-1 text-xs font-bold uppercase"
          >
            Out of Stock
          </Badge>
        ) : null}
      </div>
      <CardContent className="flex-1">
        <h2 className="text-xl font-bold mb-2 mt-2">{product?.title}</h2>
        <div className="flex justify-between items-center mb-2">
          <span
            className={`${
              product?.salePrice > 0 ? "line-through" : ""
            } text-lg font-semibold text-primary`}
          >
            ${product?.price}
          </span>
          {product?.salePrice > 0 ? (
            <span className="text-lg font-bold">${product?.salePrice}</span>
          ) : null}
        </div>
        <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-muted-foreground">Stock: {product?.totalStock}</span>
        </div>
        <div className="flex flex-col gap-2 mt-2">
          {product?.sizes && product?.sizes.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {product?.sizes.map((size) => (
                <Badge key={size} variant="secondary" className="text-[10px] px-1 py-0 uppercase">
                  {size}
                </Badge>
              ))}
            </div>
          ) : null}
          {product?.colors && product?.colors.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {product?.colors.map((color) => (
                <div
                  key={color}
                  className="w-3 h-3 rounded-sm border border-muted"
                  style={{ backgroundColor: color.toLowerCase() }}
                  title={color}
                />
              ))}
            </div>
          ) : null}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <Button
          onClick={() => {
            setOpenCreateProductsDialog(true);
            setCurrentEditedId(product?._id);
            setFormData(product);
          }}
        >
          Edit
        </Button>
        <Button onClick={() => handleDelete(product?._id)}>Delete</Button>
      </CardFooter>
    </Card>
  );
}

export default AdminProductTile;
