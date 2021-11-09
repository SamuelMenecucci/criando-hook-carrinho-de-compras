import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { toast } from "react-toastify";
import { isConstructorDeclaration } from "typescript";
import { api } from "../services/api";
import { Product, Stock } from "../types";

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
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem("@Rocketshoes:cart");

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
      localStorage.setItem("@RocketShoes:cart", JSON.stringify(updatedCart));

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
      const productIndex = cart.findIndex(
        (product) => product.id === productId
      );

      const updatedCart = [...cart];

      if (productIndex >= 0) {
        updatedCart.splice(productIndex, 1);
        setCart(updatedCart);
        localStorage.setItem("@RocketShoes:cart", JSON.stringify(updatedCart));
        console.log(cart);
      } else {
        throw Error();
      }
      // setCart(cart.filter((element) => element.id !== productId));
      // localStorage.setItem("@RocketShoes:cart", JSON.stringify(cart));
    } catch {
      toast.error("Erro na remoção do produto");
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      if (amount <= 0) {
        return;
      }

      const stockAmount = await api
        .get(`/stock/${productId}`)
        .then((response) => response.data.amount);
      if (amount > stockAmount) {
        toast.error("Quantidade solicitada fora de estoque");
        return;
      }

      const updatedCart = [...cart];

      const productExists = updatedCart.find(
        (element) => element.id === productId
      );

      if (productExists) {
        productExists.amount = amount;
        setCart(updatedCart);
        localStorage.setItem("@RocketShoes:cart", JSON.stringify(updatedCart));
      } else {
        throw Error;
      }
    } catch {
      toast.error("Erro na alteração de quantidade do produto");
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
