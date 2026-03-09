package com.aihub.backend.service;

import com.aihub.backend.entity.Booking;
import com.aihub.backend.repository.BookingRepository;
import com.opencsv.CSVWriter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.StringWriter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ExportService {

    private final BookingRepository bookingRepository;

    public String exportBookingsToCsv() {
        List<Booking> bookings = bookingRepository.findAll();
        StringWriter writer = new StringWriter();
        
        try (CSVWriter csvWriter = new CSVWriter(writer)) {
            // Header
            csvWriter.writeNext(new String[]{"ID", "User", "Space", "Start", "End", "Status", "Price"});
            
            for (Booking b : bookings) {
                csvWriter.writeNext(new String[]{
                        b.getId().toString(),
                        b.getUser().getEmail(),
                        b.getSpace().getName(),
                        b.getStartDateTime().toString(),
                        b.getEndDateTime().toString(),
                        b.getStatus().toString(),
                        b.getTotalPrice().toString()
                });
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate CSV", e);
        }
        
        return writer.toString();
    }
}
