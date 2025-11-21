# PDF Viewer with Analysis

A React application that allows you to view PDF files and analyze their content with interactive text highlighting and page navigation.

## Features

- View PDF documents with zoom and page navigation
- Search for text within the PDF
- Interactive analysis panel with collapsible sections
- Clickable page references that navigate to specific pages
- Responsive design that works on different screen sizes

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm (v6 or later)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd pdf-viewer-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000`

## Adding Your Own PDF

1. Place your PDF file in the `public` directory
2. Update the `file` prop in `App.tsx` to point to your PDF file:
   ```tsx
   <PDFViewer 
     ref={pdfViewerRef}
     file="/your-pdf-file.pdf"  // Update this line
     onPageChange={setCurrentPage}
   />
   ```

## Customizing the Analysis Text

Edit the `analysisText` constant in `App.tsx` to include your own analysis. Use `[number]` to create clickable page references.

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run preview` - Preview the production build

## Dependencies

- React 18
- react-pdf - For PDF rendering
- TypeScript - For type safety
- Vite - For development server and build tooling

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
