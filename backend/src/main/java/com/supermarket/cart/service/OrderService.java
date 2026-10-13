package com.supermarket.cart.service;

import com.supermarket.cart.dto.CheckoutRequestDTO;
import com.supermarket.cart.dto.OrderItemResponseDTO;
import com.supermarket.cart.dto.OrderResponseDTO;
import com.supermarket.cart.entity.CartItem;
import com.supermarket.cart.entity.Order;
import com.supermarket.cart.entity.OrderItem;
import com.supermarket.cart.entity.Product;
import com.supermarket.cart.exception.BadRequestException;
import com.supermarket.cart.exception.InsufficientStockException;
import com.supermarket.cart.exception.ResourceNotFoundException;
import com.supermarket.cart.repository.CartItemRepository;
import com.supermarket.cart.repository.OrderRepository;
import com.supermarket.cart.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final CartItemRepository cartItemRepository;

    public OrderService(OrderRepository orderRepository, ProductRepository productRepository, CartItemRepository cartItemRepository) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.cartItemRepository = cartItemRepository;
    }

    @Transactional
    public OrderResponseDTO createOrder(CheckoutRequestDTO request) {
        if (request.getCartId() == null || request.getCartId().isBlank()) {
            throw new BadRequestException("Cart ID is required for checkout");
        }

        List<CartItem> cartItems = cartItemRepository.findByCartId(request.getCartId());
        if (cartItems.isEmpty()) {
            throw new BadRequestException("Cannot checkout: Cart is empty");
        }

        BigDecimal calculatedTotal = BigDecimal.ZERO;
        Order order = new Order(
                request.getCustomerName().trim(),
                request.getCustomerEmail().trim(),
                request.getCustomerPhone() != null ? request.getCustomerPhone().trim() : null,
                request.getDeliveryAddress().trim(),
                BigDecimal.ZERO
        );

        List<OrderItem> orderItems = new ArrayList<>();

        for (CartItem cartItem : cartItems) {
            Product product = productRepository.findByIdWithLock(cartItem.getProduct().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + cartItem.getProduct().getId()));

            if (!Boolean.TRUE.equals(product.getActive())) {
                throw new BadRequestException("Product '" + product.getName() + "' is no longer available");
            }

            if (cartItem.getQuantity() > product.getStockQuantity()) {
                throw new InsufficientStockException("Insufficient stock for " + product.getName() +
                        ". Requested: " + cartItem.getQuantity() + ", Available: " + product.getStockQuantity());
            }

            // Deduct inventory atomically within transaction
            product.setStockQuantity(product.getStockQuantity() - cartItem.getQuantity());
            productRepository.save(product);

            // Server-calculated unit price and subtotal
            BigDecimal unitPrice = product.getPrice();
            BigDecimal itemSubtotal = unitPrice.multiply(BigDecimal.valueOf(cartItem.getQuantity()))
                    .setScale(2, RoundingMode.HALF_UP);
            calculatedTotal = calculatedTotal.add(itemSubtotal);

            OrderItem orderItem = new OrderItem(order, product, cartItem.getQuantity(), unitPrice, itemSubtotal);
            orderItems.add(orderItem);
        }

        order.setTotalAmount(calculatedTotal.setScale(2, RoundingMode.HALF_UP));
        order.setOrderItems(orderItems);

        Order savedOrder = orderRepository.save(order);

        // Clear cart after successful checkout transaction
        cartItemRepository.deleteByCartId(request.getCartId());

        return mapToDTO(savedOrder);
    }

    @Transactional(readOnly = true)
    public OrderResponseDTO getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));
        return mapToDTO(order);
    }

    @Transactional(readOnly = true)
    public List<OrderResponseDTO> getAllOrders() {
        return orderRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    private OrderResponseDTO mapToDTO(Order order) {
        List<OrderItemResponseDTO> itemDTOs = order.getOrderItems().stream().map(item -> new OrderItemResponseDTO(
                item.getId(),
                item.getProduct().getId(),
                item.getProduct().getName(),
                item.getProduct().getCategory(),
                item.getProduct().getImageUrl(),
                item.getQuantity(),
                item.getUnitPrice(),
                item.getSubtotal()
        )).collect(Collectors.toList());

        return new OrderResponseDTO(
                order.getId(),
                order.getCustomerName(),
                order.getCustomerEmail(),
                order.getCustomerPhone(),
                order.getDeliveryAddress(),
                order.getTotalAmount(),
                order.getCreatedAt(),
                order.getOrderStatus(),
                itemDTOs
        );
    }
}
