package com.supermarket.cart.service;

import com.supermarket.cart.dto.CartItemRequestDTO;
import com.supermarket.cart.dto.CartItemResponseDTO;
import com.supermarket.cart.dto.CartResponseDTO;
import com.supermarket.cart.entity.CartItem;
import com.supermarket.cart.entity.Product;
import com.supermarket.cart.exception.BadRequestException;
import com.supermarket.cart.exception.InsufficientStockException;
import com.supermarket.cart.exception.ResourceNotFoundException;
import com.supermarket.cart.repository.CartItemRepository;
import com.supermarket.cart.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class CartService {

    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;

    public CartService(CartItemRepository cartItemRepository, ProductRepository productRepository) {
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
    }

    @Transactional(readOnly = true)
    public CartResponseDTO getCart(String cartId) {
        validateCartId(cartId);
        List<CartItem> items = cartItemRepository.findByCartId(cartId);
        return buildCartResponse(cartId, items);
    }

    @Transactional
    public CartResponseDTO addItemToCart(String cartId, CartItemRequestDTO request) {
        validateCartId(cartId);
        if (request.getProductId() == null) {
            throw new BadRequestException("Product ID is required");
        }
        if (request.getQuantity() == null || request.getQuantity() <= 0) {
            throw new BadRequestException("Quantity must be at least 1");
        }

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + request.getProductId()));

        if (!Boolean.TRUE.equals(product.getActive())) {
            throw new BadRequestException("Product '" + product.getName() + "' is currently inactive and cannot be added to cart");
        }

        Optional<CartItem> existingItemOpt = cartItemRepository.findByCartIdAndProductId(cartId, request.getProductId());
        int targetQuantity = request.getQuantity();

        if (existingItemOpt.isPresent()) {
            targetQuantity += existingItemOpt.get().getQuantity();
        }

        if (targetQuantity > product.getStockQuantity()) {
            throw new InsufficientStockException("Insufficient stock for " + product.getName() + 
                    ". Requested: " + targetQuantity + ", Available: " + product.getStockQuantity());
        }

        CartItem cartItem;
        if (existingItemOpt.isPresent()) {
            cartItem = existingItemOpt.get();
            cartItem.setQuantity(targetQuantity);
        } else {
            cartItem = new CartItem(cartId, product, targetQuantity);
        }

        cartItemRepository.save(cartItem);
        return getCart(cartId);
    }

    @Transactional
    public CartResponseDTO updateItemQuantity(String cartId, Long productId, int quantity) {
        validateCartId(cartId);
        if (quantity < 0) {
            throw new BadRequestException("Quantity cannot be negative");
        }

        if (quantity == 0) {
            return removeItemFromCart(cartId, productId);
        }

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));

        if (!Boolean.TRUE.equals(product.getActive())) {
            throw new BadRequestException("Product '" + product.getName() + "' is inactive");
        }

        if (quantity > product.getStockQuantity()) {
            throw new InsufficientStockException("Insufficient stock for " + product.getName() + 
                    ". Requested: " + quantity + ", Available: " + product.getStockQuantity());
        }

        CartItem cartItem = cartItemRepository.findByCartIdAndProductId(cartId, productId)
                .orElseThrow(() -> new ResourceNotFoundException("Item with product ID " + productId + " not found in cart"));

        cartItem.setQuantity(quantity);
        cartItemRepository.save(cartItem);

        return getCart(cartId);
    }

    @Transactional
    public CartResponseDTO removeItemFromCart(String cartId, Long productId) {
        validateCartId(cartId);
        cartItemRepository.deleteByCartIdAndProductId(cartId, productId);
        return getCart(cartId);
    }

    @Transactional
    public CartResponseDTO clearCart(String cartId) {
        validateCartId(cartId);
        cartItemRepository.deleteByCartId(cartId);
        return new CartResponseDTO(cartId, new ArrayList<>(), 0, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO);
    }

    private CartResponseDTO buildCartResponse(String cartId, List<CartItem> items) {
        List<CartItemResponseDTO> itemDTOs = new ArrayList<>();
        BigDecimal subtotal = BigDecimal.ZERO;
        int totalItemCount = 0;

        for (CartItem item : items) {
            Product p = item.getProduct();
            BigDecimal unitPrice = p.getPrice();
            BigDecimal itemSubtotal = unitPrice.multiply(BigDecimal.valueOf(item.getQuantity()))
                    .setScale(2, RoundingMode.HALF_UP);

            subtotal = subtotal.add(itemSubtotal);
            totalItemCount += item.getQuantity();

            CartItemResponseDTO dto = new CartItemResponseDTO(
                    item.getId(),
                    p.getId(),
                    p.getName(),
                    p.getCategory(),
                    unitPrice,
                    item.getQuantity(),
                    itemSubtotal,
                    p.getStockQuantity(),
                    p.getImageUrl()
            );
            itemDTOs.add(dto);
        }

        BigDecimal total = subtotal.setScale(2, RoundingMode.HALF_UP);
        return new CartResponseDTO(cartId, itemDTOs, totalItemCount, subtotal, BigDecimal.ZERO, total);
    }

    private void validateCartId(String cartId) {
        if (cartId == null || cartId.isBlank()) {
            throw new BadRequestException("Cart ID header/parameter is required");
        }
    }
}
