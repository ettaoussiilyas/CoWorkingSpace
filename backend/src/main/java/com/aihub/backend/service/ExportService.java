package com.aihub.backend.service;

import com.aihub.backend.entity.Booking;
import com.aihub.backend.repository.BookingRepository;
import com.opencsv.CSVWriter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.StringWriter;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ExportService {

    private final BookingRepository bookingRepository;

    public String exportBookingsToCsv() {
        LocalDate now = LocalDate.now();
        return exportMonthCsv(now.getYear(), now.getMonthValue());
    }

    public String exportMonthCsv(int year, int month) {
        List<Booking> bookings = bookingRepository.findByYearAndMonth(year, month);
        StringWriter writer = new StringWriter();

        try (CSVWriter csvWriter = new CSVWriter(writer)) {
            csvWriter.writeNext(new String[]{
                "ID", "Client Name", "Client Email",
                "Center", "Space", "Type",
                "Start", "End", "Duration (h)",
                "Status", "Total Price (MAD)"
            });

            for (Booking b : bookings) {
                long hours = java.time.Duration.between(b.getStartDateTime(), b.getEndDateTime()).toHours();
                csvWriter.writeNext(new String[]{
                    b.getId().toString(),
                    b.getUser().getFullName(),
                    b.getUser().getEmail(),
                    b.getSpace().getCenter().getName(),
                    b.getSpace().getName(),
                    b.getSpace().getType().toString(),
                    b.getStartDateTime().toString(),
                    b.getEndDateTime().toString(),
                    String.valueOf(hours),
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
