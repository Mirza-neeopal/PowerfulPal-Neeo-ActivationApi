const SQL = require('mssql');
const SQL_CONFIGURATION = require('../configuration.json');

let StoreProcedureHelper = async function getStoredProcedure(
  nameOfStoredProcedure: string, param1: string, param2: string, param3: string
) {
   SQL.connect(SQL_CONFIGURATION)
   .then((pool: any) => {
       return pool
       .request()
       .execute(nameOfStoredProcedure)
   }).then((result: any) => {
       console.log(result);
   }).catch((err: any) => {
    return err;
  }); 
}