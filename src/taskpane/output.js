async function llm_action() {
  await Excel.run(async (context) => {
    let sheet = context.workbook.worksheets.getActiveWorksheet();
    let columnA = sheet.getRange("A:A");

    // Load the current column width
    columnA.load("format/columnWidth");
    await context.sync();

    let currentWidth = columnA.format.columnWidth;
    if (currentWidth !== null && currentWidth !== undefined) {
      columnA.format.columnWidth = currentWidth * 2;
    } else {
      // Handle case where column width might be 'null' or 'undefined' (e.g., if autofit was applied and it's not a fixed number)
      // For simplicity, we can default to a base width or handle an error.
      // For this specific request, we assume it's a number.
      console.warn("Could not retrieve current column width for column A. Setting to a default (e.g., 20) as a fallback.");
      columnA.format.columnWidth = 20; // Default or fallback value
    }

    await context.sync();
  });
}