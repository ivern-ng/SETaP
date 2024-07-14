package com.example.foodorder;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;

@SpringBootApplication
@EntityScan(basePackages = "com.example.foodorder.model")
public class FoodOrderAppApplication {
	public static void main(String[] args) {
		SpringApplication.run(FoodOrderAppApplication.class, args);
	}
}

