import React, { useEffect, useState } from 'react'
import './ListProduct.css'

const ListProduct = () => {
  const [allproducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInfo = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://e-commerce-0112.onrender.com/allproducts');
      const data = await response.json();
      setAllProducts(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching products:", error);
      setLoading(false);
      alert("Error fetching products. Server might be down.");
    }
  }

  useEffect(() => {
    fetchInfo();
  }, [])

  const remove_product = async (id) => {
    if (!window.confirm("Are you sure you want to remove this product?")) {
      return;
    }

    try {
      const response = await fetch('https://e-commerce-0112.onrender.com/removeproduct', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: id })
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert("Product removed successfully!");
        await fetchInfo();
      } else {
        alert("Failed to remove product");
      }
    } catch (error) {
      console.error("Error removing product:", error);
      alert("Error removing product");
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
        {loading ? (
          <div className="loading-message">
            <p>Loading products...</p>
          </div>
        ) : allproducts.length === 0 ? (
          <div className="no-products-message">
            <p>No products available. Add some products first!</p>
          </div>
        ) : (
          allproducts.map((product, index) => {
            return (
              <React.Fragment key={index}>
                <div className="listproduct-format-main listproduct-format">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="listproduct-product-icon" 
                  />
                  <p>{product.name}</p>
                  <p>${product.old_price}</p>
                  <p>${product.new_price}</p>
                  <p>{product.category}</p>
                  <span 
                    onClick={() => { remove_product(product.id) }} 
                    className='listproduct-remove-icon'
                    style={{ fontSize: '24px', cursor: 'pointer', color: 'red' }}
                    title="Remove product"
                  >
                    ❌
                  </span>
                </div>
                <hr />
              </React.Fragment>
            )
          })
        )}
      </div>
    </div>
  )
}

export default ListProduct