import React, { useContext, useState, useEffect } from 'react'
import './CartItems.css'
import { ShopContext } from '../../Context/ShopContext'
import remove_icon from '../Assets/cart_cross_icon.png'
import { useNavigate } from 'react-router-dom'

const PROMO_CODES = {
  'SAVE10': { type: 'percent', value: 10, label: '10% off' },
  'SAVE20': { type: 'percent', value: 20, label: '20% off' },
  'FLAT50': { type: 'flat', value: 50, label: '$50 off' },
};

const CartItems = () => {
  const { getTotalCartAmount, all_product, cartItems, removeFromCart, clearCart, addToCart } = useContext(ShopContext);
  const [showPopup, setShowPopup] = useState(false);
  const [autoDiscount, setAutoDiscount] = useState(null);
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoMsg, setPromoMsg] = useState('');
  const navigate = useNavigate();

  const subtotal = getTotalCartAmount();

  // Auto discount based on cart total
  useEffect(() => {
    if (subtotal >= 500) {
      setAutoDiscount({ label: '50% off (Cart above $500)', type: 'percent', value: 50 });
    } else if (subtotal >= 100) {
      setAutoDiscount({ label: '20% off (Cart above $100)', type: 'percent', value: 20 });
    } else if (subtotal >= 50) {
      setAutoDiscount({ label: '10% off (Cart above $50)', type: 'percent', value: 10 });
    } else {
      setAutoDiscount(null);
    }
  }, [subtotal]);

  // Calculate auto discount amount
  const getAutoDiscountAmount = () => {
    if (!autoDiscount) return 0;
    return (subtotal * autoDiscount.value) / 100;
  };

  // Calculate promo discount amount
  const getPromoDiscountAmount = () => {
    if (!appliedPromo) return 0;
    if (appliedPromo.type === 'percent') return (subtotal * appliedPromo.value) / 100;
    if (appliedPromo.type === 'flat') return Math.min(subtotal, appliedPromo.value);
    return 0;
  };

  // Final total — both discounts apply
  const getDiscountedTotal = () => {
    return Math.max(0, subtotal - getAutoDiscountAmount() - getPromoDiscountAmount());
  };

  const handlePromoSubmit = () => {
    const code = promoInput.trim().toUpperCase();
    if (PROMO_CODES[code]) {
      setAppliedPromo(PROMO_CODES[code]);
      setPromoMsg({ type: 'success', text: `✓ "${code}" applied — ${PROMO_CODES[code].label}!` });
    } else {
      setAppliedPromo(null);
      setPromoMsg({ type: 'error', text: '✕ Invalid promo code. Try SAVE10, SAVE20 or FLAT50.' });
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoInput('');
    setPromoMsg('');
  };

  const handleCheckout = () => {
    const totalItems = Object.values(cartItems).reduce((sum, val) => sum + val, 0);
    if (totalItems === 0) {
      setShowPopup('empty');
    } else {
      setShowPopup('success');
      clearCart();
      setAppliedPromo(null);
      setPromoInput('');
      setPromoMsg('');
    }
  };

  const handleContinue = () => setShowPopup(false);

  const handleGoHome = () => {
    setShowPopup(false);
    navigate('/');
  };

  return (
    <div className='cartitems'>

      {/* EMPTY CART POPUP */}
      {showPopup === 'empty' && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.5)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 9999
        }}>
          <div style={{
            background: 'white', borderRadius: '16px', padding: '40px',
            textAlign: 'center', maxWidth: '380px', width: '90%'
          }}>
            <div style={{
              width: '70px', height: '70px', background: '#ff4141',
              borderRadius: '50%', display: 'flex', alignItems: 'center',
              justifyContent: 'center', margin: '0 auto 20px', fontSize: '36px', color: 'white'
            }}>🛒</div>
            <h2 style={{ color: '#ff4141', marginBottom: '8px' }}>Cart is Empty!</h2>
            <p style={{ color: '#ff6b6b', marginBottom: '24px' }}>
              Your cart is empty. Please add some items before checkout!
            </p>
            <button onClick={handleGoHome} style={{
              background: '#ff4141', color: 'white', border: 'none',
              padding: '12px 30px', borderRadius: '8px', fontSize: '15px',
              cursor: 'pointer', fontWeight: '600'
            }}>Go to Home</button>
          </div>
        </div>
      )}

      {/* SUCCESS POPUP */}
      {showPopup === 'success' && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.5)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 9999
        }}>
          <div style={{
            background: 'white', borderRadius: '16px', padding: '40px',
            textAlign: 'center', maxWidth: '380px', width: '90%'
          }}>
            <div style={{
              width: '70px', height: '70px', background: '#ff4141',
              borderRadius: '50%', display: 'flex', alignItems: 'center',
              justifyContent: 'center', margin: '0 auto 20px', fontSize: '36px', color: 'white'
            }}>✓</div>
            <h2 style={{ color: '#ff4141', marginBottom: '8px' }}>Order Placed Successfully!</h2>
            <p style={{ color: '#ff6b6b', marginBottom: '24px' }}>
              Thank you for shopping with SHOPPER 🛍️
            </p>
            <button onClick={handleContinue} style={{
              background: '#ff4141', color: 'white', border: 'none',
              padding: '12px 30px', borderRadius: '8px', fontSize: '15px',
              cursor: 'pointer', fontWeight: '600'
            }}>Continue Shopping</button>
          </div>
        </div>
      )}

      <div className="cartitems-format-main">
        <p>Products</p>
        <p>Title</p>
        <p>Price</p>
        <p>Quantity</p>
        <p>Total</p>
        <p>Remove</p>
      </div>
      <hr />

      {all_product.map((e) => {
        if (cartItems[e.id] > 0) {
          return <div key={e.id}>
            <div className="cartitems-format cartitems-format-main">
              <img src={e.image} alt="" className='carticicon-product-icon' />
              <p>{e.name}</p>
              <p>${e.new_price}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button onClick={() => removeFromCart(e.id)} style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  border: '1px solid #ff4141', background: 'white',
                  color: '#ff4141', fontSize: '18px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: '600'
                }}>−</button>
                <span style={{ minWidth: '30px', textAlign: 'center', fontWeight: '600', fontSize: '15px' }}>
                  {cartItems[e.id]}
                </span>
                <button onClick={() => addToCart(e.id)} style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  border: '1px solid #ff4141', background: '#ff4141',
                  color: 'white', fontSize: '18px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: '600'
                }}>+</button>
              </div>
              <p>${e.new_price * cartItems[e.id]}</p>
              <img className='cartitems-remove-icon' src={remove_icon} onClick={() => removeFromCart(e.id)} alt="" />
            </div>
            <hr />
          </div>
        }
        return null;
      })}

      <div className="cartitems-down">
        <div className="cartitems-total">
          <h1>Cart Totals</h1>
          <div>
            <div className="cartitems-total-item">
              <p>Subtotal</p>
              <p>${subtotal.toFixed(2)}</p>
            </div>
            <hr />

            {/* AUTO DISCOUNT ROW */}
            {autoDiscount && (
              <>
                <div className="cartitems-total-item">
                  <p style={{ color: '#ff4141' }}>Auto Discount ({autoDiscount.label})</p>
                  <p style={{ color: '#ff4141' }}>− ${getAutoDiscountAmount().toFixed(2)}</p>
                </div>
                <hr />
              </>
            )}

            {/* PROMO DISCOUNT ROW */}
            {appliedPromo && (
              <>
                <div className="cartitems-total-item">
                  <p style={{ color: '#ff4141' }}>Promo Discount ({appliedPromo.label})</p>
                  <p style={{ color: '#ff4141' }}>− ${getPromoDiscountAmount().toFixed(2)}</p>
                </div>
                <hr />
              </>
            )}

            <div className="cartitems-total-item">
              <p>Shipping Fee</p>
              <p>Free</p>
            </div>
            <hr />
            <div className="cartitems-total-item">
              <h3>Total</h3>
              <h3>${getDiscountedTotal().toFixed(2)}</h3>
            </div>
          </div>

          {/* DISCOUNT RULES */}
          <div style={{ margin: '16px 0', padding: '14px', background: '#f9f9f9', borderRadius: '8px', border: '1px solid #eee' }}>
            <p style={{ fontWeight: '600', marginBottom: '8px', color: 'black', fontSize: '14px' }}>
              Automatic Discount Offers:
            </p>
            <p style={{ fontSize: '13px', color: 'black', marginBottom: '4px', fontWeight: subtotal >= 50 && subtotal < 100 ? '700' : '400' }}>
              • Cart above $50 → 10% off {subtotal >= 50 && subtotal < 100 ? '✓ Applied!' : ''}
            </p>
            <p style={{ fontSize: '13px', color: 'black', marginBottom: '4px', fontWeight: subtotal >= 100 && subtotal < 500 ? '700' : '400' }}>
              • Cart above $100 → 20% off {subtotal >= 100 && subtotal < 500 ? '✓ Applied!' : ''}
            </p>
            <p style={{ fontSize: '13px', color: 'black', fontWeight: subtotal >= 500 ? '700' : '400' }}>
              • Cart above $500 → 50% off {subtotal >= 500 ? '✓ Applied!' : ''}
            </p>
          </div>

          <button onClick={handleCheckout}>PROCEED TO CHECKOUT</button>
        </div>

        {/* PROMO CODE SECTION */}
        <div className="cartitems-promocode">
          <p>If you have a promo code, Enter it here</p>
          <div className="cartitems-promobox">
            <input
              type="text"
              placeholder='e.g. SAVE10, SAVE20, FLAT50'
              value={promoInput}
              onChange={(e) => setPromoInput(e.target.value)}
              disabled={!!appliedPromo}
              style={{ opacity: appliedPromo ? 0.6 : 1 }}
            />
            {!appliedPromo
              ? <button onClick={handlePromoSubmit}>Submit</button>
              : <button onClick={handleRemovePromo} style={{ background: '#555' }}>Remove</button>
            }
          </div>

          {/* SUCCESS / ERROR MESSAGE */}
          {promoMsg && (
            <p style={{
              marginTop: '10px', fontSize: '14px', fontWeight: '500',
              color: promoMsg.type === 'success' ? '#16a34a' : '#ff4141'
            }}>
              {promoMsg.text}
            </p>
          )}

          {/* HINT */}
          {!appliedPromo && (
            <p style={{ marginTop: '8px', fontSize: '12px', color: '#aaa' }}>
              Available codes: SAVE10 · SAVE20 · FLAT50
            </p>
          )}
        </div>

      </div>
    </div>
  )
}

export default CartItems