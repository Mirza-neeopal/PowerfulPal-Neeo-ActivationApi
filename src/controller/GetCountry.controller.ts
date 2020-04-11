import { Request, Response, NextFunction, request } from 'express';
var geoip = require('geoip-lite');


const responseFn = (status: number, code: number, response: any, version: string = "1.0.0", message: string, data: Object = {}) => {
  return response.status(500).send({
  status: status,
  code: code,
  message: message,
  version: version,
  data: data
 });
}

export class GetCountryController {
  GetCountry = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
     
      //  const ip =  request.params.Ip;  //For dev Value
      let ip = "207.97.227.239"; // For test value
      var geo = geoip.lookup(ip);

      console.log(responseFn(200, 1, "success", "1.0.0", "Success ful"))

      return response.status(200).send({
        status: 200,
        code: 1,
        message: "success",
        version: "1.0.0",
        data: { returnValue: geo.country}
      });
    
    
    } catch (error) {
      return response.status(500).send({
        status: 500,
        code: -1,
        message: "fail to update user",
        version: "1.0.0",
        data: {}
      });
    }
}

}

