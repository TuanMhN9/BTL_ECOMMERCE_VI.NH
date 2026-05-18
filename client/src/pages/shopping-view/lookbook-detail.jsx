import {
  fetchLookbookDetails,
  resetLookbookDetails,
} from "@/store/shop/lookbook-slice";
import { addToCart, fetchCartItems, setCheckoutItems, setBuyNowItems } from "@/store/shop/cart-slice";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

function ShoppingLookbookDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { lookbookDetails, isLoading } = useSelector((state) => state.shopLookbook);
  const { user } = useSelector((state) => state.auth);
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchLookbookDetails(id));
    }
    return () => {
      dispatch(resetLookbookDetails());
    };
  }, [id, dispatch]);

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-56px)] flex items-center justify-center bg-white">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-black border-t-transparent" />
      </div>
    );
  }

  if (!lookbookDetails) {
    return (
      <div className="min-h-[calc(100vh-56px)] flex items-center justify-center bg-white">
        <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400">
          Lookbook not found
        </p>
      </div>
    );
  }

  const products = lookbookDetails.products || [];

  const handleBuyAll = async () => {
    if (!user) {
      toast({ title: "Please login to add to cart", variant: "destructive" });
      return;
    }
    if (products.length === 0) return;

    setIsAdding(true);
    let successCount = 0;
    
    try {
      const addedKeys = [];
      const buyNowItemsArr = [];
      
      products.forEach((product) => {
        let selectedSize = "";
        let selectedColor = "";
        
        if (product.variants && product.variants.length > 0) {
          const availableVariant = product.variants.find(v => v.stock > 0) || product.variants[0];
          selectedSize = availableVariant.size;
          selectedColor = availableVariant.color;
        }

        addedKeys.push(`${product._id}-${selectedSize}-${selectedColor}`);
        buyNowItemsArr.push({
          productId: product._id,
          quantity: 1,
          size: selectedSize,
          color: selectedColor
        });
      });

      if (buyNowItemsArr.length > 0) {
        dispatch(setBuyNowItems(buyNowItemsArr));
        dispatch(setCheckoutItems(addedKeys));
        navigate("/shop/checkout");
      } else {
        toast({ title: "Failed to add items to cart", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error adding items", variant: "destructive" });
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-56px)] bg-white">
      <div className="grid min-h-[calc(100vh-56px)] grid-cols-1 lg:grid-cols-2">
        <div className="bg-white p-6 lg:p-12 border-r border-slate-50 flex items-start justify-center">
          <div className="sticky top-28 w-full max-w-xl">
            <img
              src={lookbookDetails.imageUrl}
              alt="Lookbook visual"
              className="w-full h-auto object-cover rounded-2xl shadow-2xl ring-1 ring-slate-100"
            />
            <div className="mt-8 text-center hidden lg:block">
               <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter leading-none mb-4">
                  {lookbookDetails.title}
               </h1>
               <div className="flex items-center justify-center gap-4">
                  <div className="h-px w-8 bg-slate-200"></div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Lookbook</p>
                  <div className="h-px w-8 bg-slate-200"></div>
               </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 lg:p-12">
          <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
             <div>
               <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter mb-1">Shop The Look</h2>
               <div className="h-1 w-12 bg-sky-500 rounded-full"></div>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">Discover the items featured in this collection</p>
             </div>
             {products.length > 0 && (
               <Button 
                 onClick={handleBuyAll}
                 disabled={isAdding}
                 className="bg-slate-900 text-white rounded-full px-8 py-6 hover:bg-sky-600 transition-all shadow-xl hover:shadow-sky-500/30 flex items-center gap-3 group"
               >
                 <ShoppingBag className="w-5 h-5 group-hover:animate-bounce" />
                 <span className="font-bold tracking-widest uppercase text-xs">
                   {isAdding ? "Adding..." : "Buy All (5% OFF)"}
                 </span>
               </Button>
             )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8">
            {products.map((product) => (
              <div
                key={product._id}
                onClick={() => navigate(`/shop/product/${product._id}`)}
                className="group cursor-pointer"
              >
                <div className="aspect-[3/4] overflow-hidden rounded-xl shadow-md transition-all group-hover:shadow-xl group-hover:-translate-y-1">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="mt-4">
                   <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-wider group-hover:text-sky-600 transition-colors">
                    {product.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <p className={`text-xs font-bold text-slate-900`}>
                      ${product.salePrice > 0 ? product.salePrice : product.price}
                    </p>
                    {product.salePrice > 0 && (
                      <p className="text-[10px] text-slate-400 line-through">
                        ${product.price}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {products.length === 0 && (
            <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-3xl">
              <p className="text-[10px] uppercase font-bold tracking-[0.3em] text-slate-300">
                No active products found
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ShoppingLookbookDetail;
