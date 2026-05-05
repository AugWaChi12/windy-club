package com.windychain.intelligence;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class WindyChainApplication {

    public static void main(String[] args) {
        SpringApplication.run(WindyChainApplication.class, args);
    }
}
