import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // TODO LOAD ITEMS FROM ASYNC STORAGE
      const items = await AsyncStorage.getItem('@GoMarket:products');

      if (items) {
        setProducts([...JSON.parse(items)]);
      }
    }

    loadProducts();
  }, []);

  const increment = useCallback(
    async id => {
      // TODO INCREMENTS A PRODUCT QUANTITY IN THE CART
      const productIndex = products.findIndex(product => product.id === id);
      const newArray = [...products];
      newArray[productIndex] = {
        ...newArray[productIndex],
        quantity: newArray[productIndex].quantity + 1,
      };
      setProducts(newArray);
      await AsyncStorage.setItem(
        '@GoMarket:products',
        JSON.stringify(newArray),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      // TODO DECREMENTS A PRODUCT QUANTITY IN THE CART
      const product = products.find(prod => prod.id === id);
      const productIndex = products.findIndex(prod => prod.id === id);

      let newArray = [];
      if (product?.quantity === 1) {
        newArray = products.filter(prod => prod.id !== product.id);
      } else {
        newArray = [...products];
        newArray[productIndex] = {
          ...newArray[productIndex],
          quantity: newArray[productIndex].quantity - 1,
        };
      }
      setProducts(newArray);
      await AsyncStorage.setItem(
        '@GoMarket:products',
        JSON.stringify(newArray),
      );
    },
    [products],
  );

  const addToCart = useCallback(
    async (product: Product) => {
      // TODO ADD A NEW ITEM TO THE CART
      const findedProduct = products.find(
        oldProduct => oldProduct.id === product.id,
      );
      if (findedProduct) {
        await increment(product.id);
      } else {
        const newArray = [...products, { ...product, quantity: 1 }];
        setProducts(newArray);
        await AsyncStorage.setItem(
          '@GoMarket:products',
          JSON.stringify(newArray),
        );
      }
    },
    [products, increment],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
