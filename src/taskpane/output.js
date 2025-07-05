
async function llm_action() {
  await Excel.run(async (context) => {
    const sheet = context.workbook.worksheets.getActiveWorksheet();

    // Set the formula in B1 to sum A1:A5
    const targetCell = sheet.getRange("B1");
    targetCell.formulas = [
      ["=SUM(A1:A5)"]
    ];

    // Highlight cell B1 with yellow color
    targetCell.format.fill.color = "yellow";

    await context.sync();
  });
}
