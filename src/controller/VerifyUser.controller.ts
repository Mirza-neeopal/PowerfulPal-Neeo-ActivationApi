import { Request, Response, NextFunction, request } from 'express';
const SQL = require('mssql');
const SQL_CONFIGURATION = require('../configuration.json');
var crypto = require('crypto');


export class VerifyUserController {
    VerifyUser = async (
      request: Request,
      response: Response,
      next: NextFunction
    ) => {
      try {
          const userID = request.body.userID;//1-three params // 2-appId vendId
  
          const initHash = request.body.hash;

          let deviceVenID;
          let applicationID;

          if(userID != null) {
            SQL.connect(SQL_CONFIGURATION)
            .then((pool: any) => {
             
              return pool.request()
              .input('userID', SQL.VarChar(64), userID)
             
              .execute('spne_GetUserInfoByUserID');
            })
             .then((result: any) => {
                 deviceVenID = result.recordset[0].deviceVenderID;              
                 applicationID = result.recordset[0].applicationID;
                 const spneHash1 = userID + deviceVenID + applicationID;
                 const spneHash2 = deviceVenID + applicationID;
                 const convertHash1 = convertedHash(spneHash1);
                 const convertHash2 = convertedHash(spneHash2);
               

                if(initHash === convertHash1 || initHash === convertHash2) {
                  return response.status(200).send({
                    status: 200,
                    code: 1,
                    message: "success",
                    version: "1.0.0",
                    data: {}
                  });
                } else {
                  return response.status(500).send({
                    status: 500,
                    code: -1,
                    message: "fail",
                    version: "1.0.0",
                    error: "error",
                    data: {}
                  });
                }
             })
             
          }else {
            return response.status(500).send({
              status: 500,
              code: -1,
              message: "fail",
              version: "1.0.0",
              error: "error",
              data: {}
            });
          }

      }catch(error) {
        return response.status(500).send({
          status: 500,
          code: -1,
          message: "fail",
          version: "1.0.0",
          error: "error",
          data: {}
        });
      }
    }
}

let convertedHash = (hashValue: any) => {
  let hash = crypto.createHash('md5').update(hashValue).digest("hex")
  return hash;
}