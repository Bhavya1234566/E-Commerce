import React, { useRef } from 'react'
import Hero from '../Components/Hero/Hero';
import Popular from '../Components/Popular/Popular';
import Offers from '../Components/Offers/Offers';
import NewCollections from '../Components/NewCollections/NewCollections';
import NewsLetter from '../Components/NewsLetter/NewsLetter';

const Shop = () => {
  const newCollectionRef = useRef(null);

  return (
    <div>
      <Hero newCollectionRef={newCollectionRef} />
      <Popular />
      <Offers />
      <NewCollections ref={newCollectionRef} />
      <NewsLetter/>
    </div>
  )
}

export default Shop