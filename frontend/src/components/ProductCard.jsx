import React, { useState } from 'react';
import { ShoppingCart, Sparkles, CheckCircle2, AlertTriangle, XCircle, Check } from 'lucide-react';
import { useCart } from '../context/useCart';

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80';

const ProductCard = ({ product, onSelectAlternative }) => {
  const { addToCart, loading } = useCart();
  const [imgSrc, setImgSrc] = useState(product.imageUrl || DEFAULT_IMAGE);
  const [adding, setAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const isOutOfStock = product.stockQuantity <= 0;
  const isLowStock = product.stockQuantity > 0 && product.stockQuantity <= 10;

  const handleAdd = async () => {
    if (isOutOfStock || adding || loading) return;
    setAdding(true);
    const success = await addToCart(product.id, 1);
    setAdding(false);
    if (success) {
      setJustAdded(true);
      setTimeout(() => {
        setJustAdded(false);
      }, 1200);
    }
  };

  return (
    <article className="product-card" aria-label={product.name}>
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
          <span className="product-stock-tag out-of-stock" role="status">
            <XCircle size={12} aria-hidden="true" />
            <span>Out of Stock</span>
          </span>
        ) : isLowStock ? (
          <span className="product-stock-tag low-stock" role="status">
            <AlertTriangle size={12} aria-hidden="true" />
            <span>{product.stockQuantity} Left</span>
          </span>
        ) : (
          <span className="product-stock-tag in-stock" role="status">
            <CheckCircle2 size={12} aria-hidden="true" />
            <span>In Stock</span>
          </span>
        )}
      </div>

      <div className="product-info">
        <h3 className="product-name" title={product.name}>{product.name}</h3>
        <p className="product-description">{product.description || 'Verified supermarket pantry item.'}</p>

        <div className="product-footer">
          <div className="product-price" aria-label={`Price: ${Number(product.price).toFixed(2)} Indian Rupees`}>
            ₹{Number(product.price).toFixed(2)}
          </div>

          <div className="product-actions">
            <button
              type="button"
              className="btn-alternative"
              onClick={() => onSelectAlternative(product)}
              title={`Find economical alternatives for ${product.name}`}
              aria-label={`Find economical alternatives for ${product.name}`}
            >
              <Sparkles size={13} aria-hidden="true" />
              <span>AI Save</span>
            </button>

            <button
              type="button"
              className={`btn-add-cart ${justAdded ? 'added' : ''}`}
              onClick={handleAdd}
              disabled={isOutOfStock || adding || loading}
              aria-label={
                isOutOfStock
                  ? `${product.name} is out of stock`
                  : justAdded
                  ? `Added ${product.name} to cart`
                  : `Add ${product.name} to cart`
              }
            >
              {justAdded ? (
                <>
                  <Check size={14} aria-hidden="true" />
                  <span>Added!</span>
                </>
              ) : adding ? (
                <span>Adding...</span>
              ) : (
                <>
                  <ShoppingCart size={14} aria-hidden="true" />
                  <span>Add</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
