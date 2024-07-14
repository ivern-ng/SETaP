package com.example.foodorder.service;

import com.example.foodorder.model.Order;
import com.example.foodorder.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OrderService {
    @Autowired
    private OrderRepository orderRepository;

    @Transactional
    public void placeOrder(Order order) {
        try {
            System.out.println("Saving order: " + order);
            orderRepository.save(order);
            System.out.println("Order saved successfully");
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to save order", e);
        }
    }
}












