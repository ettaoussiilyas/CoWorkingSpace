package com.aihub.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendBookingConfirmation(String to, String spaceName, String dateTime) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Booking Confirmation - AIHub");
        message.setText("Hello,\n\nYour booking for " + spaceName + " on " + dateTime + " has been confirmed.\n\nThank you for choosing AIHub!");
        
        try {
            mailSender.send(message);
        } catch (Exception e) {
            // Log error but don't fail the booking process
            System.err.println("Failed to send email: " + e.getMessage());
        }
    }
}
