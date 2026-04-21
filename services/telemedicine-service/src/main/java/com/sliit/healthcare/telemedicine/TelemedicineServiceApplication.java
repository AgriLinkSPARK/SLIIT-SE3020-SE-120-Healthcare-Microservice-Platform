package com.sliit.healthcare.telemedicine;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

import com.sliit.healthcare.telemedicine.config.JitsiProperties;

@SpringBootApplication
@EnableConfigurationProperties(JitsiProperties.class)
public class TelemedicineServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(TelemedicineServiceApplication.class, args);
	}
}
