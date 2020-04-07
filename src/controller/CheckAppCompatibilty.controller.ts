import { Request, Response, NextFunction, request } from 'express';
import { Client } from 'models/Client.model';
import { DeviceInfo } from 'models/DeviceInfo.model';
const SQL = require('mssql');
const SQL_CONFIGURATION = require('../configuration.json');

const axios = require('axios');
const phoneUtil = require("google-libphonenumber").PhoneNumberUtil.getInstance();

let deviceInfo : DeviceInfo;
let isTransactional: boolean;
let insertUpdateAllFields: boolean;

export class CheckAppCompatibilityController {
    CheckAppCompatibilty = async (
      request:Request,
      response: Response,
      next: NextFunction
    ) => {
        try {
            const phoneNumber = request.body.uID;  //UserId is Phone number
            const client = request.body.client as Client;
            const appVer = client.AppVer;
            const osVer = client.OsVer;
            const dM = client.DM;
            const appId = client.AppID;

            if(phoneNumber === '' ){
                return response.status(400).send({ error: "Enter Full information is  required" });
            }
            let internationalPhNo = "";

            let checkInter = IsPhoneNumberInInternationalFormat.some(phoneNumber);
            if(!checkInter) {
              internationalPhNo = '+' + phoneNumber;
            }else {
                internationalPhNo = phoneNumber;
            }

            if(
                internationalPhNo === null ||
                internationalPhNo === "" ||
                internationalPhNo === undefined ||
                !internationalPhNo
              ) {
                  return response.status(400).send({ error: "Phone Number is invalid" });
              }else {
                const upDateDeviceInfo = upDateUserDeviceInfo.updateInfo(internationalPhNo, appId
                  ,appVer, deviceInfo, isTransactional, insertUpdateAllFields);
              }
        }
        catch {

        }
    }
}



/**
 * Update device Info.
 * @param {any} userId The first params.
 * @param {string}  applicationID The second param.
 * @param {string} applicationVersion The second param.
 * @return 
 */
let upDateUserDeviceInfo = {
  updateInfo: function(
      userId : any, 
      applicationId: string, 
      applicationVersion: string, 
      deviceInfo: DeviceInfo,
      isTransactional: boolean,
      insertUpdateAllFields: boolean
       ) {
        if(!isTransactional) {
          return 
        }else {
          SQL.connect(SQL_CONFIGURATION)
          .then((pool: any) => {
           //Stored procedure to update device info
           return pool
          .request()
          .input('userId', SQL.VarChar(64), userId)
          .input('applicationId', SQL.VarChar(64), applicationId)
          .input('applicationVersion', SQL.VarChar(64), applicationVersion)
          .input('isTransactiona', SQL.boolean, isTransactional)
          .input('insertUpdateAllFields', SQL.boolean, insertUpdateAllFields)
          .output('result', SQL.boolean)
          .execute('spne_UpdateUserDeviceInfoByPhoneNumber', 
          userId, 
          applicationId, 
          applicationVersion, 
          deviceInfo
          );
       }).then((result: any) => {
         const userUpdated = result === '1';
           if(userUpdated) {
             return true;
           }else {
             return false;
           }
       })

        }
        
     
  }
}

/**
 * Register User to voip Server.
 
 * @return it will return message.
 */

let regUserVoip = async (mob: string, pass: string) =>  {
    try {
      const params = {
        mode: 'add',
        PushEnabled: 'NotSpecified',
        UserStatus: 'NotSpecified'
        // mob: '123455677',
        // pass: '12345',
  
      };
      const config = {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'Axios',
            'key': 'voipSecretKey',
            'value': '12345'
        }
      };
      const res = await axios.post('http://rtsip.neeopal.com/NeoWeb/register.php', params, config, mob, pass);
        if(res) {
          return res.status(200).send({
            status: 200,
            code: 1,
            message: "user success updated",
            version: "1.0.0",
            data: { returnValue: true}
          });
        }else {
          return res.status(500).send({
            status: 500,
            code: -1,
            message: "fail to update user",
            version: "1.0.0",
            data: {}
          });
  
        }
       }catch (error) {
          return error.status(500).send({
            status: 500,
            code: -1,
            message: "fail",
            version: "1.0.0",
            error: error,
            data: {}
          });
       }
  }



  var IsPhoneNumberInInternationalFormat = {
    some: function(phone: string) {
      let internationalNumberPrefix = ["00", "+"];
      if (phone.length >= 2) {
        if (
          phone.substring(0, 2) != internationalNumberPrefix[0] &&
          phone.substring(0, 1) != internationalNumberPrefix[1]
        ) {
          return false;
        }
        return true;
      }
    }
  };
  
  let ValidatePhoneNumber = {
    some: function(pho: string) {
      try {
        var phoneNumberInfo = phoneUtil.Parse(pho, null);
        console.log("1" + " " + phoneNumberInfo);
        var isPossiblePhoneNumber = phoneUtil.IsPossibleNumber(phoneNumberInfo);
        console.log("2" + " " + isPossiblePhoneNumber);
        var isValidPhoneNumber = phoneUtil.IsValidNumber(phoneNumberInfo);
        console.log("3" + " " + isPossiblePhoneNumber);
        if (isPossiblePhoneNumber || isValidPhoneNumber) {
          var countryCode = phoneNumberInfo.CountryCode.ToString();
          console.log("4" + " " + countryCode);
          var numberWithoutCountryCode = pho.substring(
            countryCode.Length + 1,
            pho.length - (countryCode.Length + 1)
          );
          console.log("5" + " " + numberWithoutCountryCode);
          if (numberWithoutCountryCode.substring(0, 1) == "0") {
            return false;
          }
          return true;
        }
        return false;
      } catch (error) {
        return false;
      }
    }
  };
