// src/utils/pdfUtils.ts

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const generatePDF = async (elementId: string, fileName: string = 'evaluation-results.pdf', evaluationInfo?: {
  title: string;
  evaluatedName: string;
  evaluatedDepartment: string;
}) => {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error('Element not found');
    }

    // Optimized PDF settings
    const pdf = new jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: 'a4',
      compress: true // Enable compression
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    let currentY = margin;

    // Add header with vector text instead of images
    if (evaluationInfo) {
      pdf.setFontSize(20);
      pdf.setTextColor(0, 0, 0);
      pdf.text(evaluationInfo.title, pageWidth / 2, currentY, { align: 'center' });
      
      currentY += 15;
      pdf.setFontSize(14);
      pdf.text('Evaluado:', margin, currentY);
      pdf.setFont(undefined, 'normal');
      pdf.text(evaluationInfo.evaluatedName, margin + 35, currentY);
      
      currentY += 10;
      pdf.setFont(undefined, 'bold');
      pdf.text('Departamento:', margin, currentY);
      pdf.setFont(undefined, 'normal');
      pdf.text(evaluationInfo.evaluatedDepartment, margin + 45, currentY);
      
      currentY += 10;
      pdf.line(margin, currentY, pageWidth - margin, currentY);
      currentY += 10;
    }

    // Optimized canvas settings
    const canvasOptions = {
      scale: 1.5, // Reduced from 2 to 1.5 for better balance of quality vs size
      logging: false,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      imageTimeout: 15000,
      removeContainer: true,
      foreignObjectRendering: false // Disable for better compatibility
    };

    // Function to optimize image data
    const optimizeImageData = (canvas: HTMLCanvasElement): string => {
      return canvas.toDataURL('image/jpeg', 0.85); // Use JPEG with 85% quality
    };

    // Process chart
    const chartSection = element.children[0];
    const chartCanvas = await html2canvas(chartSection as HTMLElement, canvasOptions);
    const chartImgWidth = pageWidth - (2 * margin);
    const chartImgHeight = (chartCanvas.height * chartImgWidth) / chartCanvas.width;
    const chartImgData = optimizeImageData(chartCanvas);
    
    pdf.addImage(chartImgData, 'JPEG', margin, currentY, chartImgWidth, chartImgHeight, '', 'FAST');
    currentY += chartImgHeight + 10;

    // Process criteria items
    const criteriaSection = element.children[1];
    const criteriaItems = Array.from(criteriaSection.querySelectorAll('.grid > div'));

    for (let i = 0; i < criteriaItems.length; i++) {
      if (i === 4 || (i > 4 && (currentY + 50 > pageHeight - margin))) {
        pdf.addPage();
        currentY = margin;
        
        // Add header to new page
        if (evaluationInfo) {
          pdf.setFontSize(12);
          pdf.setTextColor(128, 128, 128);
          pdf.text(`${evaluationInfo.title} - ${evaluationInfo.evaluatedName}`, pageWidth / 2, 10, { align: 'center' });
        }
      }

      const canvas = await html2canvas(criteriaItems[i] as HTMLElement, canvasOptions);
      const imgWidth = pageWidth - (2 * margin);
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const imgData = optimizeImageData(canvas);
      
      pdf.addImage(imgData, 'JPEG', margin, currentY, imgWidth, imgHeight, '', 'FAST');
      currentY += imgHeight + 10;
    }

    // Apply final compression
    const pdfOutput = pdf.output('arraybuffer');
    const compressedPdf = new Blob([pdfOutput], { type: 'application/pdf' });
    const url = URL.createObjectURL(compressedPdf);
    
    // Download optimized PDF
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);

  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};
