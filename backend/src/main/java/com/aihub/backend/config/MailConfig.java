package com.aihub.backend.config;

import org.springframework.boot.autoconfigure.mail.MailProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;

import java.util.Properties;

@Configuration
@EnableConfigurationProperties(MailProperties.class)
public class MailConfig {

    @Bean
    public JavaMailSender javaMailSender(MailProperties mailProperties) {
        JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
        mailSender.setHost(mailProperties.getHost() != null ? mailProperties.getHost() : "localhost");
        mailSender.setPort(mailProperties.getPort() > 0 ? mailProperties.getPort() : 1025);
        mailSender.setUsername(mailProperties.getUsername() != null ? mailProperties.getUsername() : "");
        mailSender.setPassword(mailProperties.getPassword() != null ? mailProperties.getPassword() : "");

        Properties props = mailSender.getJavaMailProperties();
        props.putAll(mailProperties.getProperties());
        
        if (!props.containsKey("mail.transport.protocol")) {
            props.put("mail.transport.protocol", "smtp");
        }
        if (!props.containsKey("mail.smtp.auth")) {
            props.put("mail.smtp.auth", false);
        }
        if (!props.containsKey("mail.smtp.starttls.enable")) {
            props.put("mail.smtp.starttls.enable", false);
        }
        if (!props.containsKey("mail.debug")) {
            props.put("mail.debug", false);
        }

        return mailSender;
    }
}


