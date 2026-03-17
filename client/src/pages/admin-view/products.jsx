import ProductImageUpload from "@/components/admin-view/image-upload";
import AdminProductTile from "@/components/admin-view/product-tile";
import CommonForm from "@/components/common/form";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useToast } from "@/components/ui/use-toast";
import { addProductFormElements } from "@/config";
import {
  addNewProduct,
  deleteProduct,
  editProduct,
  fetchAllProducts,
} from "@/store/admin/products-slice";
import { Fragment, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const initialFormData = {
  image: null,
  images: [],
  title: "",
  description: "",
  category: "",
  brand: "",
  price: "",
  salePrice: "",
  totalStock: "",
  sizes: [],
  colors: [],
  averageReview: 0,
};

function AdminProducts() {
  const [openCreateProductsDialog, setOpenCreateProductsDialog] =
    useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [imageFile, setImageFile] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState([]);
  const [imageLoadingState, setImageLoadingState] = useState(false);
  const [currentEditedId, setCurrentEditedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showOutOfStockOnly, setShowOutOfStockOnly] = useState(false);

  const { productList } = useSelector((state) => state.adminProducts);
  const dispatch = useDispatch();
  const { toast } = useToast();

  const filteredProducts =
    productList && productList.length > 0
      ? productList.filter((productItem) => {
        const matchesSearch = productItem.title
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        const matchesStock = showOutOfStockOnly
          ? productItem.totalStock <= 0
          : true;

        return matchesSearch && matchesStock;
      })
      : [];

  function onSubmit(event) {
    event.preventDefault();

    currentEditedId !== null
      ? dispatch(
        editProduct({
          id: currentEditedId,
          formData: {
            ...formData,
            images: uploadedImageUrl,
            image: uploadedImageUrl.length > 0 ? uploadedImageUrl[0] : ""
          },
        })
      ).then((data) => {
        console.log(data, "edit");

        if (data?.payload?.success) {
          dispatch(fetchAllProducts());
          setFormData(initialFormData);
          setOpenCreateProductsDialog(false);
          setCurrentEditedId(null);
        }
      })
      : dispatch(
        addNewProduct({
          ...formData,
          images: uploadedImageUrl,
          image: uploadedImageUrl.length > 0 ? uploadedImageUrl[0] : "",
        })
      ).then((data) => {
        if (data?.payload?.success) {
          dispatch(fetchAllProducts());
          setOpenCreateProductsDialog(false);
          setImageFile(null);
          setFormData(initialFormData);
          toast({
            title: "Product add successfully",
          });
        }
      });
  }

  function handleDelete(getCurrentProductId) {
    dispatch(deleteProduct(getCurrentProductId)).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchAllProducts());
      }
    });
  }

  function isFormValid() {
    const isSalePriceValid =
      formData.salePrice === "" || 
      formData.salePrice === 0 ||
      Number(formData.salePrice) < Number(formData.price);

    return (
      Object.keys(formData)
        .filter(
          (currentKey) =>
            currentKey !== "averageReview" &&
            currentKey !== "salePrice" &&
            currentKey !== "description" &&
            currentKey !== "image" &&
            currentKey !== "images" &&
            !currentKey.endsWith("_input")
        )
        .map((key) => {
          const value = formData[key];
          if (Array.isArray(value)) return value.length > 0;
          return value !== "" && value !== null && value !== undefined;
        })
        .every((item) => item) && 
      formData.totalStock >= 0 &&
      isSalePriceValid &&
      uploadedImageUrl.length > 0
    );
  }

  useEffect(() => {
    dispatch(fetchAllProducts());
  }, [dispatch]);

  // Sync images when editing
  useEffect(() => {
    if (currentEditedId !== null && openCreateProductsDialog) {
      const existingImages = 
        formData.images && formData.images.length > 0 
          ? formData.images 
          : (formData.image ? [formData.image] : []);
      
      if (existingImages.length > 0 && uploadedImageUrl.length === 0) {
        setUploadedImageUrl(existingImages);
        setImageFile(existingImages); 
      }
    }
  }, [currentEditedId, formData, openCreateProductsDialog]);

  return (
    <Fragment>
      <div className="mb-5 w-full flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-4 w-full md:w-auto">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products..."
              className="pl-8 bg-background"
            />
          </div>
          <div className="flex items-center space-x-2 border p-2 rounded-md bg-background min-w-fit">
            <Checkbox
              id="outOfStock"
              checked={showOutOfStockOnly}
              onCheckedChange={(checked) => setShowOutOfStockOnly(checked)}
            />
            <Label
              htmlFor="outOfStock"
              className="text-sm font-medium leading-none cursor-pointer"
            >
              Hết hàng
            </Label>
          </div>
        </div>
        <Button onClick={() => setOpenCreateProductsDialog(true)}>
          Add New Product
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        {filteredProducts && filteredProducts.length > 0
          ? filteredProducts.map((productItem) => (
            <AdminProductTile
              setFormData={setFormData}
              setOpenCreateProductsDialog={setOpenCreateProductsDialog}
              setCurrentEditedId={setCurrentEditedId}
              product={productItem}
              handleDelete={handleDelete}
            />
          ))
          : null}
      </div>
      <Sheet
        open={openCreateProductsDialog}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setOpenCreateProductsDialog(false);
            setCurrentEditedId(null);
            setFormData(initialFormData);
            setUploadedImageUrl([]);
            setImageFile(null);
          }
        }}
      >
        <SheetContent side="right" className="overflow-auto">
          <SheetHeader>
            <SheetTitle>
              {currentEditedId !== null ? "Edit Product" : "Add New Product"}
            </SheetTitle>
          </SheetHeader>
          <ProductImageUpload
            imageFile={imageFile}
            setImageFile={setImageFile}
            uploadedImageUrl={uploadedImageUrl}
            setUploadedImageUrl={setUploadedImageUrl}
            setImageLoadingState={setImageLoadingState}
            imageLoadingState={imageLoadingState}
            isEditMode={currentEditedId !== null}
            isMulti={true}
          />
          <div className="py-6">
            <CommonForm
              onSubmit={onSubmit}
              formData={formData}
              setFormData={setFormData}
              buttonText={currentEditedId !== null ? "Edit" : "Add"}
              formControls={addProductFormElements}
              isBtnDisabled={!isFormValid()}
              errors={
                formData.salePrice !== "" &&
                formData.salePrice > 0 &&
                Number(formData.salePrice) >= Number(formData.price)
                  ? { salePrice: "Giá sale phải nhỏ hơn giá gốc!" }
                  : {}
              }
            />
          </div>
        </SheetContent>
      </Sheet>
    </Fragment>
  );
}

export default AdminProducts;
