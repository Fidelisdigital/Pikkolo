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
  } else if (type === 'trivia' || type === 'puzzle') {
    content.forEach((item, index) => {
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

      if (item.isSolution) {
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text(item.title || 'Answer Key', pageWidth / 2, y, { align: 'center' });
        y += 20;
      } else {
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text(item.title || `Puzzle ${index + 1}`, pageWidth / 2, y, { align: 'center' });
        y += 15;
      }

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

        doc.setFontSize(cellSize * 0.5);
        doc.setFont('courier', 'bold');
        grid.forEach((row: any[], rowIndex: number) => {
          row.forEach((cell: any, colIndex: number) => {
            const x = startX + colIndex * cellSize;
            const yy = startY + rowIndex * cellSize;
            
            const isHighlighted = item.highlightedCells?.some((c: any) => c.r === rowIndex && c.c === colIndex);
            
            if (isHighlighted) {
              doc.setFillColor(200, 255, 200);
              doc.rect(x, yy, cellSize, cellSize, 'F');
            }
            
            doc.setDrawColor(200);
            doc.rect(x, yy, cellSize, cellSize);
            if (cell !== null && cell !== undefined && cell !== '') {
              doc.text(String(cell), x + cellSize / 2, yy + cellSize / 2 + (cellSize * 0.15), { align: 'center' });
            }
          });
        });
        y += grid.length * cellSize + 15;
      }

      if (item.grids) {
        // Sudoku solutions (4 per page)
        const gridCols = 2;
        const gridRows = 2;
        const gridWidth = (contentWidth - 10) / gridCols;
        const gridHeight = (pageHeight - y - margin - 20) / gridRows;
        const cellSize = Math.min(gridWidth / 9, gridHeight / 9);

        item.grids.forEach((g: any, i: number) => {
          const col = i % gridCols;
          const row = Math.floor(i / gridCols);
          const startX = margin + col * (gridWidth + 10) + (gridWidth - 9 * cellSize) / 2;
          const startY = y + row * (gridHeight + 10);

          doc.setFontSize(cellSize * 0.6);
          doc.setFont('helvetica', 'bold');
          doc.text(g.title, startX + (9 * cellSize) / 2, startY - 2, { align: 'center' });

          g.grid.forEach((r: any[], ri: number) => {
            r.forEach((cell: any, ci: number) => {
              const x = startX + ci * cellSize;
              const yy = startY + ri * cellSize;
              
              doc.setDrawColor(200);
              doc.rect(x, yy, cellSize, cellSize);
              
              // Bold borders for 3x3
              doc.setDrawColor(0);
              if (ri % 3 === 0) doc.line(x, yy, x + cellSize, yy);
              if (ci % 3 === 0) doc.line(x, yy, x, yy + cellSize);
              if (ri === 8) doc.line(x, yy + cellSize, x + cellSize, yy + cellSize);
              if (ci === 8) doc.line(x + cellSize, yy, x + cellSize, yy + cellSize);
              
              if (cell) {
                doc.text(String(cell), x + cellSize / 2, yy + cellSize / 2 + (cellSize * 0.15), { align: 'center' });
              }
            });
          });
        });
      }

      if (item.content) {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        const splitContent = doc.splitTextToSize(item.content, contentWidth);
        doc.text(splitContent, margin, y);
        y += (splitContent.length * 6) + 10;
      }

      if (item.words) {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Words to find:', margin, y);
        y += 8;
        doc.setFont('helvetica', 'normal');
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
  } else if (type === 'trivia' || type === 'puzzle') {
    content.forEach((item, index) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: item.title || (item.isSolution ? 'Answer Key' : `Puzzle ${index + 1}`),
              size: item.isSolution ? 44 : 40,
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
                size: 22,
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
            rows: item.grid.map((row: any[], rIndex: number) => 
              new TableRow({
                children: row.map((cell: any, cIndex: number) => {
                  const isHighlighted = item.highlightedCells?.some((c: any) => c.r === rIndex && c.c === cIndex);
                  return new TableCell({
                    children: [new Paragraph({ 
                      children: [
                        new TextRun({
                          text: cell !== null && cell !== undefined && cell !== '' ? String(cell) : "",
                          size: 20,
                          bold: true,
                          color: isHighlighted ? "FFFFFF" : "000000",
                        })
                      ],
                      alignment: AlignmentType.CENTER 
                    })],
                    shading: isHighlighted ? { fill: "10B981", type: "solid", color: "10B981" } : undefined,
                    borders: {
                      top: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
                      bottom: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
                      left: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
                      right: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
                    }
                  });
                })
              })
            ),
          })
        );
      }

      if (item.grids) {
        // Sudoku solutions (4 per page)
        const gridPairs = [];
        for (let i = 0; i < item.grids.length; i += 2) {
          gridPairs.push(item.grids.slice(i, i + 2));
        }

        gridPairs.forEach(pair => {
          children.push(
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [
                new TableRow({
                  children: pair.map((g: any) => 
                    new TableCell({
                      children: [
                        new Paragraph({ text: g.title, alignment: AlignmentType.CENTER, spacing: { after: 100 } }),
                        new Table({
                          width: { size: 90, type: WidthType.PERCENTAGE },
                          alignment: AlignmentType.CENTER,
                          rows: g.grid.map((r: any[], ri: number) => 
                            new TableRow({
                              children: r.map((c: any, ci: number) => 
                                new TableCell({
                                  children: [new Paragraph({ 
                                    children: [new TextRun({ text: String(c || ""), size: 16 })],
                                    alignment: AlignmentType.CENTER 
                                  })],
                                  borders: {
                                    top: { style: BorderStyle.SINGLE, size: ri % 3 === 0 ? 2 : 1 },
                                    bottom: { style: BorderStyle.SINGLE, size: ri === 8 ? 2 : 1 },
                                    left: { style: BorderStyle.SINGLE, size: ci % 3 === 0 ? 2 : 1 },
                                    right: { style: BorderStyle.SINGLE, size: ci === 8 ? 2 : 1 },
                                  }
                                })
                              )
                            })
                          )
                        })
                      ],
                      borders: {
                        top: { style: BorderStyle.NONE },
                        bottom: { style: BorderStyle.NONE },
                        left: { style: BorderStyle.NONE },
                        right: { style: BorderStyle.NONE },
                      }
                    })
                  )
                })
              ]
            })
          );
          children.push(new Paragraph({ spacing: { after: 400 } }));
        });
      }

      if (item.content) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: item.content,
                size: 24,
              }),
            ],
            spacing: { before: 200, after: 200 },
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
              color: "999999",
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
