package com.supermarket.cart;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.supermarket.cart.dto.AdminLoginRequestDTO;
import com.supermarket.cart.dto.CheckoutRequestDTO;
import com.supermarket.cart.dto.LoginRequestDTO;
import com.supermarket.cart.dto.RegisterRequestDTO;
import com.supermarket.cart.entity.Product;
import com.supermarket.cart.repository.ProductRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.math.BigDecimal;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class CustomerAuthAndOrderTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ProductRepository productRepository;

    @Test
    void testCustomerRegistrationLoginAndOrderIsolation() throws Exception {
        String emailA = "alice_" + UUID.randomUUID() + "@example.com";
        String emailB = "bob_" + UUID.randomUUID() + "@example.com";

        // 1. Register Customer A
        RegisterRequestDTO regA = new RegisterRequestDTO();
        regA.setFullName("Alice Green");
        regA.setEmail(emailA);
        regA.setPassword("secret123");
        regA.setPhone("+91 9876500001");
        regA.setAddress("123 Orchard Road, Bangalore");

        MvcResult regResultA = mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(regA)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.customer.email").value(emailA.toLowerCase()))
                .andExpect(jsonPath("$.customer.fullName").value("Alice Green"))
                .andReturn();

        String tokenA = objectMapper.readTree(regResultA.getResponse().getContentAsString()).get("token").asText();

        // 2. Reject duplicate email registration
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(regA)))
                .andExpect(status().isBadRequest());

        // 3. Reject login with wrong password
        LoginRequestDTO badLogin = new LoginRequestDTO();
        badLogin.setEmail(emailA);
        badLogin.setPassword("wrongpassword");
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(badLogin)))
                .andExpect(status().isUnauthorized());

        // 4. Accept login with correct password
        LoginRequestDTO goodLogin = new LoginRequestDTO();
        goodLogin.setEmail(emailA);
        goodLogin.setPassword("secret123");
        MvcResult loginResultA = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(goodLogin)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andReturn();

        String reLoginTokenA = objectMapper.readTree(loginResultA.getResponse().getContentAsString()).get("token").asText();

        // 5. Test Customer Profile endpoint
        mockMvc.perform(get("/api/auth/me")
                .header("X-Customer-Token", reLoginTokenA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(emailA.toLowerCase()));

        // 6. Register Customer B
        RegisterRequestDTO regB = new RegisterRequestDTO();
        regB.setFullName("Bob Brown");
        regB.setEmail(emailB);
        regB.setPassword("secret456");
        regB.setPhone("+91 9876500002");
        regB.setAddress("456 Palm Grove, Bangalore");

        MvcResult regResultB = mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(regB)))
                .andExpect(status().isCreated())
                .andReturn();

        String tokenB = objectMapper.readTree(regResultB.getResponse().getContentAsString()).get("token").asText();

        // 7. Customer A adds item to cart and checks out
        String cartIdA = "cart-" + UUID.randomUUID();
        Product product = productRepository.findAll().stream().findFirst().orElseGet(() -> {
            Product p = new Product();
            p.setName("Organic Milk");
            p.setCategory("Dairy");
            p.setPrice(new BigDecimal("60.00"));
            p.setStockQuantity(50);
            p.setActive(true);
            return productRepository.save(p);
        });

        // Add item to cart
        mockMvc.perform(post("/api/cart/items")
                .header("X-Cart-Id", cartIdA)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"productId\":" + product.getId() + ",\"quantity\":2}"))
                .andExpect(status().isOk());

        // Customer A places order with customer token
        CheckoutRequestDTO checkout = new CheckoutRequestDTO();
        checkout.setCartId(cartIdA);
        checkout.setCustomerName("Alice Green");
        checkout.setCustomerEmail(emailA);
        checkout.setCustomerPhone("+91 9876500001");
        checkout.setDeliveryAddress("123 Orchard Road, Bangalore");
        checkout.setPaymentMethod("COD");

        MvcResult checkoutResult = mockMvc.perform(post("/api/orders")
                .header("X-Customer-Token", tokenA)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(checkout)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNotEmpty())
                .andExpect(jsonPath("$.customerEmail").value(emailA.toLowerCase()))
                .andExpect(jsonPath("$.paymentMethod").value("COD"))
                .andReturn();

        Long orderIdA = objectMapper.readTree(checkoutResult.getResponse().getContentAsString()).get("id").asLong();

        // 8. Customer A retrieves order history -> Contains Order A
        mockMvc.perform(get("/api/orders")
                .header("X-Customer-Token", tokenA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].id").value(orderIdA));

        // 9. Customer B retrieves order history -> Customer B cannot see Customer A's order (empty list)
        mockMvc.perform(get("/api/orders")
                .header("X-Customer-Token", tokenB))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));

        // 10. Customer B attempts to access Customer A's order directly -> 401 Unauthorized
        mockMvc.perform(get("/api/orders/" + orderIdA)
                .header("X-Customer-Token", tokenB))
                .andExpect(status().isUnauthorized());

        // 11. Customer A can access their own order directly
        mockMvc.perform(get("/api/orders/" + orderIdA)
                .header("X-Customer-Token", tokenA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(orderIdA));
    }

    @Test
    void testAdminUsernamePasswordLogin() throws Exception {
        // Valid admin login
        AdminLoginRequestDTO validLogin = new AdminLoginRequestDTO();
        validLogin.setUsername("admin@freshcart.com");
        validLogin.setPassword("admin123");

        MvcResult adminResult = mockMvc.perform(post("/api/admin/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(validLogin)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.role").value("ROLE_ADMIN"))
                .andReturn();

        String adminToken = objectMapper.readTree(adminResult.getResponse().getContentAsString()).get("token").asText();

        // Access protected admin endpoint with received admin token
        mockMvc.perform(get("/api/admin/products")
                .header("X-Admin-Key", adminToken))
                .andExpect(status().isOk());

        // Invalid admin login
        AdminLoginRequestDTO badAdminLogin = new AdminLoginRequestDTO();
        badAdminLogin.setUsername("admin@freshcart.com");
        badAdminLogin.setPassword("wrongpassword");

        mockMvc.perform(post("/api/admin/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(badAdminLogin)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testCorsPreflightAndRegistrationForProductionFrontend() throws Exception {
        String prodOrigin = "https://smartsmart-frontend.onrender.com";

        // 1. Verify OPTIONS Preflight handles headers and exact origin without wildcards
        mockMvc.perform(options("/api/auth/register")
                .header("Origin", prodOrigin)
                .header("Access-Control-Request-Method", "POST")
                .header("Access-Control-Request-Headers", "Content-Type, X-Cart-Id, X-Session-Key"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", prodOrigin))
                .andExpect(header().string("Access-Control-Allow-Credentials", "true"))
                .andExpect(header().string("Access-Control-Allow-Methods", containsString("POST")))
                .andExpect(header().string("Access-Control-Allow-Headers", containsString("Content-Type")))
                .andExpect(header().string("Access-Control-Allow-Headers", containsString("X-Cart-Id")))
                .andExpect(header().string("Access-Control-Allow-Headers", containsString("X-Session-Key")));

        // 2. Verify actual POST registration with Origin returns CORS headers and 201 Created
        String email = "cors_test_" + UUID.randomUUID() + "@example.com";
        RegisterRequestDTO regRequest = new RegisterRequestDTO(
                "CORS Test User",
                email,
                "password123",
                "+91 9999988888",
                "123 Cloud Street"
        );

        mockMvc.perform(post("/api/auth/register")
                .header("Origin", prodOrigin)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(regRequest)))
                .andExpect(status().isCreated())
                .andExpect(header().string("Access-Control-Allow-Origin", prodOrigin))
                .andExpect(header().string("Access-Control-Allow-Credentials", "true"))
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.customer.email").value(email.toLowerCase()));
    }
}
