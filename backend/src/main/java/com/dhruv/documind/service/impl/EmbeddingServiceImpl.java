package com.dhruv.documind.service.impl;

import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeansException;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.stereotype.Service;

import com.dhruv.documind.config.AppProperties;
import com.dhruv.documind.exception.DocumentProcessingException;
import com.dhruv.documind.service.EmbeddingService;

@Service
public class EmbeddingServiceImpl implements EmbeddingService {

    private static final Logger log = LoggerFactory.getLogger(EmbeddingServiceImpl.class);

    private final AppProperties appProperties;
    private final EmbeddingModel embeddingModel;

    public EmbeddingServiceImpl(AppProperties appProperties, ObjectProvider<EmbeddingModel> embeddingModelProvider) {
        this.appProperties = appProperties;
        this.embeddingModel = resolveEmbeddingModel(embeddingModelProvider);
    }

    @Override
    public List<Double> embed(String text) {
        EmbeddingModel model = requireEmbeddingModel();
        try {
            return toDoubleList(model.embed(text));
        } catch (RuntimeException ex) {
            log.error("Embedding generation failed for a single chunk", ex);
            throw new DocumentProcessingException("Failed to generate embeddings from OpenAI");
        }
    }

    @Override
    public List<List<Double>> embedAll(List<String> chunks) {
        EmbeddingModel model = requireEmbeddingModel();
        try {
            return model.embed(chunks).stream()
                    .map(this::toDoubleList)
                    .toList();
        } catch (RuntimeException ex) {
            log.error("Embedding generation failed for {} chunks", chunks.size(), ex);
            throw new DocumentProcessingException("Failed to generate embeddings from OpenAI");
        }
    }

    private EmbeddingModel requireEmbeddingModel() {
        if (!appProperties.getAi().getEmbeddings().isEnabled()) {
            throw new DocumentProcessingException("Embeddings are disabled for the current environment");
        }
        if (embeddingModel == null) {
            throw new DocumentProcessingException("Embedding model is unavailable because no OpenAI API key is configured");
        }
        return embeddingModel;
    }

    private EmbeddingModel resolveEmbeddingModel(ObjectProvider<EmbeddingModel> embeddingModelProvider) {
        try {
            return embeddingModelProvider.getIfAvailable();
        } catch (BeansException ex) {
            if (!appProperties.getAi().getEmbeddings().isEnabled()) {
                log.warn("Embedding model unavailable while embeddings are disabled; continuing without OpenAI embeddings");
                return null;
            }
            throw ex;
        }
    }

    private List<Double> toDoubleList(float[] values) {
        List<Double> result = new ArrayList<>(values.length);
        for (float value : values) {
            result.add((double) value);
        }
        return result;
    }
}
