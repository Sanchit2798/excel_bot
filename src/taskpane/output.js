function llm_action(context) {
  console.log("Executing simple action...");
  console.log("trying in simple action");
  
  const sheet = context.workbook.worksheets.getActiveWorksheet();
  const range = sheet.getRange("A1");
  // Set the fill color to blue
  range.format.fill.color = "blue";
  context.sync();

  console.log("simple action executed successfully.");
  context.sync();
    //throw new Error("Simulated error in simple action");
}

// function llm_action() {
//   try {
//     excel_run();
//   } catch (error) {
//     // Note: In a production add-in, you'd want to notify the user through your add-in's UI.
//     console.error(error);}}

// function excel_run() {
//     Excel.run((context) => {
//     // The locale setting for the add-in (e.g., en-US) is configured in the add-in's manifest file
//     // and cannot be changed programmatically at runtime using the Excel JavaScript API.
//     // This API primarily interacts with the content and properties of the Excel workbook itself.
//     // To change the country setting to US, you would need to modify the <DefaultLocale> or <TargetDialect>
//     // element in your add-in's manifest XML file and redeploy it.
//     // There are no Excel JavaScript API methods available to modify the add-in's manifest or global
//     // locale settings of the Office application.
//     console.log("Executing llm_action...");
//     ABC()
//     console.log("llm_action executed successfully.");
//     context.sync();
//   });
// }