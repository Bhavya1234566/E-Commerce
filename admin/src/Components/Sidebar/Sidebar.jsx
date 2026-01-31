import React from 'react'
import './Sidebar.css'
import { Link } from 'react-router-dom'

const Sidebar = () => {
  return (
    <div className='sidebar'>
      <Link to={'/addproduct'} style={{textDecoration:"none"}}>
        <div className='sidebar-item'>
          <span style={{fontSize: '24px', marginRight: '10px'}}>➕</span>
          <p>Add Product</p>
        </div>
      </Link>
      <Link to={'/listproduct'} style={{textDecoration:"none"}}>
        <div className='sidebar-item'>
          <span style={{fontSize: '24px', marginRight: '10px'}}>📋</span>
          <p>Product List</p>
        </div>
      </Link>
    </div>
  )
}

export default Sidebar