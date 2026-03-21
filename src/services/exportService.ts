import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, ImageRun, Table, TableRow, TableCell, WidthType, BorderStyle } from 'docx';
import { saveAs } from 'file-saver';

export const exportToPDF = async (title: string, content: any[], type: 'book' | 'puzzle' | 'trivia' | 'coloring') => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'letter'
  });
  let y = 20;
  const margin = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const contentWidth = pageWidth - (margin * 2);

  doc.setFontSize(22);
  doc.text(title, margin, y);
  y += 20;

  if (type === 'book' || type === 'coloring') {
    for (const [index, item] of content.entries()) {
      if (index > 0) {
        doc.addPage();
        y = 20;
      }
      doc.setFontSize(16);
      doc.text(`Page ${index + 1}: ${item.title || 'Untitled'}`, margin, y);
      y += 10;

      if (item.imageUrl) {
        try {
          // Calculate dimensions to fit 
          const imgWidth = contentWidth;
          const imgHeight = (imgWidth * 4) / 3; // 3:4 ratio
          
          if (y + imgHeight > pageHeight - margin) {
            doc.addPage();
            y = 20;
          }

          doc.addImage(item.imageUrl, 'PNG', margin, y, imgWidth, imgHeight);
          y += imgHeight + 10;
        } catch (e) {
          console.error("Error adding image to PDF:", e);
        }
      }

      doc.setFontSize(12);
      const splitDescription = doc.splitTextToSize(item.description || '', contentWidth);
      
      if (y + (splitDescription.length * 7) > pageHeight - margin) {
        doc.addPage();
        y = 20;
      }

      doc.text(splitDescription, margin, y);
      y += (splitDescription.length * 7) + 10;

      if (item.content) {
        const splitContent = doc.splitTextToSize(item.content, contentWidth);
        if (y + (splitContent.length * 7) > pageHeight - margin) {
          doc.addPage();
          y = 20;
        }
        doc.text(splitContent, margin, y);
        y += (splitContent.length * 7) + 15;
      }
    }
  } else if (type === 'trivia') {
    content.forEach((item, index) => {
      if (y > pageHeight - 40) {
        doc.addPage();
        y = 20;
      }
      doc.setFontSize(14);
      doc.text(`${index + 1}. ${item.question}`, margin, y);
      y += 10;
      doc.setFontSize(12);
      if (item.options) {
        item.options.forEach((opt: string, i: number) => {
          doc.text(`${String.fromCharCode(65 + i)}) ${opt}`, margin + 10, y);
          y += 7;
        });
      }
      y += 10;
    });

    doc.addPage();
    y = 20;
    doc.setFontSize(18);
    doc.text('Answer Key', margin, y);
    y += 15;
    doc.setFontSize(12);
    content.forEach((item, index) => {
      if (y > pageHeight - margin) {
        doc.addPage();
        y = 20;
      }
      doc.text(`${index + 1}: ${item.answer} - ${item.explanation}`, margin, y);
      y += 10;
    });
  } else if (type === 'puzzle') {
    content.forEach((item, index) => {
      if (index > 0) {
        doc.addPage();
      }
      y = 20;
      doc.setFontSize(22);
      doc.text(item.title || `Puzzle ${index + 1}`, margin, y);
      y += 15;

      if (item.description) {
        doc.setFontSize(12);
        doc.text(item.description, margin, y);
        y += 10;
      }

      if (item.grid) {
        const grid = item.grid;
        const cellSize = contentWidth / grid[0].length;
        const startX = margin;
        const startY = y;

        doc.setFontSize(10);
        grid.forEach((row: any[], rowIndex: number) => {
          row.forEach((cell: any, colIndex: number) => {
            const x = startX + colIndex * cellSize;
            const yy = startY + rowIndex * cellSize;
            doc.rect(x, yy, cellSize, cellSize);
            if (cell !== null) {
              doc.text(String(cell), x + cellSize / 2, yy + cellSize / 2 + 3, { align: 'center' });
            }
          });
        });
        y += grid.length * cellSize + 20;
      }

      if (item.words) {
        doc.setFontSize(12);
        doc.text('Words to find:', margin, y);
        y += 10;
        const words = Array.isArray(item.words) ? item.words.join(', ') : item.words;
        const splitWords = doc.splitTextToSize(words, contentWidth);
        doc.text(splitWords, margin, y);
      }
    });
  }

  doc.save(`${title.replace(/\s+/g, '_')}.pdf`);
};

