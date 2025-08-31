function llm_action(context) {
  const sheet = context.workbook.worksheets.getActiveWorksheet();
  const columnA = sheet.getRange("A:A");
  columnA.format.fill.color = "red";
  return context.sync();
}