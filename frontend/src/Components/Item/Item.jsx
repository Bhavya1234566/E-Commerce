import React from 'react'
import './Item.css'
import { Link } from 'react-router-dom'

const Item = (props) => {
  
  const handleImageError = (e) => {
    console.error('Image failed to load:', props.image);
    e.target.src = 'https://via.placeholder.com/300x400?text=Image+Not+Found';
  };

  return (
    <div className='item'>
      <Link to={`/product/${props.id}`}>
        <img 
          onClick={() => window.scrollTo(0, 0)} 
          src={props.image} 
          alt={props.name}
          onError={handleImageError}
        />
      </Link>
      <p>{props.name}</p>
      <div className="item-prices">
        <div className="item-price-new">
          ${props.new_price}
        </div>
        <div className="item-price-old">
          ${props.old_price}
        </div>
      </div>
    </div>
  )
}

export default Item