import React, { useEffect, useState, forwardRef } from 'react'
import './NewCollections.css'
import Item from '../Item/Item'
import BACKEND_URL from '../../config'

const NewCollections = forwardRef((props, ref) => {
  const [new_collection, setNew_collection] = useState([]);

  useEffect(() => {
    fetch(`${BACKEND_URL}/newcollections`)
      .then((response) => response.json())
      .then((data) => setNew_collection(data));
  }, [])

  return (
    <div className='new-collections' ref={ref}>
      <h1>NEW COLLECTIONS</h1>
      <hr />
      <div className="collections">
        {new_collection.map((item, i) => (
          <Item key={i} id={item.id} name={item.name} image={item.image} new_price={item.new_price} old_price={item.old_price} />
        ))}
      </div>
    </div>
  )
})

export default NewCollections