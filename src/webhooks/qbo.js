// webhooks/qbo.js
router.post('/webhook', async (req, res) => {
  const signature = req.headers['intuit-signature'];
  const payload = req.body;
  
  // Verify webhook signature
  if (!verifyWebhookSignature(signature, payload)) {
    return res.status(401).send('Unauthorized');
  }
  
  // Process webhook events
  for (const event of payload.eventNotifications) {
    switch(event.dataChangeEvent.entities[0].name) {
      case 'Invoice':
        await processInvoiceUpdate(event);
        break;
      case 'Payment':
        await processPaymentUpdate(event);
        break;
      case 'Customer':
        await processCustomerUpdate(event);
        break;
    }
  }
  
  res.status(200).send('OK');
});
