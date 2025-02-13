import { Metadata } from "next";
import { getOrderById } from "@/lib/actions/order-actios";
import { notFound } from "next/navigation";
import OrderDetailsTable from "./order-details-table";
import { shippingAddress } from "@/types";

export const metadata: Metadata = {
  title: "Order Details",
};

const OrderDetailsPage = async (props: {
  params: Promise<{
    id: string;
  }>;
}) => {
  const { id } = await props.params;

  const order = await getOrderById(id);
  if (!order) notFound();

  return (
    <>
      <OrderDetailsTable
        order={{
          ...order,
          shippingAddress: order.shippingAddress as shippingAddress,
        }}
      />
    </>
  );
};

export default OrderDetailsPage;
