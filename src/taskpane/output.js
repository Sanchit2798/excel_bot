async function llm_action() {
  await Excel.run(async (context) => {
    const sheet = context.workbook.worksheets.getActiveWorksheet();
    const columnA = sheet.getRange("A:A");
    columnA.format.fill.color = "red";

    await context.sync();
  });
}