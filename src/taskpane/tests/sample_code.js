export const sampleCode = `return async function() {
                await Excel.run(async (context) => {
                  const sheet = context.workbook.worksheets.getActiveWorksheet();
                  ABD();
                  const columnA = sheet.getRange("A:A");
                  columnA.format.fill.color = "red";
                  await context.sync();
                });
              };`