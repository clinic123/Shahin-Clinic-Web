// hooks/useCart.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface CartItem {
  id: string;
  quantity: number;
  book: {
    id: string;
    title: string;
    author: string;
    image: string;
    price: number;
    stock: number;
    rokomariLinkForDirectBuy?: string;
    amazonLink?: string;
    isActive: boolean;
  };
}

export interface Cart {
  id: string;
  items: CartItem[];
}

interface CartResponse {
  success: boolean;
  data: Cart;
  message?: string;
}

// GET cart
export const useCart = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ["cart"],
    queryFn: async (): Promise<CartResponse> => {
      const response = await fetch("/api/cart");
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch cart");
      }
      return response.json();
    },
    retry: 1,
    staleTime: 1000 * 60 * 5,
    enabled,
  });
};

// ADD to cart
export const useAddToCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      bookId,
      quantity = 1,
    }: {
      bookId: string;
      quantity?: number;
    }) => {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bookId, quantity }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to add to cart");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
};

// UPDATE cart item
export const useUpdateCartItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      cartItemId,
      quantity,
    }: {
      cartItemId: string;
      quantity: number;
    }) => {
      const response = await fetch("/api/cart", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cartItemId, quantity }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update cart");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
};

// REMOVE from cart
export const useRemoveFromCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (cartItemId: string) => {
      const response = await fetch(`/api/cart/${cartItemId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to remove from cart");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
};
