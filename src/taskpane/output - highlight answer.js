function llm_action() {
  Excel.run(async (context) => {
    const sheet = context.workbook.worksheets.getActiveWorksheet();

    const rangeA = sheet.getRange("A2:A16");
    const rangeC = sheet.getRange("C2:C10");

    rangeA.load('values');
    rangeC.load('values');

    await context.sync();

    const valuesA = rangeA.values.flat();
    const valuesC = rangeC.values.flat();

    const setA = new Set(valuesA);
    const setC = new Set(valuesC);

    const diffA_not_C = new Set([...setA].filter(x => !setC.has(x)));
    const diffC_not_A = new Set([...setC].filter(x => !setA.has(x)));

    rangeA.format.fill.clear();
    rangeC.format.fill.clear();
    await context.sync();

    for (let i = 0; i < rangeA.values.length; i++) {
      for (let j = 0; j < rangeA.values[i].length; j++) {
        const cellValue = rangeA.values[i][j];
        if (diffA_not_C.has(cellValue)) {
          const cell = rangeA.getCell(i, j);
          cell.format.fill.color = "yellow";
        }
      }
    }

    for (let i = 0; i < rangeC.values.length; i++) {
      for (let j = 0; j < rangeC.values[i].length; j++) {
        const cellValue = rangeC.values[i][j];
        if (diffC_not_A.has(cellValue)) {
          const cell = rangeC.getCell(i, j);
          cell.format.fill.color = "orange";
        }
      }
    }

    await context.sync();
  });
}