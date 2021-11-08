import { useState, useEffect } from "react";
import { MdAddShoppingCart } from "react-icons/md";

import { ProductList } from "./styles";
import { formatPrice } from "../../util/format";
import { useCart } from "../../hooks/useCart";
import { api } from "../../services/api";
import { useProducts } from "../../hooks/useProducts";
import { sign } from "crypto";

interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
}

interface ProductFormatted extends Product {
  priceFormatted: string;
}

interface CartItemsAmount {
  [key: number]: number;
}

const Home = (): JSX.Element => {
  const { products } = useProducts();

  const { addProduct, cart } = useCart();

  const cartItemsAmount = cart.reduce(
    (sumAmount, product) => {
      sumAmount[product.id] = product.amount;

      return sumAmount;
    },
    {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      6: 0,
    } as CartItemsAmount
  );

  function handleAddProduct(id: number) {
    addProduct(id);
  }

  return (
    <ProductList>
      {/* exibindo de forma dinâmica os produtos existentes utilizando o estado com as informações  */}
      {products.map((element: any) => {
        return (
          <li key={element.id}>
            <img src={element.image} alt={element.title} />
            <strong>{element.title}</strong>
            <span>
              {/* formatando o valor para real utilizando o util/format */}
              {formatPrice(element.price)}
            </span>
            <button
              type="button"
              data-testid="add-product-button"
              onClick={() => handleAddProduct(element.id)}
            >
              <div data-testid="cart-product-quantity">
                <MdAddShoppingCart size={16} color="#FFF" />
                {cartItemsAmount[element.id] || 0}
              </div>

              <span>ADICIONAR AO CARRINHO</span>
            </button>
          </li>
        );
      })}
    </ProductList>
  );
};

export default Home;
