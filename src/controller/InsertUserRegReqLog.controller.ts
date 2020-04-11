import { Request, Response, NextFunction } from "express";
const SQL = require("mssql");
const SQL_CONFIGURATION = require("../configuration.json");

export class InsertUserRegRequestsLogController {
  InsertUserRegReqLog = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const username = request.body.username;// A string contain userid
      const latitude = request.body.latitude;
      const longitude = request.body.longitude;

       const result = await SQL.connect(SQL_CONFIGURATION).then((pool: any) => {
        
        return pool.request()
        .input('username', SQL.VarChar(64), username)
        .input('latitude', SQL.VarChar(64), latitude)
        .input('longitude', SQL.VarChar(64), longitude)
       
        .execute("spne_InsertMembersRequestsLog");
      })
      .then((result: any) => {
        console.dir(result);
        const returnValue = result.returnValue === '0';
        if(returnValue) {
          return response.status(400).send({
            status: 400,
            code: -1,
            message: "fail",
            version: "1.0.0",
            error: "error",
            data: {}
          });
        } else {
          return response.status(200).send({
            status: 200,
            code: 1,
            message: "",
            version: "1.0.0",
            data: {}
          });
        }
      })

      // response.status(200).send({ returnValue: result.recordsets[0] });
    } catch (error) {
      console.log(error, 'Error');
      response.status(500).send({ error });
    }
  };
}