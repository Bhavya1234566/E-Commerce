import React, { useState } from 'react'
import './AddProduct.css'

const AddProduct = () => {

  const [image, setImage] = useState(false);
  const [productDetails, setProductDetails] = useState({
    name: "",
    image: "",
    category: "women",
    new_price: "",
    old_price: ""
  })

  const imageHandler = (e) => {
    setImage(e.target.files[0]);
  }

  const changeHandler = (e) => {
    setProductDetails({ ...productDetails, [e.target.name]: e.target.value })
  }

  const Add_Product = async () => {
    if (!image) {
      alert("Please select an image first!");
      return;
    }

    if (!productDetails.name || !productDetails.old_price || !productDetails.new_price) {
      alert("Please fill all fields!");
      return;
    }

    console.log(productDetails);
    let responseData;
    let product = productDetails;

    let formData = new FormData();
    formData.append('product', image);

    try {
      const uploadResponse = await fetch('https://e-commerce-0112.onrender.com/upload', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
        },
        body: formData,
      });

      responseData = await uploadResponse.json();
      console.log("Upload response:", responseData);

      if (responseData.success) {
        product.image = responseData.image_url;
        console.log(product);
        
        const addResponse = await fetch('https://e-commerce-0112.onrender.com/addproduct', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(product),
        });
        
        const addData = await addResponse.json();
        
        if (addData.success) {
          alert("Product Added Successfully!");
          // Reset form
          setProductDetails({
            name: "",
            image: "",
            category: "women",
            new_price: "",
            old_price: ""
          });
          setImage(false);
        } else {
          alert("Failed to add product");
        }
      } else {
        alert(`Upload failed: ${responseData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error adding product:", error);
      alert(`Error: ${error.message}. The server might be sleeping or down.`);
    }
  }

  return (
    <div className='add-product'>
      <div className="addproduct-itemfield">
        <p>Product title</p>
        <input 
          value={productDetails.name} 
          onChange={changeHandler} 
          type="text" 
          name='name' 
          placeholder='Type here' 
        />
      </div>
      <div className="addproduct-price">
        <div className="addproduct-itemfield">
          <p>Price</p>
          <input 
            value={productDetails.old_price} 
            onChange={changeHandler} 
            type="text" 
            name='old_price' 
            placeholder='Type here' 
          />
        </div>
        <div className="addproduct-itemfield">
          <p>Offer Price</p>
          <input 
            value={productDetails.new_price} 
            onChange={changeHandler} 
            type="text" 
            name='new_price' 
            placeholder='Type here' 
          />
        </div>
      </div>
      <div className="addproduct-itemfield">
        <p>Product Category</p>
        <select 
          value={productDetails.category} 
          onChange={changeHandler} 
          name="category" 
          className='add-product-selector'
        >
          <option value="women">Women</option>
          <option value="men">Men</option>
          <option value="kid">Kid</option>
        </select>
      </div>
      <div className="addproduct-itemfield">
        <label htmlFor="file-input">
          {image ? (
            <img 
              src={URL.createObjectURL(image)} 
              className='addproduct-thumnail-img' 
              alt="Product preview" 
            />
          ) : (
            <div className='addproduct-upload-placeholder'>
              <span style={{ fontSize: '48px' }}>📁</span>
              <p>Click to upload image</p>
            </div>
          )}
        </label>
        <input 
          onChange={imageHandler} 
          type="file" 
          name='image' 
          id='file-input' 
          accept="image/*" 
          hidden 
        />
      </div>
      <button 
        onClick={() => { Add_Product() }} 
        className='addproduct-btn'
      >
        ADD
      </button>
    </div>
  )
}

export default AddProduct