package com.supermarket.cart.service;

import com.supermarket.cart.dto.CheckoutRequestDTO;
import com.supermarket.cart.dto.OrderItemResponseDTO;
import com.supermarket.cart.dto.OrderResponseDTO;
import com.supermarket.cart.entity.CartItem;
import com.supermarket.cart.entity.Customer;
import com.supermarket.cart.entity.Order;
import com.supermarket.cart.entity.OrderItem;
import com.supermarket.cart.entity.Product;
import com.supermarket.cart.exception.BadRequestException;
import com.supermarket.cart.exception.InsufficientStockException;
import com.supermarket.cart.exception.ResourceNotFoundException;
import com.supermarket.cart.exception.UnauthorizedException;
import com.supermarket.cart.repository.CartItemRepository;
import com.supermarket.cart.repository.OrderRepository;
import com.supermarket.cart.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Collections;
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
        return createOrder(request, null);
    }

    @Transactional
    public OrderResponseDTO createOrder(CheckoutRequestDTO request, Customer customer) {
        if (request.getCartId() == null || request.getCartId().isBlank()) {
            throw new BadRequestException("Cart ID is required for checkout");
        }

        List<CartItem> cartItems = cartItemRepository.findByCartId(request.getCartId());
        if (cartItems.isEmpty()) {
            throw new BadRequestException("Cannot checkout: Cart is empty");
        }

        String customerName = request.getCustomerName() != null && !request.getCustomerName().isBlank()
                ? request.getCustomerName().trim()
                : (customer != null ? customer.getFullName() : "");

        String customerEmail = request.getCustomerEmail() != null && !request.getCustomerEmail().isBlank()
                ? request.getCustomerEmail().trim()
                : (customer != null ? customer.getEmail() : "");

        String customerPhone = request.getCustomerPhone() != null && !request.getCustomerPhone().isBlank()
                ? request.getCustomerPhone().trim()
                : (customer != null ? customer.getPhone() : null);

        String deliveryAddress = request.getDeliveryAddress() != null && !request.getDeliveryAddress().isBlank()
                ? request.getDeliveryAddress().trim()
                : (customer != null ? customer.getAddress() : "");

        String paymentMethod = request.getPaymentMethod() != null && !request.getPaymentMethod().isBlank()
                ? request.getPaymentMethod().trim()
                : "COD";

        if (customerName.isBlank()) {
            throw new BadRequestException("Customer name is required");
        }
        if (customerEmail.isBlank()) {
            throw new BadRequestException("Customer email is required");
        }
        if (deliveryAddress.isBlank()) {
            throw new BadRequestException("Delivery address is required");
        }

        BigDecimal calculatedTotal = BigDecimal.ZERO;
        Order order = new Order(
                customer,
                customerName,
                customerEmail,
                customerPhone,
                deliveryAddress,
                paymentMethod,
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
    public OrderResponseDTO getOrderByIdAndCustomer(Long id, Customer customer) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));

        // If order is bound to a customer, verify ownership
        if (order.getCustomer() != null) {
            if (customer == null || !order.getCustomer().getId().equals(customer.getId())) {
                throw new UnauthorizedException("Access denied: You cannot view orders placed by other customer accounts.");
            }
        }

        return mapToDTO(order);
    }

    @Transactional(readOnly = true)
    public List<OrderResponseDTO> getOrdersForCustomer(Customer customer) {
        if (customer == null) {
            return Collections.emptyList();
        }

        return orderRepository.findByCustomerOrderByCreatedAtDesc(customer)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<OrderResponseDTO> getAllOrders() {
        return orderRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public OrderResponseDTO mapToDTO(Order order) {
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

        Long customerId = order.getCustomer() != null ? order.getCustomer().getId() : null;

        return new OrderResponseDTO(
                order.getId(),
                customerId,
                order.getCustomerName(),
                order.getCustomerEmail(),
                order.getCustomerPhone(),
                order.getDeliveryAddress(),
                order.getPaymentMethod(),
                order.getTotalAmount(),
                order.getCreatedAt(),
                order.getOrderStatus(),
                itemDTOs
        );
    }
}
