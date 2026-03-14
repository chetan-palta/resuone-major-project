import puppeteer from "puppeteer";
import { renderHtml } from "../utils/template";
import { ResumeData } from "../types/resume";

export const generatePdf = async (data: ResumeData): Promise<Buffer> => {
  let browser;

  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    const html = renderHtml(data);

    await page.setContent(html, {
      waitUntil: "networkidle0",
    });

    // Ensure fonts/styles loaded
    await page.evaluateHandle("document.fonts.ready");

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: {
        top: "0mm",
        right: "0mm",
        bottom: "0mm",
        left: "0mm",
      },
    });

    await browser.close();
    return Buffer.from(pdfBuffer);
  } catch (error) {
    console.error("PDF generation failed:", error);
    if (browser) await browser.close();
    throw error;
  }
};