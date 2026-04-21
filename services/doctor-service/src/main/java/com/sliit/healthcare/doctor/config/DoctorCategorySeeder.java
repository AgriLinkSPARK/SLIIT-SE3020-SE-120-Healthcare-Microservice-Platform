package com.sliit.healthcare.doctor.config;

import java.time.Instant;
import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.sliit.healthcare.doctor.model.DoctorCategory;
import com.sliit.healthcare.doctor.repository.DoctorCategoryRepository;

@Component
public class DoctorCategorySeeder implements CommandLineRunner {

    private record CategorySeed(String id, String name, String description, int order) {
    }

    private static final List<CategorySeed> DEFAULT_CATEGORIES = List.of(
            new CategorySeed("gynecologist", "Gynecologist",
                    "Specializes in women's reproductive health (menstruation, pregnancy, fertility issues)", 1),
            new CategorySeed("cardiologist", "Cardiologist", "Treats heart and blood vessel conditions", 2),
            new CategorySeed("dermatologist", "Dermatologist", "Focuses on skin, hair, and nail issues", 3),
            new CategorySeed("pediatrician", "Pediatrician", "Cares for infants, children, and adolescents", 4),
            new CategorySeed("orthopedic-surgeon", "Orthopedic Surgeon", "Treats bones, joints, and muscles", 5),
            new CategorySeed("neurologist", "Neurologist", "Deals with the brain, spinal cord, and nerves", 6),
            new CategorySeed("psychiatrist", "Psychiatrist", "Treats mental health disorders", 7),
            new CategorySeed("endocrinologist", "Endocrinologist",
                    "Manages hormone-related conditions (like diabetes or thyroid problems)", 8),
            new CategorySeed("gastroenterologist", "Gastroenterologist", "Focuses on the digestive system", 9),
            new CategorySeed("ophthalmologist", "Ophthalmologist", "Specializes in eye health and surgery", 10),
            new CategorySeed("ent-specialist", "ENT Specialist (Otolaryngologist)",
                    "Treats ear, nose, and throat issues", 11),
            new CategorySeed("urologist", "Urologist", "Focuses on urinary tract and male reproductive system", 12),
            new CategorySeed("oncologist", "Oncologist", "Specializes in cancer treatment", 13),
            new CategorySeed("general-practitioner", "General Practitioner (GP)",
                    "Provides overall primary healthcare", 14),
            new CategorySeed("family-physician", "Family Physician (Family Medicine Specialist)",
                    "Provides continuous, comprehensive primary care for individuals and families", 15));

    private final DoctorCategoryRepository doctorCategoryRepository;

    public DoctorCategorySeeder(DoctorCategoryRepository doctorCategoryRepository) {
        this.doctorCategoryRepository = doctorCategoryRepository;
    }

    @Override
    public void run(String... args) {
        Instant now = Instant.now();
        DEFAULT_CATEGORIES.forEach(seed -> {
            DoctorCategory category = doctorCategoryRepository.findById(seed.id())
                    .orElse(DoctorCategory.builder().id(seed.id()).createdAt(now).build());
            category.setName(seed.name());
            category.setDescription(seed.description());
            category.setDisplayOrder(seed.order());
            category.setUpdatedAt(now);
            doctorCategoryRepository.save(category);
        });
    }
}
