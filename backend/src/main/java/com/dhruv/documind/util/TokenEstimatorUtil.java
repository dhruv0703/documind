package com.dhruv.documind.util;

import org.springframework.stereotype.Component;

@Component
public class TokenEstimatorUtil {

    public int estimate(String text) {
        if (text == null || text.isBlank()) {
            return 0;
        }

        int wordCount = text.trim().split("\\s+").length;
        return Math.max(1, (int) Math.ceil(wordCount * 1.3));
    }
}
