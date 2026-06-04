import { Document, Packer, Paragraph, TextRun } from "docx";
import type { GeneratedCoverLetter } from "../gemini/schemas";

export async function buildCoverLetterDocx(
  letter: GeneratedCoverLetter
): Promise<Buffer> {
  const children: Paragraph[] = [
    new Paragraph({ children: [new TextRun({ text: letter.dateLine })] }),
    new Paragraph({ text: "" }),
    ...letter.recipientBlock.split("\n").map(
      (line) => new Paragraph({ children: [new TextRun({ text: line })] })
    ),
    new Paragraph({ text: "" }),
    new Paragraph({
      children: [new TextRun({ text: letter.subjectLine, bold: true })],
    }),
    new Paragraph({ text: "" }),
    new Paragraph({ children: [new TextRun({ text: letter.salutation })] }),
    new Paragraph({ text: "" }),
    ...letter.paragraphs.map(
      (p) =>
        new Paragraph({
          children: [new TextRun({ text: p })],
          spacing: { after: 200 },
        })
    ),
    new Paragraph({ children: [new TextRun({ text: letter.closing })] }),
    new Paragraph({ text: "" }),
    new Paragraph({
      children: [new TextRun({ text: letter.signatureName })],
    }),
  ];

  const doc = new Document({ sections: [{ children }] });
  return Buffer.from(await Packer.toBuffer(doc));
}
