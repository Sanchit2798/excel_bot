function llm_action() {
  Excel.run(async (context) => {
    const sheet = context.workbook.getActiveWorksheet();

    // Get the entire column A
    const columnA = sheet.getRange("A:A");

    // Set a border around the entire column A
    columnA.format.borders.all.color = "black"; // Or any color, e.g., "blue"
    columnA.format.borders.all.weight = Excel.BorderWeight.thin; // Or thick, medium, hairline

    await context.sync();
    console.log("A border has been added around column A.");
  }).catch(function (error) {
    console.log("Error: " + error);
    if (error instanceof OfficeExtension.Error) {
      console.log("Debug info: " + JSON.stringify(error.debugInfo));
    }
  });
}