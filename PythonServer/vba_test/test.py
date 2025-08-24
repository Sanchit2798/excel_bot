import win32com.client

# Read VBA code from file
with open("vba_code.txt", "r") as file:
    vba_code = file.read()

# Open Excel
excel = win32com.client.Dispatch("Excel.Application")
excel.Visible = True
wb = excel.Workbooks.Open(r"C:\Users\sanch\OneDrive\Desktop\LDSN\excel_bot\excel_bot\PythonServer\vba_test\test.xlsx")

# Add VBA to the workbook
module = wb.VBProject.VBComponents.Add(1)  # 1 = standard module
module.CodeModule.AddFromString(vba_code)

# Run the macro (if it's named HelloWorld)
excel.Application.Run("DoubleColumnWidth")

# Save and close
wb.Save()
wb.Close()
excel.Quit()
