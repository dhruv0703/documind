package com.dhruv.documind.service.impl;

import java.io.IOException;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.dhruv.documind.exception.DocumentProcessingException;
import com.dhruv.documind.service.PdfTextExtractorService;

@Service
public class PdfTextExtractorServiceImpl implements PdfTextExtractorService {

    @Override
    public String extractText(MultipartFile file) {
        try (PDDocument document = Loader.loadPDF(file.getBytes())) {
            if (document.isEncrypted()) {
                throw new DocumentProcessingException("Encrypted PDFs are not supported");
            }

            PDFTextStripper stripper = new PDFTextStripper();
            stripper.setSortByPosition(true);
            String text = stripper.getText(document);
            if (text == null || text.isBlank()) {
                throw new DocumentProcessingException("No readable text could be extracted from this PDF");
            }
            return text;
        } catch (DocumentProcessingException ex) {
            throw ex;
        } catch (IOException ex) {
            throw new DocumentProcessingException("Uploaded PDF is unreadable or corrupted");
        }
    }
}
