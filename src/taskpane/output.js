function llm_action() {
  Excel.run(async (context) => {
    // The locale setting for the add-in (e.g., en-US) is configured in the add-in's manifest file
    // and cannot be changed programmatically at runtime using the Excel JavaScript API.
    // This API primarily interacts with the content and properties of the Excel workbook itself.
    // To change the country setting to US, you would need to modify the <DefaultLocale> or <TargetDialect>
    // element in your add-in's manifest XML file and redeploy it.
    // There are no Excel JavaScript API methods available to modify the add-in's manifest or global
    // locale settings of the Office application.
    console.log("Executing llm_action...");
    ABC()
    console.log("llm_action executed successfully.");
    await context.sync();
  });
}