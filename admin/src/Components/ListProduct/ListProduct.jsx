import React, { useEffect, useState } from 'react'
import './ListProduct.css'
import cross_icon from '../../assets/cross_icon.png'

const ListProduct = () => {
  const [allproducts, setAllProducts] = useState([]);

  const fetchInfo = async () => {
    try {
      await fetch(`http://192.168.29.21:4000/allproducts`)
        .then((res) => res.json())
        .then((data) => { setAllProducts(data); })
    } catch (error) {
      console.error("Error fetching products:", error);
      alert("❌ Error loading products!");
    }
  }

  useEffect(() => { fetchInfo(); }, [])

  const remove_product = async (id) => {
    if (!window.confirm('🗑️ Are you sure you want to delete this product?')) return;
    try {
      await fetch(`http://192.168.29.21:4000/removeproduct`, {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: id })
      }).then((res) => res.json()).then((data) => {
        if (data.success) { alert("✅ Product Removed Successfully!"); }
        else { alert("❌ Failed to remove product!"); }
      });
      await fetchInfo();
    } catch (error) {
      alert("❌ Error: " + error.message);
    }
  }

  return (
    <div className='list-product'>
      <h1>All Products List</h1>
      <div className="listproduct-format-main">
        <p>Products</p><p>Title</p><p>Old Price</p><p>New Price</p><p>Category</p><p>Remove</p>
      </div>
      <div className="listproduct-allproducts">
        <hr />
        {allproducts.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>
            <p>No products found. Add some products first!</p>
          </div>
        ) : (
          allproducts.map((product, index) => (
            <React.Fragment key={index}>
              <div className="listproduct-format-main listproduct-format">
                <img src={product.image} alt={product.name} className="listproduct-product-icon"
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/80x100?text=No+Image'; }} />
                <p>{product.name}</p>
                <p>${product.old_price}</p>
                <p>${product.new_price}</p>
                <p>{product.category}</p>
                <img onClick={() => { remove_product(product.id) }} className='listproduct-remove-icon' src={cross_icon} alt="Remove" title="Delete Product" />
              </div>
              <hr />
            </React.Fragment>
          ))
        )}
      </div>
    </div>
  )
}

export default ListProduct