import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import './PaymentHistory.css';
import useAuth from '../hooks/useAuth';
import { USER_ROLES } from '../utils/constants';


const resolveIdentity = (user, keys) => {
  const candidates = [
    ...keys.map((key) => user?.[key]),
    ...keys.map((key) => user?.user?.[key]),
  ];

  const value = candidates.find((item) => typeof item === 'string' && item.trim());
  return value || '';
};

const PaymentHistory = ({ patientId, status = null, showAll = false, role: roleOverride = null }) => {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState(status || 'ALL');
  const [selectedPayment, setSelectedPayment] = useState(null);

  const role = roleOverride || user?.role || USER_ROLES.PATIENT;
  const resolvedPatientId = useMemo(
    () => patientId || resolveIdentity(user, ['userId', 'patientId']),
    [patientId, user]
  );
  const resolvedDoctorId = useMemo(
    () => resolveIdentity(user, ['userId', 'doctorId']),
    [user]
  );

  useEffect(() => {
    fetchPayments();
  }, [resolvedPatientId, resolvedDoctorId, role, showAll, statusFilter]);

  const fetchPayments = async () => {
    setLoading(true);
    setError('');
    try {
      const effectiveStatus = statusFilter !== 'ALL' ? statusFilter : null;
      const isAdmin = role === USER_ROLES.ADMIN;
      const isDoctor = role === USER_ROLES.DOCTOR;
      const isPatient = role === USER_ROLES.PATIENT || (!isAdmin && !isDoctor);
      let url = '/api/payments';

      if (isPatient) {
        if (!resolvedPatientId) {
          setPayments([]);
          setError('Patient ID is required to fetch payment history');
          setLoading(false);
          return;
        }

        url = effectiveStatus
          ? `/api/payments/history/${resolvedPatientId}?status=${effectiveStatus}`
          : `/api/payments/patient/${resolvedPatientId}`;
      } else if (isDoctor) {
        if (!resolvedDoctorId) {
          setPayments([]);
          setError('Doctor ID is required to fetch payment history');
          setLoading(false);
          return;
        }

        url = effectiveStatus
          ? `/api/payments/doctor/${resolvedDoctorId}?status=${effectiveStatus}`
          : `/api/payments/doctor/${resolvedDoctorId}`;
      } else if (effectiveStatus || showAll) {
        url = effectiveStatus
          ? `/api/payments?status=${effectiveStatus}`
          : '/api/payments';
      }

      const response = await axios.get(url);
      
      if (response.data.success) {
        setPayments(response.data.data || []);
      } else {
        setError(response.data.message || 'Failed to fetch payments');
      }
    } catch (err) {
      console.error('Error fetching payments:', err);
      setError(err.response?.data?.message || 'Error fetching payment history');
    } finally {
      setLoading(false);
    }
  };

  const downloadReceiptPdf = (payment) => {
    const doc = new jsPDF();
    const createdAt = payment.createdAt ? formatDate(payment.createdAt) : '-';
    const paidAt = payment.paidAt ? formatDate(payment.paidAt) : '-';
    const currency = payment.currency || 'USD';
    const amount = formatCurrency(payment.amount, currency);
    const method = normalizePaymentMethod(payment.paymentMethod);
    const statusLabel = payment.status || '-';

    doc.setFillColor(15, 94, 168);
    doc.rect(0, 0, 210, 34, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.text('Healthcare Payment Receipt', 14, 20);
    doc.setFontSize(10);
    doc.text('Official transaction acknowledgement', 14, 27);

    doc.setTextColor(30, 41, 59);

    doc.setFontSize(12);
    doc.text('Receipt Details', 14, 44);
    doc.setFontSize(11);
    doc.text(`Receipt ID: ${payment.id || '-'}`, 14, 52);
    doc.text(`Created At: ${createdAt}`, 14, 59);
    doc.text(`Paid At: ${paidAt}`, 14, 66);
    doc.text(`Status: ${statusLabel}`, 14, 73);

    doc.setFontSize(12);
    doc.text('Patient & Doctor Details', 14, 86);
    doc.setFontSize(11);
    doc.text(`Patient ID: ${payment.patientId || resolvedPatientId || '-'}`, 14, 94);
    doc.text(`Doctor: ${payment.doctorId || '-'}`, 14, 101);
    doc.text(`Consultation ID: ${payment.consultationId || '-'}`, 14, 108);
    doc.text(`Customer Name: ${payment.customerName || '-'}`, 14, 115);
    doc.text(`Customer Email: ${payment.customerEmail || '-'}`, 14, 122);

    doc.setFontSize(12);
    doc.text('Payment Summary', 14, 136);
    doc.setFontSize(11);
    doc.text(`Amount: ${amount}`, 14, 144);
    doc.text(`Currency: ${currency}`, 14, 151);
    doc.text(`Payment Method: ${method}`, 14, 158);
    doc.text(`Transaction ID: ${payment.transactionId || '-'}`, 14, 165);
    doc.text(`Refund Requested: ${payment.refundRequested ? 'Yes' : 'No'}`, 14, 172);
    doc.text(`Refund ID: ${payment.refundId || '-'}`, 14, 179);

    if (payment.failureReason) {
      doc.setFontSize(12);
      doc.text('Failure Reason', 14, 191);
      doc.setFontSize(10);
      doc.text(doc.splitTextToSize(payment.failureReason, 180), 14, 198);
    }

    if (payment.description) {
      doc.setFontSize(12);
      doc.text('Description', 14, 213);
      doc.setFontSize(10);
      doc.text(doc.splitTextToSize(payment.description, 180), 14, 220);
    }

    doc.setFontSize(10);
    doc.text('Thank you for using Healthcare Payment Service.', 14, 282);

    doc.save(`payment-receipt-${payment.id || 'unknown'}.pdf`);
  };

  const totalAmount = payments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
  const successfulCount = payments.filter((payment) => payment.status === 'SUCCEEDED').length;

  const handleRefund = async (paymentId) => {
    const reason = prompt('Enter refund reason:');
    if (!reason) return;

    try {
      const response = await axios.post(
        `/api/payments/${paymentId}/refund`,
        {
          reason: 'requested_by_customer',
          notes: reason,
        }
      );

      if (response.data.success) {
        alert('Refund request processed successfully');
        fetchPayments();
      } else {
        alert('Refund failed: ' + response.data.message);
      }
    } catch (err) {
      alert('Error processing refund: ' + err.message);
    }
  };

  const getStatusBadgeClass = (status) => {
    const normalizedStatus = (status || '').toUpperCase();
    switch (normalizedStatus) {
      case 'SUCCEEDED':
        return 'badge-success';
      case 'PENDING':
        return 'badge-pending';
      case 'FAILED':
        return 'badge-danger';
      case 'REFUNDED':
      case 'PARTIAL_REFUND':
        return 'badge-info';
      default:
        return 'badge-secondary';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const normalizePaymentMethod = (method) => {
    if (!method) return '-';
    return method
      .toString()
      .toLowerCase()
      .split('_')
      .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
      .join(' ');
  };

  const formatCurrency = (value, currency = 'USD') => {
    const parsed = Number(value);
    if (Number.isNaN(parsed)) {
      return '-';
    }

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(parsed);
  };

  if (loading) {
    return <div className="loading">Loading payment history...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (payments.length === 0) {
    return <div className="no-data">No payments found</div>;
  }

  return (
    <div className="payment-history-container">
      <div className="history-header">
        <h2>
          {role === USER_ROLES.DOCTOR ? 'Doctor Payment History' : role === USER_ROLES.ADMIN ? 'All Payment History' : 'Payment History'}
        </h2>
        <div className="history-actions">
          <select
            className="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All statuses</option>
            <option value="SUCCEEDED">Succeeded</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
            <option value="REFUNDED">Refunded</option>
          </select>
          <button type="button" className="btn-refresh" onClick={fetchPayments}>
            Refresh
          </button>
        </div>
      </div>

      <div className="history-summary-cards">
        <div className="history-metric">
          <span>Records</span>
          <strong>{payments.length}</strong>
        </div>
        <div className="history-metric">
          <span>Succeeded</span>
          <strong>{successfulCount}</strong>
        </div>
        <div className="history-metric">
          <span>Total Amount</span>
          <strong>${totalAmount.toFixed(2)}</strong>
        </div>
      </div>

      <div className="payments-table-wrapper">
        <table className="payments-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Doctor</th>
              <th>Consultation ID</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Method</th>
              <th>Transaction ID</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment.id}>
                <td>{formatDate(payment.createdAt)}</td>
                <td>{payment.doctorId || '-'}</td>
                <td>{payment.consultationId}</td>
                <td>{formatCurrency(payment.amount, payment.currency || 'USD')}</td>
                <td>
                  <span className={`badge ${getStatusBadgeClass(payment.status)}`}>
                    {payment.status}
                  </span>
                </td>
                <td>{normalizePaymentMethod(payment.paymentMethod)}</td>
                <td>{payment.transactionId || '-'}</td>
                <td>
                  <div className="actions">
                    <button
                      className="btn-details"
                      onClick={() => setSelectedPayment(payment)}
                      type="button"
                    >
                      View Details
                    </button>
                    <button
                      className="btn-receipt"
                      onClick={() => downloadReceiptPdf(payment)}
                      type="button"
                    >
                      Receipt PDF
                    </button>
                    {payment.status === 'SUCCEEDED' && (
                      <button
                        className="btn-refund"
                        onClick={() => handleRefund(payment.id)}
                      >
                        Refund
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="summary">
        <p>Filter: {statusFilter}</p>
      </div>

      {selectedPayment && (
        <div className="receipt-modal-backdrop" onClick={() => setSelectedPayment(null)}>
          <div className="receipt-modal" onClick={(event) => event.stopPropagation()}>
            <div className="receipt-modal-header">
              <div>
                <h3>Receipt Details</h3>
                <p>{selectedPayment.id}</p>
              </div>
              <button
                type="button"
                className="receipt-modal-close"
                onClick={() => setSelectedPayment(null)}
              >
                Close
              </button>
            </div>

            <div className="receipt-modal-grid">
              <div className="receipt-item"><span>Doctor</span><strong>{selectedPayment.doctorId || '-'}</strong></div>
              <div className="receipt-item"><span>Patient ID</span><strong>{selectedPayment.patientId || resolvedPatientId || '-'}</strong></div>
              <div className="receipt-item"><span>Consultation ID</span><strong>{selectedPayment.consultationId || '-'}</strong></div>
              <div className="receipt-item"><span>Status</span><strong>{selectedPayment.status || '-'}</strong></div>
              <div className="receipt-item"><span>Payment Method</span><strong>{normalizePaymentMethod(selectedPayment.paymentMethod)}</strong></div>
              <div className="receipt-item"><span>Amount</span><strong>{formatCurrency(selectedPayment.amount, selectedPayment.currency || 'USD')}</strong></div>
              <div className="receipt-item"><span>Created At</span><strong>{selectedPayment.createdAt ? formatDate(selectedPayment.createdAt) : '-'}</strong></div>
              <div className="receipt-item"><span>Paid At</span><strong>{selectedPayment.paidAt ? formatDate(selectedPayment.paidAt) : '-'}</strong></div>
              <div className="receipt-item"><span>Transaction ID</span><strong>{selectedPayment.transactionId || '-'}</strong></div>
              <div className="receipt-item"><span>Receipt URL</span><strong>{selectedPayment.receiptUrl || '-'}</strong></div>
            </div>

            <div className="receipt-notes">
              <h4>Description</h4>
              <p>{selectedPayment.description || '-'}</p>
              <h4>Failure Reason</h4>
              <p>{selectedPayment.failureReason || '-'}</p>
            </div>

            <div className="receipt-modal-footer">
              <button
                type="button"
                className="btn-receipt"
                onClick={() => downloadReceiptPdf(selectedPayment)}
              >
                Download PDF Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentHistory;
