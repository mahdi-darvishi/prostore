import ProductList from "@/components/shared/product/product-list";

import { getLAtestProducts } from "@/lib/actions/product.actions";
const HomePage = async () => {
  const latestProducts = await getLAtestProducts();
  return (
    <>
      <ProductList data={latestProducts} title="Newset Arrivals" limit={4} />
    </>
  );
};

export default HomePage;
