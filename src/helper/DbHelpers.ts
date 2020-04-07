const SQL = require('mssql');
const SQL_CONFIGURATION = require('../configuration.json');



  const StoredProcedure = async(
    nameOfStoredProcedure: string, param1: string, param2: string, param3: string
  ) => {
     SQL.connect(SQL_CONFIGURATION)
     .then((pool: any) => {
         return pool
         .request()
         .execute(nameOfStoredProcedure, param1, param2, param3)
     }).then((result: any) => {
         console.log(result);
     }).catch((err: any) => {
      return err;
    }); 
  }
  
  /**
   * Update User Device token in the xmpp database and voip server.
   * @param {string} applicationVersion The first params.
   * @param {string} deviceInfo The second param.
   * @param {string} isUpdatingDToken The second param.
   * @return it will send 201 status in sccess case.
   */
  
  
  // const UpdateDeviceInfo = async (
  //   phNo: string,
  //   applicationID: string,
  //   applicationVersion: string,
  //   devicePlatform: string,
  //   deviceVenderID: string
  // ) => {
  //      const isTransactional : boolean = false;
  //      const insertUpdateAllFields: boolean = false;
  //      SQL.connect(SQL_CONFIGURATION)
  //          .then((pool: any) => {
  //             return pool.request()
  //             .input('phoneNumber', SQL.VarChar(64), phNo)
  //             .input('applicationID', SQL.VarChar(36), applicationID)
  //             .input('applicationVersion', SQL.VarChar(36), applicationVersion)
  //             .input('deviceVenderID', SQL.VarChar(36), deviceVenderID)
  //             .input('devicePlatform', SQL.Int, devicePlatform)
  //             .output('userExists', SQL.Int)
  //             .execute('dbo.spne_UpdateUserDeviceInfoByPhoneNumber', phNo, applicationID, applicationVersion, devicePlatform, deviceVenderID);
  //          })
  //          .then((result: any) => {
  //           const userUpdated = result.returnValue === '0';
  //          })
  // }


