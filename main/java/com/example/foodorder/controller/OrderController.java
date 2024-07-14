package com.example.foodorder.controller;

import com.example.foodorder.model.Order;
import com.example.foodorder.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/orders")
public class OrderController {
    @Autowired
    private OrderService orderService;

    @PostMapping("/place")
    public ResponseEntity<String> placeOrder(@RequestBody Order order) {
        System.out.println("Received order: " + order);
        try {
            orderService.placeOrder(order);
            return ResponseEntity.ok("Order placed successfully");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Failed to place order");
        }
    }
}







