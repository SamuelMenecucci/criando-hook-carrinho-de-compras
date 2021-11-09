import { createContext, ReactNode, useContext, useState } from "react";
import { toast } from "react-toastify";
import { api } from "../services/api";
import { Product } from "../types";

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
    //verificar se já existe algum item no localStorage
    const storagedCart = localStorage.getItem("@Rocketshoes:cart");

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }
    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      //para manter o conceito de imutabilidade do react, coloco os valores do cart em outra variável, assim consigo utilizar algumas funções do javascript de maneira mais simples e fácil.
      const updatedCart = [...cart];

      //buscando e alocando o elemento, o find me retorna o elemento que passar ou false caso não encontrar nenhum que satisfaça a condição
      let productExists = updatedCart.find((element) => {
        return element.id === productId;
      });

      //fazendo get na roda de estoque. o json server já me trás a possibilidade de params, conseguindo puxar um único item ao invés de todos. verifico a quantidade em estoque do item selecionado
      const stockAmount = await api
        .get(`/stock/${productId}`)
        .then((response) => response.data.amount);

      //como é a primeira vez que estou colocando, adiciono a propriedade amount dentro do produto, e inicializo ela com 0
      const currentAmount = productExists ? productExists.amount : 0;

      //crio uma variável que irá trabalhar com a quantidade do produto, e está recebendo somente o valor da propriedade que acabei de criar + 1
      const amount = currentAmount + 1;

      //se o valor do amount foi maior que a quantidade em estoque que puxei da api, disparo um erro com o toastfy e encerro a função
      if (amount > stockAmount) {
        toast.error("Quantidade solicitada fora de estoque");
        return;
      }

      //verifico se o retorno do find é o produto e não false, se for true, atribuo o amount com o valor para o a propriedade amount do produto
      if (productExists) {
        productExists.amount = amount;
      }
      //caso o produto ainda não exista
      else {
        const product = await api.get(`/products/${productId}`);

        const newProduct = {
          ...product.data,
          amount: 1,
        };

        updatedCart.push(newProduct);
      }

      setCart(updatedCart);
      localStorage.setItem("@RocketShoes:cart", JSON.stringify(updatedCart));
    } catch {
      toast.error("Erro na adição do produto");
    }
  };

  const removeProduct = (productId: number) => {
    try {
      //acho o index do produto que irá ser removido, com o id que foi passado como parametro
      const productIndex = cart.findIndex(
        (product) => product.id === productId
      );

      //puxo os itens que estão no meu carrinho para outra variável para manter o conceito de imutabilidade do react
      const updatedCart = [...cart];

      //o findeIndex retorna o valor do index caso ache, sendo o menor valor possivel como 0, se não encontrar irá retornar -1. caso o item seja maior que -1, significa que o item existe e foi encontrado.
      if (productIndex >= 0) {
        //utilizando o splice para excluir o item. ele me retorna uma array novo sem o item que especifiquei.
        //coloco a posição que eu quero excluir (no caso temos a posição que é do elemento encontrado) e a quantidade de itens que quero excluir, no caso 1. se eu quisesse apenas adicionar um tem em uma determinada posição sem fazer a exclusão, basta passar 0 como segundo parametro e como terceiro o conteudo que será adicionado
        // DOC https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Global_Objects/Array/splice
        updatedCart.splice(productIndex, 1);
        setCart(updatedCart);
        localStorage.setItem("@RocketShoes:cart", JSON.stringify(updatedCart));
        console.log(cart);
      }
      //caso o retorno seja -1
      else {
        throw Error();
      }
    } catch {
      toast.error("Erro na remoção do produto");
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      //se o valor passado por parametro for menor que 0, não posso mudar o valor, então finalizo a função
      if (amount <= 0) {
        return;
      }

      //puxando a quantidade de estoque do produto, utilizando o id passado como parametro
      const stockAmount = await api
        .get(`/stock/${productId}`)
        .then((response) => response.data.amount);

      //verificando se o valor solicitado é menor ou igual ao que tem no estoque. se for maior, disparo um erro
      if (amount > stockAmount) {
        toast.error("Quantidade solicitada fora de estoque");
        return;
      }

      //puxo os itens que estão no meu carrinho para outra variável para manter o conceito de imutabilidade do react
      const updatedCart = [...cart];

      //puxando o elemento pelo id, utilizando o find
      const productExists = updatedCart.find(
        (element) => element.id === productId
      );

      //caso o retorno do find seja true
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
