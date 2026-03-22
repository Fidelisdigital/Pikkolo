import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, ImageRun, Table, TableRow, TableCell, WidthType, BorderStyle } from 'docx';
import { saveAs } from 'file-saver';

export const exportToPDF = async (title: string, content: any[], type: 'book' | 'puzzle' | 'trivia' | 'coloring') => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
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
      }
      y = margin;
      
      // Page Number Footer
      doc.setFontSize(10);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(150, 150, 150);
      doc.text(`- ${index + 1} -`, pageWidth / 2, pageHeight - 10, { align: 'center' });
      doc.setTextColor(0, 0, 0);

      if (type === 'coloring') {
        // Coloring Book: Image centered, large, title below
        if (item.imageUrl) {
          try {
            const maxImgWidth = contentWidth;
            const maxImgHeight = pageHeight - (margin * 2) - 30; // Leave space for title and footer
            
            let finalImgWidth = maxImgWidth;
            let finalImgHeight = (finalImgWidth * 3) / 4; // Assume 4:3
            
            if (finalImgHeight > maxImgHeight) {
              finalImgHeight = maxImgHeight;
              finalImgWidth = (finalImgHeight * 4) / 3;
            }

            const xPos = margin + (contentWidth - finalImgWidth) / 2;
            const yPos = margin + (maxImgHeight - finalImgHeight) / 2;
            
            doc.addImage(item.imageUrl, 'PNG', xPos, yPos, finalImgWidth, finalImgHeight);
            
            // Title below image
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text(item.title || 'Coloring Page', pageWidth / 2, yPos + finalImgHeight + 15, { align: 'center' });
          } catch (e) {
            console.error("Error adding coloring image to PDF:", e);
          }
        }
      } else {
        // Kids Book: Image top center, story text below
        if (item.imageUrl) {
          try {
            const imgWidth = contentWidth * 0.8; // 80% of width
            const imgHeight = (imgWidth * 3) / 4;
            const xPos = margin + (contentWidth - imgWidth) / 2;
            
            doc.addImage(item.imageUrl, 'PNG', xPos, y, imgWidth, imgHeight);
            y += imgHeight + 15;
          } catch (e) {
            console.error("Error adding book image to PDF:", e);
          }
        }

        if (item.title) {
          doc.setFontSize(18);
          doc.setFont('helvetica', 'bold');
          doc.text(item.title, pageWidth / 2, y, { align: 'center' });
          y += 12;
        }

        if (item.content) {
          doc.setFontSize(14);
          doc.setFont('times', 'normal');
          const splitContent = doc.splitTextToSize(item.content, contentWidth);
          
          // Handle overflow
          let remainingLines = [...splitContent];
          while (remainingLines.length > 0) {
            const linesPerPage = Math.floor((pageHeight - margin - y - 15) / 8);
            const part = remainingLines.slice(0, linesPerPage);
            doc.text(part, pageWidth / 2, y, { align: 'center' });
            remainingLines = remainingLines.slice(linesPerPage);
            
            if (remainingLines.length > 0) {
              doc.addPage();
              y = margin;
              // Page Number Footer for cont.
              doc.setFontSize(10);
              doc.setFont('helvetica', 'italic');
              doc.setTextColor(150, 150, 150);
              doc.text(`- ${index + 1} (cont.) -`, pageWidth / 2, pageHeight - 10, { align: 'center' });
              doc.setTextColor(0, 0, 0);
              doc.setFontSize(14);
              doc.setFont('times', 'normal');
            }
          }
        }
      }
    }
  } else if (type === 'trivia') {
    content.forEach((item, index) => {
      const questionHeight = 15 + (item.options ? item.options.length * 8 : 0) + 10;
      if (y + questionHeight > pageHeight - margin - 20) {
        doc.addPage();
        y = 20;
      }
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(`${index + 1}. ${item.question}`, margin, y);
      y += 10;
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      if (item.options) {
        item.options.forEach((opt: string, i: number) => {
          doc.text(`${String.fromCharCode(65 + i)}) ${opt}`, margin + 10, y);
          y += 8;
        });
      }
      y += 10;
    });

    doc.addPage();
    y = 20;
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Answer Key', pageWidth / 2, y, { align: 'center' });
    y += 15;
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    content.forEach((item, index) => {
      const answerText = `${index + 1}: ${item.answer} - ${item.explanation}`;
      const splitAnswer = doc.splitTextToSize(answerText, contentWidth);
      if (y + (splitAnswer.length * 6) > pageHeight - margin - 10) {
        doc.addPage();
        y = 20;
      }
      doc.text(splitAnswer, margin, y);
      y += (splitAnswer.length * 6) + 4;
    });
  } else if (type === 'puzzle') {
    content.forEach((item, index) => {
      if (index > 0) {
        doc.addPage();
      }
      y = 20;
      
      // Page Number
      doc.setFontSize(10);
      doc.setFont('helvetica', 'italic');
      doc.text(`- ${index + 1} -`, pageWidth / 2, pageHeight - 10, { align: 'center' });

      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text(item.title || `Puzzle ${index + 1}`, pageWidth / 2, y, { align: 'center' });
      y += 15;

      if (item.description) {
        doc.setFontSize(11);
        doc.setFont('helvetica', 'italic');
        const splitDesc = doc.splitTextToSize(item.description, contentWidth);
        doc.text(splitDesc, pageWidth / 2, y, { align: 'center' });
        y += (splitDesc.length * 6) + 10;
      }

      if (item.grid) {
        const grid = item.grid;
        const maxGridHeight = pageHeight - y - margin - 40;
        const cellSize = Math.min(contentWidth / grid[0].length, maxGridHeight / grid.length);
        const startX = margin + (contentWidth - grid[0].length * cellSize) / 2;
        const startY = y;

        doc.setFontSize(cellSize * 0.5); // Dynamic font size based on cell size
        doc.setFont('courier', 'bold');
        grid.forEach((row: any[], rowIndex: number) => {
          row.forEach((cell: any, colIndex: number) => {
            const x = startX + colIndex * cellSize;
            const yy = startY + rowIndex * cellSize;
            doc.setDrawColor(200);
            doc.rect(x, yy, cellSize, cellSize);
            if (cell !== null && cell !== undefined && cell !== '') {
              doc.text(String(cell), x + cellSize / 2, yy + cellSize / 2 + (cellSize * 0.15), { align: 'center' });
            }
          });
        });
        y += grid.length * cellSize + 15;
      }

      if (item.words) {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Words to find:', margin, y);
        y += 8;
        doc.setFont('helvetica', 'normal');
        const words = Array.isArray(item.words) ? item.words.join(', ') : item.words;
        const splitWords = doc.splitTextToSize(words, contentWidth);
        if (y + (splitWords.length * 6) > pageHeight - margin - 10) {
          doc.addPage();
          y = 20;
        }
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
      if (type === 'coloring') {
        // Coloring Book: Image centered, title below
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
                      width: 500,
                      height: 375, // 4:3 ratio
                    },
                  } as any),
                ],
                alignment: AlignmentType.CENTER,
                spacing: { before: 400, after: 400 },
                pageBreakBefore: index > 0,
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: item.title || 'Coloring Page',
                    size: 24, // 12pt
                    bold: true,
                    font: "Helvetica",
                  }),
                ],
                alignment: AlignmentType.CENTER,
                spacing: { after: 400 },
              })
            );
          } catch (e) {
            console.error("Error adding coloring image to DOCX:", e);
          }
        }
      } else {
        // Kids Book: Image top center, story text below
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
                      width: 450,
                      height: 337,
                    },
                  } as any),
                ],
                alignment: AlignmentType.CENTER,
                spacing: { before: 400, after: 400 },
                pageBreakBefore: index > 0,
              })
            );
          } catch (e) {
            console.error("Error adding book image to DOCX:", e);
          }
        }

        if (item.title) {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: item.title,
                  size: 36, // 18pt
                  bold: true,
                  font: "Helvetica",
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 200 },
            })
          );
        }

        if (item.content) {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: item.content,
                  size: 28, // 14pt
                  font: "Times New Roman",
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 },
            })
          );
        }
      }
      
      // Page Number
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `- ${index + 1} -`,
              size: 20,
              italics: true,
              color: "999999",
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { before: 400 },
        })
      );
    });
  } else if (type === 'trivia') {
    content.forEach((item, index) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${index + 1}. ${item.question}`,
              size: 28, // 14pt
              bold: true,
            }),
          ],
          spacing: { before: 200, after: 100 },
        })
      );
      if (item.options) {
        item.options.forEach((opt: string, i: number) => {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: `${String.fromCharCode(65 + i)}) ${opt}`,
                  size: 24, // 12pt
                }),
              ],
              indent: { left: 720 },
              spacing: { after: 50 },
            })
          );
        });
      }
    });

    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "Answer Key",
            size: 36, // 18pt
            bold: true,
          }),
        ],
        spacing: { before: 800, after: 400 },
        pageBreakBefore: true,
        alignment: AlignmentType.CENTER,
      })
    );

    content.forEach((item, index) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: `${index + 1}: `, bold: true, size: 22 }),
            new TextRun({ text: `${item.answer} - ${item.explanation}`, size: 22 }),
          ],
          spacing: { after: 100 },
        })
      );
    });
  } else if (type === 'puzzle') {
    content.forEach((item, index) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: item.title || `Puzzle ${index + 1}`,
              size: 40, // 20pt
              bold: true,
            }),
          ],
          spacing: { before: 400, after: 200 },
          pageBreakBefore: index > 0,
          alignment: AlignmentType.CENTER,
        })
      );

      if (item.description) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: item.description,
                size: 22, // 11pt
                italics: true,
              }),
            ],
            spacing: { after: 200 },
            alignment: AlignmentType.CENTER,
          })
        );
      }

      if (item.grid) {
        children.push(
          new Table({
            width: { size: 80, type: WidthType.PERCENTAGE },
            alignment: AlignmentType.CENTER,
            rows: item.grid.map((row: any[]) => 
              new TableRow({
                children: row.map((cell: any) => 
                  new TableCell({
                    children: [new Paragraph({ 
                      children: [
                        new TextRun({
                          text: cell !== null && cell !== undefined && cell !== '' ? String(cell) : "",
                          size: 20,
                          bold: true,
                        })
                      ],
                      alignment: AlignmentType.CENTER 
                    })],
                    borders: {
                      top: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
                      bottom: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
                      left: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
                      right: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
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
            children: [
              new TextRun({
                text: "Words to find:",
                bold: true,
                size: 24,
              }),
            ],
            spacing: { before: 400, after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: Array.isArray(item.words) ? item.words.join(', ') : item.words,
                size: 24,
              }),
            ],
            spacing: { after: 400 },
          })
        );
      }

      // Page Number
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `- ${index + 1} -`,
              size: 20,
              italics: true,
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { before: 400 },
        })
      );
    });
  }

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          size: {
            width: "210mm",
            height: "297mm",
          },
          margin: {
            top: "20mm",
            right: "20mm",
            bottom: "20mm",
            left: "20mm",
          },
        },
      },
      children: children,
    }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${title.replace(/\s+/g, '_')}.docx`);
};
