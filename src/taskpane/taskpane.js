/*
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

/* global console, document, Excel, Office */

console.log("Loading taskpane.js...");
import {doAction} from "./action.js";

Office.onReady((info) => {
  if (info.host === Office.HostType.Excel) {
    document.getElementById("sideload-msg").style.display = "none";
    document.getElementById("app-body").style.display = "flex";
    document.getElementById("run").onclick = run;
  }
});

export async function run() {
  try {
    await Excel.run(async (context) => {
      const sheet = context.workbook.worksheets.getActiveWorksheet();
      let actionInput = document.getElementById("actionInput").value;
      console.log("input value : ", actionInput);
      await context.sync();
      // // Get the range for a specific column (e.g., column A)
      // const range = sheet.getRange("A:A");
      // //Get the entire column A
      // const column = sheet.getRange("A:A");
      // column.format.load("columnWidth");
      // await context.sync();

      // console.log("width is", column.format.columnWidth)
      // // Explicitly set the column width
      // column.format.columnWidth = 0.5 * column.format.columnWidth || 60; // Default to 30 if column width isn't loaded
      
      // console.log("width after update is", column.format.columnWidth)

      // const sumCell = sheet.getRange("A11"); // Cell to display the sum

      // // Update the fill color for the range
      // range.format.fill.color = "red";

      // // Add the sum formula to the designated cell
      // sumCell.formulas = [["=SUM(A1:A10)"]];

      // // Make the sum cell bold
      // sumCell.format.font.bold = true;

      // // Add an outline/border around the sum cell
      // const borders = sumCell.format.borders;
      // borders.getItem("EdgeTop").style = "Continuous";
      // borders.getItem("EdgeBottom").style = "Continuous";
      // borders.getItem("EdgeLeft").style = "Continuous";
      // borders.getItem("EdgeRight").style = "Continuous";
      // await context.sync();
      // console.log("Column width updated and sum cell formatted.");
      // console.log("Calling action from action.js");
      doAction(actionInput);
    });
  } catch (error) {
    console.error(error);
  }
}

// export async function run() {
//   try {
//     await Excel.run(async (context) => {
//       const range = context.workbook.getSelectedRange();

//       // Read the range address.
//       range.load("address");

//       // Update the fill color.
//       range.format.fill.color = "red";

//       await context.sync();
//       console.log(`The range address was ${range.address}.`);
//     });
//   } catch (error) {
//     console.error(error);
//   }
// }
