async function llm_action() {
  await Excel.run(async (context) => {
    const sheet = context.workbook.worksheets.getActiveWorksheet();
    const firstRow = sheet.getRange("1:1");

    firstRow.load("format/rowHeight");
    await context.sync();

    const currentRowHeight = firstRow.format.rowHeight;
    firstRow.format.rowHeight = currentRowHeight * 2;

    await context.sync();
  });
}