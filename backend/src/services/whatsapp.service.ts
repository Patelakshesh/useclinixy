export const sendWhatsAppMessage = async (to: string, message: string) => {
  const token = process.env.WHATSAPP_API_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  // Format phone number: remove any non-numeric characters
  const formattedTo = to.replace(/\D/g, '');

  if (!token || !phoneNumberId || token.includes('your_meta')) {
    console.log('\n======================================================');
    console.log(`📱 [SIMULATED WHATSAPP MESSAGE] To: ${formattedTo}`);
    console.log(`💬 Message: "${message}"`);
    console.log('⚠️  Note: Real message skipped because WHATSAPP_API_TOKEN is not configured.');
    console.log('======================================================\n');
    return true; // Return true to simulate success
  }

  try {
    const response = await fetch(`https://graph.facebook.com/v17.0/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: formattedTo,
        type: 'text',
        text: {
          preview_url: false,
          body: message
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('WhatsApp API Error Response:', data);
      throw new Error(data.error?.message || 'Failed to send WhatsApp message');
    }

    console.log(`WhatsApp message sent successfully to ${formattedTo}`);
    return true;
  } catch (error) {
    console.error('WhatsApp Service Error:', error);
    return false; // Don't throw to prevent crashing the main booking flow
  }
};
