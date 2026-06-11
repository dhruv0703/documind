package com.dhruv.documind.service;

import java.util.List;

public interface EmbeddingService {

    List<Double> embed(String text);

    List<List<Double>> embedAll(List<String> chunks);
}
