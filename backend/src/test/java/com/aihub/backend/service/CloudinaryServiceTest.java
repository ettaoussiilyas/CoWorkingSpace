package com.aihub.backend.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.Uploader;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.io.IOException;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CloudinaryServiceTest {

    @Mock
    private Cloudinary cloudinary;

    @InjectMocks
    private CloudinaryService cloudinaryService;

    private MockMultipartFile mockFile;
    private Uploader mockUploader;

    @BeforeEach
    void setUp() {
        mockFile = new MockMultipartFile("file", "test.jpg", "image/jpeg", "test content".getBytes());
        mockUploader = mock(Uploader.class);
        when(cloudinary.uploader()).thenReturn(mockUploader);
    }

    @Test
    void uploadImage_ShouldReturnUrl_WhenUploadSuccessful() throws IOException {
        // Arrange
        Map<String, Object> uploadResult = Map.of("url", "http://cloudinary.com/test.jpg");
        when(mockUploader.upload(any(byte[].class), anyMap())).thenReturn(uploadResult);

        // Act
        String result = cloudinaryService.uploadImage(mockFile);

        // Assert
        assertThat(result).isEqualTo("http://cloudinary.com/test.jpg");
    }

    @Test
    void uploadImage_ShouldThrowException_WhenUploadFails() throws IOException {
        // Arrange
        when(mockUploader.upload(any(byte[].class), anyMap())).thenThrow(new IOException("Upload failed"));

        // Act & Assert
        assertThatThrownBy(() -> cloudinaryService.uploadImage(mockFile))
                .isInstanceOf(IOException.class)
                .hasMessage("Upload failed");
    }
}
