import QRCode from 'qrcode';

export async function generateQrDataUrl(text: string): Promise<string> {
  try {
    return await QRCode.toDataURL(text, {
      width: 400,
      margin: 2,
      color: {
        dark: '#020617', // Slate 950
        light: '#10b981' // Emerald 500
      },
      errorCorrectionLevel: 'H'
    });
  } catch (err) {
    console.error('Failed to generate QR code', err);
    // Fallback: standard black on white
    return await QRCode.toDataURL(text, {
      width: 400,
      margin: 2
    });
  }
}
