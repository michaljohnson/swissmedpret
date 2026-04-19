package com.swissmedpreter.model;

public record LexiconEntry(
        String term,
        String label,
        String imageUrl,
        String description
) {}
