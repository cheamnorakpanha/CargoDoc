# CargoDoc 📄🚢

**CargoDoc** is a personal productivity web app I built to streamline my freelance logistics work while juggling school. It automates the extraction and verification of shipping data from Import/Export customs declarations and commercial invoices, saving me hours of manual data entry.

Built with modern web technologies, it instantly parses complex PDFs using advanced text extraction and OCR (Optical Character Recognition), turning messy logistics documents into structured, exportable data right in the browser.

## ✨ Key Features

- **Smart PDF Parsing & OCR:** Automatically reads uploaded logistics PDFs. If the text layer is missing or unreadable, it intelligently falls back to local OCR to extract text from document images.
- **Automated Data Extraction:** Uses custom regex parsing to accurately identify and extract crucial shipping fields, including:
  - Document Dates
  - Import/Export/Reference Numbers
  - Barge Numbers & Plates
  - VINs (Vehicle Identification Numbers)
- **Interactive Verification Table:** Review all extracted records in a dynamic data table. It automatically flags missing or invalid data (like duplicate or incorrect length VINs) and allows manual entry for multi-stage verification (First Check, Second Check).
- **Export to Excel/JSON:** Once your data is verified and formatted, instantly download the structured records as an Excel spreadsheet (`.xlsx`) or JSON file.
- **Privacy First (Local Processing):** Your sensitive business documents never leave your computer. All PDF parsing, OCR, and data extraction run **100% locally in your browser's memory**. No data is stored on external servers.

## 🛠️ Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (React)
- **PDF Processing:** `pdfjs-dist` (Client-side rendering and text extraction)
- **Data Tables:** `@tanstack/react-table`
- **Exports:** `xlsx` (SheetJS)
- **Icons:** `lucide-react`
- **Styling:** Tailwind CSS

## 🚀 Getting Started

First, install the dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
