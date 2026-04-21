const connectionString = process.env.SPRING_MONGODB_URI || process.env.MONGO_URI;

if (!connectionString) {
  throw new Error('Set SPRING_MONGODB_URI or MONGO_URI before running this script.');
}

const dbName = 'healthcare_payments';
const collectionName = 'payments';
const now = new Date();

const client = new Mongo(connectionString);
const db = client.getDB(dbName);
const payments = db.getCollection(collectionName);

const testPayment = {
  consultationId: 'test-consultation-001',
  patientId: 'patient-1',
  doctorId: 'doctor-1',
  amount: 50,
  currency: 'USD',
  status: 'PENDING',
  paymentMethod: 'STRIPE',
  stripePaymentIntentId: 'pi_test_payment_intent_001',
  description: 'Test consultation payment inserted by script',
  createdAt: now,
  paidAt: null,
  receiptUrl: null,
  failureReason: null,
  refundRequested: false,
  refundId: null,
  transactionId: null,
};

const result = payments.insertOne(testPayment);
printjson({
  success: true,
  insertedId: result.insertedId,
  database: dbName,
  collection: collectionName,
  document: testPayment,
});
