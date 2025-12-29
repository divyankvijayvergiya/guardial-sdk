package com.guardial.sdk.spring;

import com.guardial.sdk.GuardialClient;
import com.guardial.sdk.GuardialConfig;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Spring Boot auto-configuration for Guardial SDK
 */
@Configuration
@EnableConfigurationProperties(GuardialProperties.class)
@ConditionalOnProperty(prefix = "guardial", name = "enabled", havingValue = "true", matchIfMissing = true)
public class GuardialSpringConfig implements WebMvcConfigurer {

    private final GuardialInterceptor guardialInterceptor;

    public GuardialSpringConfig(GuardialInterceptor guardialInterceptor) {
        this.guardialInterceptor = guardialInterceptor;
    }

    @Bean
    public GuardialClient guardialClient(GuardialProperties properties) {
        GuardialConfig config = new GuardialConfig();
        config.setApiKey(properties.getApiKey());
        config.setEndpoint(properties.getEndpoint());
        config.setCustomerId(properties.getCustomerId());
        config.setDebug(properties.isEnabled());
        config.setTimeoutSeconds(properties.getTimeoutSeconds());

        return new GuardialClient(config);
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(guardialInterceptor)
                .addPathPatterns("/**")
                .excludePathPatterns("/actuator/**", "/health", "/error");
    }
}

