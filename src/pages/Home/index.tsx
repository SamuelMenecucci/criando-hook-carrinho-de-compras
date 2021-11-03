import React, { useState, useEffect } from "react";
import { MdAddShoppingCart } from "react-icons/md";

import { ProductList } from "./styles";
import { api } from "../../services/api";
import { formatPrice } from "../../util/format";
import { useCart } from "../../hooks/useCart";

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
  const [products, setProducts] = useState<ProductFormatted[]>([]);
  const { addProduct, cart } = useCart();

  // const cartItemsAmount = cart.reduce((sumAmount, product) => {
  //   // TODO
  // }, {} as CartItemsAmount)

  useEffect(() => {
    async function loadProducts() {
      //fazendo o get na rota de produtos e setando no estado todos os produtos
      api
        .get("http://localhost:3333/products")
        .then((response) => setProducts(response.data));
    }

    loadProducts();
  }, []);

  function handleAddProduct(id: number) {
    addProduct(id);
  }

  return (
    <ProductList>
      {/* exibindo de forma dinâmica os produtos existentes utilizando o estado com as informações  */}
      {products.map((element) => {
        return (
          <li key={element.id}>
            <img src={element.image} alt={element.title} />
            <strong>{element.title}</strong>
            <span>
              {/* formatando o valor para real */}
              {/* TODO utilizar o código da pasta util para a formatação de valores  */}
              {new Intl.NumberFormat("pt-br", {
                style: "currency",
                currency: "BRL",
              }).format(element.price)}
            </span>
            <button
              type="button"
              data-testid="add-product-button"
              onClick={() => handleAddProduct(element.id)}
            >
              <div data-testid="cart-product-quantity">
                <MdAddShoppingCart size={16} color="#FFF" />
                {/* {cartItemsAmount[product.id] || 0} */} 2
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
