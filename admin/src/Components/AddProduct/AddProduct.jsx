import React, { useState } from 'react'
import './AddProduct.css'
import upload_area from '../../assets/upload_area.svg'

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
    if (!productDetails.name) { alert("⚠️ Please enter product name!"); return; }
    if (!productDetails.old_price || !productDetails.new_price) { alert("⚠️ Please enter both prices!"); return; }
    if (!image) { alert("⚠️ Please select an image!"); return; }

    let responseData;
    let product = productDetails;
    let formData = new FormData();
    formData.append('product', image);

    try {
      await fetch(`http://192.168.29.21:4000/upload`, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: formData,
      }).then((resp) => resp.json()).then((data) => { responseData = data });

      if (responseData.success) {
        product.image = responseData.image_url;
        await fetch(`http://192.168.29.21:4000/addproduct`, {
          method: 'POST',
          headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify(product),
        }).then((resp) => resp.json()).then((data) => {
          if (data.success) {
            alert("✅ Product Added Successfully!");
            setProductDetails({ name: "", image: "", category: "women", new_price: "", old_price: "" });
            setImage(false);
          } else { alert("❌ Failed to add product!"); }
        })
      } else { alert("❌ Failed to upload image!"); }
    } catch (error) {
      console.error("Error:", error);
      alert("❌ Error: " + error.message);
    }
  }

  return (
    <div className='add-product'>
      <div className="addproduct-itemfield">
        <p>Product title</p>
        <input value={productDetails.name} onChange={changeHandler} type="text" name='name' placeholder='Type here' />
      </div>
      <div className="addproduct-price">
        <div className="addproduct-itemfield">
          <p>Price</p>
          <input value={productDetails.old_price} onChange={changeHandler} type="text" name='old_price' placeholder='Type here' />
        </div>
        <div className="addproduct-itemfield">
          <p>Offer Price</p>
          <input value={productDetails.new_price} onChange={changeHandler} type="text" name='new_price' placeholder='Type here' />
        </div>
      </div>
      <div className="addproduct-itemfield">
        <p>Product Category</p>
        <select value={productDetails.category} onChange={changeHandler} name="category" className='add-product-selector'>
          <option value="women">Women</option>
          <option value="men">Men</option>
          <option value="kid">Kid</option>
        </select>
      </div>
      <div className="addproduct-itemfield">
        <label htmlFor="file-input">
          <img src={image ? URL.createObjectURL(image) : upload_area} className='addproduct-thumnail-img' alt="" />
        </label>
        <input onChange={imageHandler} type="file" name='image' id='file-input' accept="image/*" hidden />
      </div>
      <button onClick={() => { Add_Product() }} className='addproduct-btn'>ADD</button>
    </div>
  )
}

export default AddProduct