export const exportToDOCX = async (title: string, content: any[], type: 'book' | 'puzzle' | 'trivia' | 'coloring') => {
  const children: (Paragraph | Table)[] = [
    new Paragraph({
      text: title,
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    }),
  ];

  if (type === 'book' || type === 'coloring') {
    content.forEach((item, index) => {
      children.push(
        new Paragraph({
          text: `Page ${index + 1}: ${item.title || 'Untitled'}`,
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 400, after: 200 },
          pageBreakBefore: index > 0,
        }),
        new Paragraph({
          children: [new TextRun({ text: item.description || '', italics: true })],
          spacing: { after: 200 },
        })
      );

      if (item.imageUrl) {
        try {
          const base64Data = item.imageUrl.split(',')[1];
          const binaryString = window.atob(base64Data);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }

          children.push(
            new Paragraph({
              children: [
                new ImageRun({
                  data: bytes,
                  transformation: {
                    width: 400,
                    height: 533, // 3:4 ratio
                  },
                } as any),
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 },
            })
          );
        } catch (e) {
          console.error("Error adding image to DOCX:", e);
        }
      }

      if (item.content) {
        children.push(
          new Paragraph({
            text: item.content,
            spacing: { after: 400 },
          })
        );
      }
    });
  } else if (type === 'trivia') {
    content.forEach((item, index) => {
      children.push(
        new Paragraph({
          text: `${index + 1}. ${item.question}`,
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 200, after: 100 },
        })
      );
      item.options.forEach((opt: string, i: number) => {
        children.push(
          new Paragraph({
            text: `${String.fromCharCode(65 + i)}) ${opt}`,
            indent: { left: 720 },
          })
        );
      });
    });

    children.push(
      new Paragraph({
        text: "Answer Key",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 800, after: 400 },
        pageBreakBefore: true,
      })
    );

    content.forEach((item, index) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: `${index + 1}: `, bold: true }),
            new TextRun({ text: `${item.answer} - ${item.explanation}` }),
          ],
          spacing: { after: 200 },
        })
      );
    });
  } else if (type === 'puzzle') {
    content.forEach((item, index) => {
      children.push(
        new Paragraph({
          text: item.title || `Puzzle ${index + 1}`,
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 400, after: 200 },
          pageBreakBefore: index > 0,
        })
      );

      if (item.description) {
        children.push(
          new Paragraph({
            text: item.description,
            spacing: { after: 200 },
          })
        );
      }

      if (item.content) {
        children.push(
          new Paragraph({
            text: item.content,
            spacing: { after: 400 },
          })
        );
      }

      if (item.grid) {
        children.push(
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: item.grid.map((row: any[]) => 
              new TableRow({
                children: row.map((cell: any) => 
                  new TableCell({
                    children: [new Paragraph({ 
                      text: cell !== null ? String(cell) : "", 
                      alignment: AlignmentType.CENTER 
                    })],
                    borders: {
                      top: { style: BorderStyle.SINGLE, size: 1 },
                      bottom: { style: BorderStyle.SINGLE, size: 1 },
                      left: { style: BorderStyle.SINGLE, size: 1 },
                      right: { style: BorderStyle.SINGLE, size: 1 },
                    }
                  })
                )
              })
            ),
          })
        );
      }

      if (item.words) {
        children.push(
          new Paragraph({
            text: `Words: ${Array.isArray(item.words) ? item.words.join(', ') : item.words}`,
            spacing: { after: 400 },
          })
        );
      }
    });
  }

  const doc = new Document({
    sections: [{
      properties: {},
      children: children,
    }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${title.replace(/\s+/g, '_')}.docx`);
};
