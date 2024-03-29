import Exceljs from 'exceljs';
import Validator from '../InputValidator/Validator';

class AdministrationMiddleware {
  static async getWorksheetFromExcelFile(doc) {
    const { docType, tempFilePath } = doc;
    const workbook = new Exceljs.Workbook();
    await workbook[docType].readFile(tempFilePath);
    const worksheet = workbook.getWorksheet(1);
    return worksheet;
  }

  static checkRowValues(methodName, worksheet) {
    const rowsWithErrors = [];
    worksheet.eachRow((row, index) => {
      const { rowIsValid, errors } = Validator[methodName](row.values);
      if (!rowIsValid) rowsWithErrors.push({ line: index, errors });
    });
    
    return rowsWithErrors;
  }
  
  static async validateExcelValues(req, res, next) {
    const { path, files: { doc } } = req;
    const methodName = path.slice(7); // take out /admin/ from path, use name as method to call

    try {
      const worksheet = await AdministrationMiddleware.getWorksheetFromExcelFile(doc);
      const rowsWithErrors = AdministrationMiddleware.checkRowValues(methodName, worksheet);
      if (rowsWithErrors.length) {
        return res.status(400).json({
          message: `${rowsWithErrors.length} rows contain errors.`,
          rowsWithErrors
        });
      }
      req.worksheet = worksheet;
      return next();
    } catch (e) {
      console.log(e);
      return res.status(500).json({
        message: `An error occurred while processing your request.${''
        } This could be a problem with the file you uploaded.`
      });
    }
  }
}

export default AdministrationMiddleware;
