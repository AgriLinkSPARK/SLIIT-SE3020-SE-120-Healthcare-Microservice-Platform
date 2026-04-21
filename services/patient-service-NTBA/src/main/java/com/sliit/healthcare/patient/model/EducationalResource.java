package com.sliit.healthcare.patient.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "educational_resources")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EducationalResource {

    @Id
    private String id;

    @Field
    private String title;

    @Field
    private ResourceType type;

    @Field
    private String content;

    @Field
    private List<String> tags;

    @Field("related_conditions")
    private List<String> relatedConditions;

    @Field("published_at")
    private LocalDateTime publishedAt;

    @Field
    private String author;

    public enum ResourceType {
        ARTICLE, VIDEO, DICTIONARY, JOURNAL
    }
}
