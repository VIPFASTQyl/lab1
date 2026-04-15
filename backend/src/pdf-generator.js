import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import crypto from 'crypto';

// Generate unique one-time-use token for QR code
export function generateOneTimeToken() {
  return crypto.randomBytes(16).toString('hex');
}

// Generate PDF ticket
export async function generateTicketPDF(ticket, ticketNumber, totalTickets) {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 0
      });

      // Generate QR code image
      const qrCodeImage = await QRCode.toDataURL(ticket.oneTimeToken);

      // Red gradient background simulation with colored rectangle
      doc.rect(0, 0, 595, 842).fill('#c41e3a');

      // White container
      doc.rect(20, 50, 555, 700).fill('white');

      // Black header
      doc.rect(20, 50, 555, 50).fill('black');
      doc.fill('white').fontSize(12).font('Helvetica-Bold').text(
        'KEEP ME SAFE! I AM YOUR TICKET!',
        30,
        65,
        { width: 535, align: 'center' }
      );

      // Logo and title
      doc.fill('black').fontSize(24).font('Helvetica-Bold').text(
        'MADVERSE',
        40,
        120,
        { width: 515, align: 'center' }
      );

      doc.fontSize(10).font('Helvetica').text(
        `Ticket ${ticketNumber} of ${totalTickets}`,
        40,
        150,
        { width: 515, align: 'center' }
      );

      // QR Code
      doc.image(qrCodeImage, 200, 180, { width: 195, height: 195 });

      // Ticket details
      doc.fill('black').fontSize(14).font('Helvetica-Bold').text(
        ticket.ticketType,
        40,
        400,
        { width: 515, align: 'center' }
      );

      doc.fontSize(12).font('Helvetica').text(
        ticket.ticketCode,
        40,
        425,
        { width: 515, align: 'center' }
      );

      // Ticket code for validation
      doc.fontSize(8).font('Helvetica').fill('#666').text(
        `QR Code: ${ticket.oneTimeToken.substring(0, 16)}...`,
        40,
        445,
        { width: 515, align: 'center' }
      );

      // Event details
      doc.fill('black').fontSize(12).font('Helvetica-Bold').text(
        ticket.eventTitle,
        40,
        475,
        { width: 515, align: 'center' }
      );

      // Ticket holder section
      doc.moveTo(40, 505).lineTo(555, 505).stroke('#ddd');
      doc.fill('#666').fontSize(8).font('Helvetica').text(
        'TICKET HOLDER',
        40,
        515
      );
      doc.fill('black').fontSize(11).font('Helvetica-Bold').text(
        ticket.holderName,
        40,
        530
      );

      // Instructions
      doc.fontSize(9).font('Helvetica-Bold').fill('black').text(
        'INSTRUCTIONS:',
        40,
        570
      );
      doc.fontSize(8).font('Helvetica').text(
        '• Keep this ticket safe\n' +
        '• Show QR code at entrance\n' +
        '• Staff will scan for ONE-TIME check-in\n' +
        '• Cannot be used twice',
        40,
        590,
        { width: 515, lineGap: 5 }
      );

      // Footer
      doc.fontSize(7).fill('#999').text(
        '© 2026 Madverse TicketApp | Do not share this ticket',
        40,
        780,
        { width: 515, align: 'center' }
      );

      resolve(doc);
    } catch (error) {
      reject(error);
    }
  });
}

// Generate multiple PDF tickets in one document
export async function generateTicketsPDF(tickets, eventTitle, holderName) {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 40
      });

      // Title page
      doc.fontSize(28).font('Helvetica-Bold').text('🎫 MADVERSE', { align: 'center' });
      doc.fontSize(10).font('Helvetica').text('Ticket Confirmation', { align: 'center' });
      doc.moveDown();

      doc.fontSize(14).font('Helvetica-Bold').text(`Event: ${eventTitle}`);
      doc.fontSize(12).font('Helvetica').text(`Holder: ${holderName}`);
      doc.fontSize(12).text(`Tickets: ${tickets.length}`);
      doc.moveDown();

      doc.fontSize(10).fill('#666').text(
        '⚠️  IMPORTANT: Each QR code can only be scanned ONCE. Keep your tickets safe.'
      );

      doc.addPage();

      // Generate each ticket on separate page
      for (let i = 0; i < tickets.length; i++) {
        const ticket = tickets[i];
        const qrCodeImage = await QRCode.toDataURL(ticket.oneTimeToken);

        // Header
        doc.rect(0, 0, 595, 60).fill('#c41e3a');
        doc.fill('white').fontSize(11).font('Helvetica-Bold').text(
          'KEEP ME SAFE! I AM YOUR TICKET!',
          20,
          20,
          { width: 555, align: 'center' }
        );

        // Content
        doc.fill('black').fontSize(18).font('Helvetica-Bold').text(
          'MADVERSE',
          40,
          80,
          { width: 515, align: 'center' }
        );

        doc.fontSize(9).text(`Ticket ${i + 1} of ${tickets.length}`, 40, 105, { align: 'center' });

        // QR Code
        doc.image(qrCodeImage, 175, 135, { width: 245, height: 245 });

        // Details
        doc.fontSize(12).font('Helvetica-Bold').text(
          ticket.ticketType,
          40,
          400,
          { width: 515, align: 'center' }
        );

        doc.fontSize(11).text(
          ticket.ticketCode,
          40,
          425,
          { width: 515, align: 'center' }
        );

        doc.fontSize(8).fill('#999').text(
          ticket.eventTitle,
          40,
          450,
          { width: 515, align: 'center' }
        );

        doc.moveTo(40, 475).lineTo(555, 475).stroke('#ddd');
        doc.fill('#666').fontSize(8).font('Helvetica').text('TICKET HOLDER', 40, 485);
        doc.fill('black').fontSize(10).font('Helvetica-Bold').text(holderName, 40, 500);

        // Instructions
        doc.fontSize(9).font('Helvetica-Bold').fill('black').text('INSTRUCTIONS:', 40, 540);
        doc.fontSize(8).font('Helvetica').text(
          '✓ Screenshot or print this ticket\n' +
          '✓ Show QR code at entrance\n' +
          '✓ Staff will scan (ONE-TIME USE)\n' +
          '✓ Keep safe - cannot be re-used',
          40,
          560,
          { lineGap: 4 }
        );

        if (i < tickets.length - 1) {
          doc.addPage();
        }
      }

      resolve(doc);
    } catch (error) {
      reject(error);
    }
  });
}
