package com.supermarket.cart;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class AdminSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void testAdminEndpointsRejectRequestWithoutAdminKey() throws Exception {
        mockMvc.perform(get("/api/admin/products"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.error").value("Unauthorized"));
    }

    @Test
    void testAdminEndpointsRejectRequestWithInvalidAdminKey() throws Exception {
        mockMvc.perform(get("/api/admin/products")
                .header("X-Admin-Key", "wrong-secret-key"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));
    }

    @Test
    void testAdminEndpointsPermitRequestWithValidAdminKey() throws Exception {
        mockMvc.perform(get("/api/admin/products")
                .header("X-Admin-Key", "fc-admin-key-2025"))
                .andExpect(status().isOk());
    }

    @Test
    void testPublicEndpointsRemainAccessibleWithoutAdminKey() throws Exception {
        mockMvc.perform(get("/api/products"))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/health"))
                .andExpect(status().isOk());
    }
}
