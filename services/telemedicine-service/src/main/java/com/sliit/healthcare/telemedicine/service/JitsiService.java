package com.sliit.healthcare.telemedicine.service;

import java.security.KeyFactory;
import java.security.interfaces.RSAPrivateKey;
import java.security.spec.PKCS8EncodedKeySpec;
import java.util.Base64;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.sliit.healthcare.telemedicine.config.JitsiProperties;

@Service
public class JitsiService {

    private static final Logger log = LoggerFactory.getLogger(JitsiService.class);
    
    private final JitsiProperties jitsiProperties;
    
    public JitsiService(JitsiProperties jitsiProperties) {
        this.jitsiProperties = jitsiProperties;
    }
    
    /**
     * Generates a JWT token for Jitsi Meet authentication
     * Token authenticates users and allows them to join video conferences
     */
    public String generateJitsiToken(String roomName, String userId, String userDisplayName, String userEmail, boolean isModerator) {
        try {
            long issuedAt = System.currentTimeMillis() / 1000;
            long expiresAt = issuedAt + jitsiProperties.getConferenceDurationSeconds();
            
            // Build JWT claims using JaaS-compatible structure.
            Map<String, Object> context = new HashMap<>();
            context.put("user", Map.of(
                "id", userId,
                "name", userDisplayName,
                "email", userEmail,
                "avatar", "https://api.dicebear.com/7.x/avataaars/svg?seed=" + userId,
                "moderator", String.valueOf(isModerator)
            ));
            context.put("features", Map.of(
                "livestreaming", true,
                "recording", true,
                "transcription", false,
                "outbound-call", false,
                "sip-outbound-call", false
            ));
            
            Map<String, Object> payload = new HashMap<>();
            payload.put("room", roomName);
            payload.put("aud", "jitsi");
            payload.put("iss", "chat");
            payload.put("sub", jitsiProperties.getAppId());
            payload.put("iat", issuedAt);
            payload.put("exp", expiresAt);
            payload.put("context", context);
            payload.put("nbf", issuedAt - 10);
            
            Algorithm algorithm = Algorithm.RSA256(null, parsePrivateKey(jitsiProperties.getPrivateKey()));
            String token = JWT.create()
                .withKeyId(jitsiProperties.getApiKey())
                .withPayload(payload)
                .withIssuedAt(new Date(issuedAt * 1000))
                .withExpiresAt(new Date(expiresAt * 1000))
                .sign(algorithm);
            
            log.info("Generated Jitsi token for room: {}, user: {}", roomName, userDisplayName);
            return token;
        } catch (RuntimeException e) {
            log.error("Error generating Jitsi token", e);
            throw new RuntimeException("Failed to generate Jitsi token", e);
        }
    }
    
    /**
     * Generates the Jitsi Meet URL for joining a conference
     */
    public String generateJitsiMeetUrl(String roomName, String token) {
        return String.format(
            "https://meet.jit.si/%s#config.prejoinPageEnabled=true&config.startWithAudioMuted=false&config.startWithVideoMuted=false",
            roomName
        );
    }
    
    /**
     * Generates a conference room name from session details
     */
    public String generateRoomName(String appointmentId, String patientId, String doctorId) {
        // Creates a unique room name: appointment-id-timestamp
        return String.format("hc-%s-%d", appointmentId, System.currentTimeMillis() / 1000);
    }

    private RSAPrivateKey parsePrivateKey(String privateKeyPem) {
        try {
            String sanitized = privateKeyPem
                .replace("-----BEGIN PRIVATE KEY-----", "")
                .replace("-----END PRIVATE KEY-----", "")
                .replaceAll("\\s", "");
            byte[] keyBytes = Base64.getDecoder().decode(sanitized);
            PKCS8EncodedKeySpec keySpec = new PKCS8EncodedKeySpec(keyBytes);
            return (RSAPrivateKey) KeyFactory.getInstance("RSA").generatePrivate(keySpec);
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid Jitsi private key format", e);
        }
    }
}
