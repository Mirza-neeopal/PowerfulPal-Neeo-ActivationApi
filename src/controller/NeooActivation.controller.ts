import { Request, Response, NextFunction, request } from 'express';
import { DeviceInfo } from 'models/DeviceInfo.model';
import { Client } from 'models/Client.model';
const SQL = require('mssql');
const SQL_CONFIGURATION = require('../configuration.json');

const phoneUtil = require("google-libphonenumber").PhoneNumberUtil.getInstance();

export class NeeoActivationController {
    NeeoActivation = async (
        request: Request, 
        response: Response,
        next : NextFunction
    ) => {
        try{
            // Params list
            const operationID = request.body.opID;
            const phoneNumber = request.body.uID;  //UserId is Phone number       
            const deviceToken = request.body.deviceToken;
            const client = request.body.client as Client;
            const appID = client.AppID;
            const appVer = client.AppVer;
            const dP = client.devicePlatform;
            const dVendID = client.DVentId;
            
           
            if(!deviceToken) {
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

                // const valPhoneNumber = ValidatePhoneNumber.some(internationalPhNo);
    
                // console.log(valPhoneNumber + "Valid number");
    
                if(
                    internationalPhNo === null ||
                    internationalPhNo === "" ||
                    internationalPhNo === undefined ||
                    !internationalPhNo
                  ) {
                      return response.status(400).send({ error: "Phone Number is invalid" });
                  }else {

                    UpdateUserDeviceInfo(internationalPhNo, appID, appVer, dP, dVendID)
                    return response.status(200).send({ success: true });
                  }
               
            }
            else {
                return response.status(400).send({ error: false });
            }
        }
        catch(error) {
            response.status(500).send({error});
        }
    }
}

/**
 * Update User Device token in the xmpp database and voip server.
 * @param {string} applicationVersion The first params.
 * @param {string} deviceInfo The second param.
 * @param {string} isUpdatingDToken The second param.
 * @return it will send 201 status in sccess case.
 */

 let UpdateUserDeviceInfo = async function updateUserDInfo(
       phNo: string,
       applicationID: string,
       applicationVersion: string,
       devicePlatform: string,
       deviceVenderID: string
 ){
     const isTransactional : boolean = false;
     const insertUpdateAllFields: boolean = false;
     SQL.connect(SQL_CONFIGURATION)
         .then((pool: any) => {
            return pool.request()
            .input('phoneNumber', SQL.VarChar(64), phNo)
            .input('applicationID', SQL.VarChar(36), applicationID)
            .input('applicationVersion', SQL.VarChar(36), applicationVersion)
            .input('deviceVenderID', SQL.VarChar(36), deviceVenderID)
            .input('devicePlatform', SQL.Int, devicePlatform)
            .output('userExists', SQL.Int)
            .execute('dbo.spne_UpdateUserDeviceInfoByPhoneNumber', phNo, applicationID, applicationVersion, devicePlatform, deviceVenderID);
         })
         .then((result: any) => {
             console.log(result);
         })
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