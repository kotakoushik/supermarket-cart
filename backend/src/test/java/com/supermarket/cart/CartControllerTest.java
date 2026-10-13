package com.supermarket.cart;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.supermarket.cart.dto.CartItemRequestDTO;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = true)
public class CartControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testAddItemToCartWithCartIdHeader() throws Exception {
        CartItemRequestDTO request = new CartItemRequestDTO(1L, 2);

        mockMvc.perform(post("/api/cart/items")
                .header("X-Cart-Id", "cart-unit-test-1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.cartId").value("cart-unit-test-1"))
                .andExpect(jsonPath("$.items").isArray())
                .andExpect(jsonPath("$.totalItems").value(2));
    }

    @Test
    void testAddItemToCartWithSessionKeyHeader() throws Exception {
        CartItemRequestDTO request = new CartItemRequestDTO(1L, 1);

        mockMvc.perform(post("/api/cart/items")
                .header("X-Session-Key", "cart-session-test-2")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.cartId").value("cart-session-test-2"))
                .andExpect(jsonPath("$.totalItems").value(1));
    }

    @Test
    void testAddItemToCartWithQueryParamFallback() throws Exception {
        CartItemRequestDTO request = new CartItemRequestDTO(1L, 1);

        mockMvc.perform(post("/api/cart/items?cartId=cart-param-test-3")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.cartId").value("cart-param-test-3"));
    }

    @Test
    void testAddItemValidationFailure() throws Exception {
        // Quantity must be at least 1
        CartItemRequestDTO invalidRequest = new CartItemRequestDTO(1L, 0);

        mockMvc.perform(post("/api/cart/items")
                .header("X-Cart-Id", "cart-invalid-test")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testUpdateAndRemoveCartItem() throws Exception {
        String cartId = "cart-flow-test-4";

        // Add item
        mockMvc.perform(post("/api/cart/items")
                .header("X-Cart-Id", cartId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new CartItemRequestDTO(1L, 1))))
                .andExpect(status().isOk());

        // Update quantity to 3
        mockMvc.perform(put("/api/cart/items/1")
                .header("X-Cart-Id", cartId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("quantity", 3))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalItems").value(3));

        // Remove item
        mockMvc.perform(delete("/api/cart/items/1")
                .header("X-Cart-Id", cartId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalItems").value(0));
    }

    @Test
    void testCorsHeadersForCartEndpoints() throws Exception {
        CartItemRequestDTO request = new CartItemRequestDTO(1L, 1);
        mockMvc.perform(post("/api/cart/items")
                .header("Origin", "http://localhost:5173")
                .header("X-Cart-Id", "cart-cors-test")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:5173"));
    }
}
