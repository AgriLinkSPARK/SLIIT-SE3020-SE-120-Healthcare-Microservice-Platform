package com.sliit.healthcare.telemedicine.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "jitsi")
public class JitsiProperties {
    private String apiUrl;
    private String apiKey;
    private String appId;
    private String privateKey;
    private int conferenceDurationSeconds;

    public String getApiUrl() {
        return apiUrl;
    }

    public void setApiUrl(String apiUrl) {
        this.apiUrl = apiUrl;
    }

    public String getApiKey() {
        return apiKey;
    }

    public void setApiKey(String apiKey) {
        this.apiKey = apiKey;
    }

    public String getAppId() {
        return appId;
    }

    public void setAppId(String appId) {
        this.appId = appId;
    }

    public String getPrivateKey() {
        return privateKey;
    }

    public void setPrivateKey(String privateKey) {
        this.privateKey = privateKey;
    }

    public int getConferenceDurationSeconds() {
        return conferenceDurationSeconds;
    }

    public void setConferenceDurationSeconds(int conferenceDurationSeconds) {
        this.conferenceDurationSeconds = conferenceDurationSeconds;
    }
}
