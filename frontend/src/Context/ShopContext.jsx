import React, { createContext, useEffect, useState } from "react";
import BACKEND_URL from '../config'

export const ShopContext = createContext(null);

const getDefaultCart = () => {
    let cart = {};
    for (let index = 0; index < 301; index++) { cart[index] = 0; }
    return cart;
}

const ShopContextProvider = (props) => {
    const [all_product, setAll_product] = useState([]);
    const [cartItems, setcartItems] = useState(getDefaultCart());
    const authToken = localStorage.getItem('auth-token');

    useEffect(() => {
        fetch(`${BACKEND_URL}/allproducts`)
            .then(res => res.json())
            .then(data => setAll_product(data));
    }, []);

    useEffect(() => {
        if (authToken) {
            fetch(`${BACKEND_URL}/getcart`, {
                method: 'POST',
                headers: { 'auth-token': authToken, 'Content-Type': 'application/json' },
            }).then(res => res.json()).then(data => setcartItems(data));
        } else {
            setcartItems(getDefaultCart());
        }
    }, [authToken]);

    const addToCart = (itemId) => {
        setcartItems((prev) => ({ ...prev, [itemId]: prev[itemId] + 1 }))
        if (localStorage.getItem('auth-token')) {
            fetch(`${BACKEND_URL}/addtocart`, {
                method: 'POST',
                headers: { Accept: 'application/form-data', 'auth-token': localStorage.getItem('auth-token'), 'Content-Type': 'application/json' },
                body: JSON.stringify({ "itemId": itemId })
            }).then((response) => response.json()).then((data) => console.log(data))
        }
    }

    const removeFromCart = (itemId) => {
        setcartItems((prev) => ({ ...prev, [itemId]: prev[itemId] - 1 }))
        if (localStorage.getItem('auth-token')) {
            fetch(`${BACKEND_URL}/removefromcart`, {
                method: 'POST',
                headers: { Accept: 'application/form-data', 'auth-token': localStorage.getItem('auth-token'), 'Content-Type': 'application/json' },
                body: JSON.stringify({ "itemId": itemId })
            }).then((response) => response.json()).then((data) => console.log(data))
        }
    }

    const clearCart = () => {
        setcartItems(getDefaultCart());
    }

    const getTotalCartAmount = () => {
        let totalAmount = 0;
        for (const item in cartItems) {
            if (cartItems[item] > 0) {
                let itemInfo = all_product.find((product) => product.id === Number(item));
                if (itemInfo) totalAmount += itemInfo.new_price * cartItems[item];
            }
        }
        return totalAmount;
    }

    const getTotalCartItems = () => {
        let totalItem = 0;
        for (const item in cartItems) { if (cartItems[item] > 0) totalItem += cartItems[item]; }
        return totalItem;
    }

    const contextValue = { getTotalCartItems, getTotalCartAmount, all_product, cartItems, addToCart, removeFromCart, clearCart };

    return <ShopContext.Provider value={contextValue}>{props.children}</ShopContext.Provider>
}

export default ShopContextProvider;