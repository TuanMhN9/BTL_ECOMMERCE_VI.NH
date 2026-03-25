import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import accImg from "@/assets/photo_for_homepage.avif";
import Address from "@/components/shopping-view/address";
import ShoppingOrders from "@/components/shopping-view/orders";
import ShoppingUserProfile from "@/components/shopping-view/user-profile";

function ShoppingAccount() {
  return (
    <div className="flex flex-col bg-white">
      <div className="relative h-[280px] w-full overflow-hidden">
        <img
          src={accImg}
          className="h-full w-full object-cover object-center"
          alt="Account banner"
        />
        <div className="absolute inset-0 bg-black/35" />
        <div className="absolute inset-0 flex items-end px-6 pb-8 md:px-10">
          <div className="text-white">
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/80">
              Saint Laurent
            </p>
            <h1 className="mt-2 text-xs font-semibold uppercase tracking-[0.35em]">
              My Account
            </h1>
          </div>
        </div>
      </div>
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-8 px-6 py-10 md:px-10">
        <div className="flex flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-[0_16px_45px_rgba(0,0,0,0.06)] md:p-8">
          <Tabs defaultValue="orders">
            <TabsList className="h-auto w-full flex-wrap justify-start gap-1 rounded-none border-b border-gray-200 bg-transparent p-0">
              <TabsTrigger
                value="orders"
                className="rounded-none border-b-2 border-transparent px-3 py-2 text-[10px] uppercase tracking-[0.22em] text-gray-500 data-[state=active]:border-black data-[state=active]:bg-transparent data-[state=active]:text-black data-[state=active]:shadow-none"
              >
                Orders
              </TabsTrigger>
              <TabsTrigger
                value="address"
                className="rounded-none border-b-2 border-transparent px-3 py-2 text-[10px] uppercase tracking-[0.22em] text-gray-500 data-[state=active]:border-black data-[state=active]:bg-transparent data-[state=active]:text-black data-[state=active]:shadow-none"
              >
                Address
              </TabsTrigger>
              <TabsTrigger
                value="user"
                className="rounded-none border-b-2 border-transparent px-3 py-2 text-[10px] uppercase tracking-[0.22em] text-gray-500 data-[state=active]:border-black data-[state=active]:bg-transparent data-[state=active]:text-black data-[state=active]:shadow-none"
              >
                User
              </TabsTrigger>
            </TabsList>
            <TabsContent value="orders" className="mt-6">
              <ShoppingOrders />
            </TabsContent>
            <TabsContent value="address" className="mt-6">
              <Address />
            </TabsContent>
            <TabsContent value="user" className="mt-6">
              <ShoppingUserProfile />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

export default ShoppingAccount;
