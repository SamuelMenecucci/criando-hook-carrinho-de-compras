import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { toast } from "react-toastify";
import { api } from "../services/api";
import { Product, Stock } from "../types";
import { useProducts } from "./useProducts";

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const { products } = useProducts();

  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem("@Rocketshoes: cart");

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      const updatedCart = [...cart];

      let productExists = updatedCart.find((element) => {
        return element.id === productId;
      });

      const stockAmount = await api
        .get(`/stock/${productId}`)
        .then((response) => response.data.amount);

      const currentAmount = productExists ? productExists.amount : 0;

      const amount = currentAmount + 1;

      if (amount > stockAmount) {
        toast.error("Quantidade solicitada fora de estoque");
        return;
      }

      if (productExists) {
        productExists.amount = amount;
      } else {
        const product = await api.get(`/products/${productId}`);

        const newProduct = {
          ...product.data,
          amount: 1,
        };

        updatedCart.push(newProduct);
      }

      setCart(updatedCart);
      localStorage.setItem("@RocketShoes: cart", JSON.stringify(updatedCart));

      // if (amount > stock) {
      //   toast.error("Quantidade solicitada fora de estoque");
      //   return;
      // }

      // if (newProduct) {
      //   newProduct.amount = amount;
      // }

      // !newProduct ? setCart([, newProduct]) : console.log(updatedCart);

      // cart.forEach((element) =>
      //     element.id === newProduct.id
      //       ? (newProduct = { ...cart, amount: 0 })
      //       : element
      //   );
    } catch {
      toast.error("Erro na adição do produto");
    }
  };

  const removeProduct = (productId: number) => {
    try {
      setCart(cart.filter((element) => element.id !== productId));
    } catch {
      // TODO exibir error com as orientações do desafio
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
    } catch {
      // TODO
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
