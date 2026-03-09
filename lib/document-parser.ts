import pdfParse from "pdf-parse";

export async function extractTextFromFile(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());

  if (file.type === "text/plain" || file.name.endsWith(".txt") || file.name.endsWith(".md")) {
    return buffer.toString("utf-8");
  }

  if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
    const data = await pdfParse(buffer);
    return data.text;
  }

  throw new Error("未対応のファイル形式です。TXT / MD / PDF を利用してください。");
}
