import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';

const generateGymQRCode = async () => {
  const gymAppUrl = 'http://localhost:5173/checkin';
  
  try {
    // Generate QR code as PNG
    const qrCodeBuffer = await QRCode.toBuffer(gymAppUrl, {
      type: 'png',
      width: 512,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'M'
    });

    // Save to qr-display folder
    const outputPath = path.join(__dirname, '../../../qr-display/gym-wall-qr.png');
    fs.writeFileSync(outputPath, qrCodeBuffer);
    
    console.log(`📱 QR Code saved to: ${outputPath}`);
    console.log(`🔗 QR Code URL: ${gymAppUrl}`);
    
    // Generate QR code as SVG for high quality printing
    const qrCodeSvg = await QRCode.toString(gymAppUrl, {
      type: 'svg',
      width: 512,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    
    const svgPath = path.join(__dirname, '../../../qr-display/gym-wall-qr.svg');
    fs.writeFileSync(svgPath, qrCodeSvg);
    console.log(`📄 High-quality SVG saved to: ${svgPath}`);
    
    const sizes = [256, 384, 768];
    for (const size of sizes) {
      const buffer = await QRCode.toBuffer(gymAppUrl, {
        type: 'png',
        width: size,
        margin: 2,
        color: { dark: '#000000', light: '#FFFFFF' }
      });
      
      const backupPath = path.join(__dirname, `../../../qr-display/gym-qr-${size}px.png`);
      fs.writeFileSync(backupPath, buffer);
      console.log(`📱 Backup QR (${size}px) saved to: ${backupPath}`);
    }
    
  } catch (error) {
    console.error('❌ Error generating QR code:', error);
  }
};

// Run if called directly
if (require.main === module) {
  generateGymQRCode();
}

export { generateGymQRCode };