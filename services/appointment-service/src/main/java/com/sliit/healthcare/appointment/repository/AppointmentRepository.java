package com.sliit.healthcare.appointment.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.sliit.healthcare.appointment.model.Appointment;
import com.sliit.healthcare.appointment.model.Appointment.AppointmentStatus;
import com.sliit.healthcare.appointment.model.Appointment.AppointmentType;

public interface AppointmentRepository extends MongoRepository<Appointment, String> {

        List<Appointment> findAllByOrderByAppointmentDateTimeDesc();

        List<Appointment> findByStatusOrderByAppointmentDateTimeDesc(AppointmentStatus status);

    List<Appointment> findByPatientIdOrderByAppointmentDateTimeDesc(String patientId);

        List<Appointment> findByDoctorIdOrderByAppointmentDateTimeDesc(String doctorId);

    List<Appointment> findBySpecialtyContainingIgnoreCaseAndStatusNotOrderByAppointmentDateTimeAsc(
            String specialty,
            AppointmentStatus status
    );

    List<Appointment> findBySpecialtyContainingIgnoreCaseAndTypeAndStatusNotOrderByAppointmentDateTimeAsc(
            String specialty,
            AppointmentType type,
            AppointmentStatus status
    );

        boolean existsByPatientIdAndSlotIdAndTypeAndStatusNot(
                        String patientId,
                        String slotId,
                        AppointmentType type,
                        AppointmentStatus status);

        long countBySlotIdAndTypeAndStatusNot(String slotId, AppointmentType type, AppointmentStatus status);
}
