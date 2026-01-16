import { useMutation, useQuery } from "@tanstack/react-query";

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  book: {
    id: string;
    title: string;
    author: string;
    image: string;
  };
}

interface Order {
  id: string;
  totalAmount: number;
  status: string;
  paymentMethod: string;
  paymentTransactionId: string;
  createdAt: string;
  items: OrderItem[];
}

export const useOrders = () => {
  return useQuery({
    queryKey: ["orders"],
    queryFn: async (): Promise<Order[]> => {
      const response = await fetch("/api/orders");
      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }
      const data = await response.json();
      return data.orders;
    },
  });
};

export const useCreateOrder = () => {
  return useMutation({
    mutationFn: async (orderData: {
      paymentMethod: string;
      paymentTransactionId: string;
      paymentMobile: string;
      shippingAddress: string;
      customerPhone: string;
    }) => {
      const response = await fetch("/api/books/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create order");
      }

      return response.json();
    },
  });
};
