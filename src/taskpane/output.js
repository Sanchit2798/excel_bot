function llm_action(context) {
  const sheet = context.workbook.worksheets.getActiveWorksheet();
  ABC();
  const columnA = sheet.getRange("A:A");
  columnA.format.fill.color = "black";
  context.sync()
}