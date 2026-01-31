import React, { useEffect, useState } from 'react'
import './ListProduct.css'

const ListProduct = () => {
  const [allproducts, setAllProducts] = useState([]);
  
  const fetchInfo = async () => {
    try {
      await fetch('https://e-commerce-0112.onrender.com/allproducts')
        .then((res) => res.json())
        .then((data) => { setAllProducts(data) })
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  }

  useEffect(() => {
    fetchInfo();
  }, [])

  const remove_product = async (id) => {
    try {
      await fetch('https://e-commerce-0112.onrender.com/removeproduct', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: id })
      })
      await fetchInfo();
    } catch (error) {
      console.error("Error removing product:", error);
    }
  }

  return (
    <div className='list-product'>
      <h1>All Products List</h1>
      <div className="listproduct-format-main">
        <p>Products</p>
        <p>Title</p>
        <p>Old Price</p>
        <p>New Price</p>
        <p>Category</p>
        <p>Remove</p>
      </div>
      <div className="listproduct-allproducts">
        <hr />
        {allproducts.map((product, index) => {
          return (
            <React.Fragment key={index}>
              <div className="listproduct-format-main listproduct-format">
                <img src={product.image} alt="" className="listproduct-product-icon" />
                <p>{product.name}</p>
                <p>${product.old_price}</p>
                <p>${product.new_price}</p>
                <p>{product.category}</p>
                <span 
                  onClick={() => { remove_product(product.id) }} 
                  className='listproduct-remove-icon'
                  style={{ fontSize: '24px', cursor: 'pointer', color: 'red' }}
                >
                  ❌
                </span>
              </div>
              <hr />
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}

export default ListProduct