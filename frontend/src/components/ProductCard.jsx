import React, { useState } from 'react';
import { ShoppingCart, Sparkles, AlertCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80';

const ProductCard = ({ product, onSelectAlternative }) => {
  const { addToCart, loading } = useCart();
  const [imgSrc, setImgSrc] = useState(product.imageUrl || DEFAULT_IMAGE);
  const [adding, setAdding] = useState(false);

  const isOutOfStock = product.stockQuantity <= 0;
  const isLowStock = product.stockQuantity > 0 && product.stockQuantity <= 10;

  const handleAdd = async () => {
    setAdding(true);
    await addToCart(product.id, 1);
    setAdding(false);
  };

  return (
    <div className="product-card">
      <div className="product-image-container">
        <img
          src={imgSrc}
          alt={product.name}
          className="product-image"
          onError={() => setImgSrc(DEFAULT_IMAGE)}
          loading="lazy"
        />
        <span className="product-category-tag">{product.category}</span>
        
        {isOutOfStock ? (
          <span className="product-stock-tag out-of-stock">Out of Stock</span>
        ) : isLowStock ? (
          <span className="product-stock-tag low-stock">{product.stockQuantity} Left</span>
        ) : (
          <span className="product-stock-tag in-stock">In Stock</span>
        )}
      </div>

      <div className="product-info">
        <h3 className="product-name" title={product.name}>{product.name}</h3>
        <p className="product-description">{product.description || 'Fresh quality grocery item.'}</p>

        <div className="product-footer">
          <div className="product-price">
            ₹{Number(product.price).toFixed(2)}
          </div>

          <div className="product-actions">
            <button
              className="btn-alternative"
              onClick={() => onSelectAlternative(product)}
              title="Find cheaper alternative in same category"
            >
              <Sparkles size={14} />
              AI Save
            </button>

            <button
              className="btn-add-cart"
              onClick={handleAdd}
              disabled={isOutOfStock || adding || loading}
            >
              <ShoppingCart size={15} />
              {adding ? 'Adding...' : 'Add'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
