package com.sliit.healthcare.patient.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.util.List;

@Document(collection = "medical_terms")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MedicalTerm {

    @Id
    private String id;

    @Field
    private String term;

    @Field
    private String definition;

    @Field("related_terms")
    private List<String> relatedTerms;
}
