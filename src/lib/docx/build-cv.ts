import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
} from "docx";
import type { GeneratedCv } from "../gemini/schemas";

function heading(text: string) {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 120 },
  });
}

function body(text: string) {
  return new Paragraph({
    children: [new TextRun({ text, size: 22 })],
    spacing: { after: 120 },
  });
}

function bullet(text: string) {
  return new Paragraph({
    text,
    bullet: { level: 0 },
    spacing: { after: 60 },
  });
}

export async function buildCvDocx(cv: GeneratedCv): Promise<Buffer> {
  const children: Paragraph[] = [
    new Paragraph({
      children: [
        new TextRun({ text: cv.fullName, bold: true, size: 32 }),
      ],
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({
      children: [new TextRun({ text: cv.contactLine, size: 20 })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 240 },
    }),
    heading("Profile"),
    body(cv.profile),
    heading("Skills"),
  ];

  for (const group of cv.skillGroups) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: `${group.category}: `, bold: true, size: 22 }),
          new TextRun({ text: group.items, size: 22 }),
        ],
        spacing: { after: 80 },
      })
    );
  }

  children.push(heading("Experience"));
  for (const exp of cv.experience) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: exp.heading, bold: true, size: 22 }),
        ],
        spacing: { before: 120 },
      }),
      new Paragraph({
        children: [new TextRun({ text: exp.dates, italics: true, size: 20 })],
        spacing: { after: 80 },
      })
    );
    for (const b of exp.bullets) children.push(bullet(b));
  }

  if (cv.projects?.length) {
    children.push(heading("Selected projects"));
    for (const p of cv.projects) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: p.heading, bold: true, size: 22 })],
        }),
        new Paragraph({
          children: [new TextRun({ text: p.dates, italics: true, size: 20 })],
          spacing: { after: 80 },
        })
      );
      for (const b of p.bullets) children.push(bullet(b));
    }
  }

  children.push(heading("Education"));
  for (const ed of cv.education) {
    children.push(body(ed.heading));
    if (ed.detail) children.push(body(ed.detail));
  }

  if (cv.additionalInfo) {
    children.push(heading("Additional information"));
    children.push(body(cv.additionalInfo));
  }

  const doc = new Document({
    sections: [{ children }],
  });

  return Buffer.from(await Packer.toBuffer(doc));
}
