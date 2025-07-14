function llm_action() {
  Excel.run(async (context) => {
    const sheet = context.workbook.worksheets.getActiveWorksheet();

    // Get the used range of the worksheet.
    // This ensures conditional formatting applies only where there's data,
    // but the formula will still reference column A for each row.
    const usedRange = sheet.getUsedRange();
    usedRange.load("address"); // Load the address to know the range
    await context.sync();

    // Define the range for conditional formatting.
    // We apply it to the entire used range to color whole rows.
    // The formula will ensure it only depends on column A.
    const conditionalFormatRange = sheet.getRange(usedRange.address);

    // Add a custom conditional formatting rule
    const conditionalFormat = conditionalFormatRange.conditionalFormats.add(
      Excel.ConditionalFormatType.custom
    );

    // Set the formula for the custom rule.
    // The formula checks if the value in column A of the current row is even.
    // $A1 is used to make column A absolute and row 1 relative,
    // so it adjusts for each row within the applied range.
    conditionalFormat.custom.rule.formula = "=MOD($A1,2)=0";

    // Set the fill color to pink (#FFC0CB)
    conditionalFormat.custom.format.fill.color = "#FFC0CB";

    await context.sync();
    console.log("Conditional formatting applied successfully.");
  });
}