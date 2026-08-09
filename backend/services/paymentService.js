const generateTransactionId = () => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `TXN-${timestamp}-${random}`;
};

class PaymentService {

  async processPayment(amount, currency = "USD", metadata = {}) {
    return {
      transactionId: generateTransactionId(),
      amount,
      currency,
      status: "Success",
      paymentMethod: "Mock",
      metadata,
      processedAt: new Date(),
    };
  }
}

module.exports = new PaymentService();
