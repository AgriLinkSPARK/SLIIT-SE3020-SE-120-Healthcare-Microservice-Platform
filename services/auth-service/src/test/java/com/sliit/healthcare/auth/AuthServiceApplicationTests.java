package com.sliit.healthcare.auth;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = "auth.seed-admin.enabled=false")
class AuthServiceApplicationTests {

	@Test
	void contextLoads() {
	}

}
