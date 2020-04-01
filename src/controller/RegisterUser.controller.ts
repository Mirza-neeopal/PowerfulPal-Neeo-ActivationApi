import { Request, Response, NextFunction, request } from 'express';
import { Client } from 'models/Client.model';
const SQL = require('mssql');
const SQL_CONFIGURATION = require('../configuration.json');
const phoneUtil = require("google-libphonenumber").PhoneNumberUtil.getInstance();
const axios = require('axios');

var crypto = require('crypto');
var fs = require('fs');


export class RegisterUserController {
    RegisterUser = async (
        request: Request, 
        response: Response,
        next : NextFunction
    ) => {
        try{  
            // take phone number as param
            const phoneNumber = request.params.phoneNumber;
          //take client object and map with interface
            const client = JSON.parse(request.params.client) as Client;
            const DVenID = client.dVentId;
            const AppVer = client.appVer;
            const Dp = client.dP;
            const AppId = client.appID;
            const DM = client.dM;
            const OsVer = client.osVer; 
   
            const userId = request.params.userId;
            if(
                phoneNumber === "" && client === null
            ) {
                return response.status(400).send({ error: "Enter Full information is  required" });
            }
           
            let internationalPhNo = "";

            let checkInter = IsPhoneNumberInInternationalFormat.some(phoneNumber);

            if(!checkInter) {
              internationalPhNo = '+' + phoneNumber;
            }else {
                internationalPhNo = phoneNumber;
            }

            console.log('phone number =' + phoneNumber);
            if(
                phoneNumber === null ||
                phoneNumber === "" ||
                phoneNumber === undefined ||
                !phoneNumber
            ) {
                return response.status(400).send({ error: "Phone Number is invalid" });
            }
            SQL.connect(SQL_CONFIGURATION)
            .then((pool:any) => {
                return pool
                .request()
                .execute('spne_CheckUserExistanceByPhoneNumber', phoneNumber);
            })
            .then((userExists: boolean) => {
                if(userExists === false) { 
                   unBlockUser.unblock(phoneNumber);
                   unBlockUser.createDirectory();
                   RegisterUserOnXmpp(phoneNumber, AppId, DVenID);
                   genDeviceKey.GenerateDeviceKey(phoneNumber, DVenID, AppId);
                  regUserVoip();                 
                }else {
                   upDateUserDeviceInfo.updateInfo(DVenID, AppId, AppVer)
                   genDeviceKey.GenerateDeviceKey(phoneNumber, DVenID, AppId);
                   const voipApi = regUserVoip();
                }
            }); 

    } catch(error) {
     response.status(500).send({error});
    }
  }
}






/**
 * Register User to Xmpp Server.
 * @param {string} phoneNumber The first params.
 * @param {string} deviceVenderID The second param.
 * @return it will send 201 status in sccess case.
 */


const xmppUrl = 'http://localhost:9090/plugins/userService/users';
let RegisterUserOnXmpp = async function registerXmpp(
    phoneNumber: string, 
    deviceVenderID: string, 
    applicationID: string,
    ) {
      const isAccountCreated = false;
      const isDirectoryStructureCreated = false;
     genDeviceKey.GenerateDeviceKey(phoneNumber, deviceVenderID, applicationID);
    try {
        const response = await axios.get(xmppUrl, {
            phNumber: phoneNumber,
            appID: applicationID,
            dVenId: deviceVenderID
        });
        return response //It will return 201 status only
    }catch (error) {
        return error;
    }
}

/**
 * Generate Device Key.
 * @param {string} phoneNumber The first params.
 * @param {string} deviceVenderID The second param.
 * * @param {string} applicationID The second param.
 * @return It will generate md5 hexadecimal string from MD5 encryption
 */

let genDeviceKey = {
    GenerateDeviceKey: function(phoneNumber: string, deviceVenderID: string, applicationID: string) {
      const hasingData: string = phoneNumber + deviceVenderID + applicationID;
      let hash = crypto.createHash('md5').update(hasingData).digest("hex")
      return hash;  
    }
}
/**
 * Update device Info.
 * @param {any} userId The first params.
 * @param {string}  applicationID The second param.
 * * @param {string} applicationVersion The second param.
 * @return 
 */
let upDateUserDeviceInfo = {
    updateInfo: function(
        userId : any, 
        applicationId: string, 
        applicationVersion: string, 
        
         ) {
          SQL.connect(SQL_CONFIGURATION)
           .then((pool: any) => {
            //Stored procedure to update device info
            return pool
           .request()
           .execute('spne_UpdateUserDeviceInfoByPhoneNumber', 
           userId, 
           applicationId, 
           applicationVersion, 
           
              );
            })
    }
}

/**
 * Register User to voip Server.
 
 * @return it will return message.
 */

const voipApi = 'http://rtsip.neeopal.com/NeoWeb/register.php';
let regUserVoip = async function registerVoip() {
    try {
        const response = await axios.get(voipApi, {
            mode: 'add',
            mob: '123456789',
            pass: '12345',
            Headers : {
                key: 'voipSecretKey',
                value: 12345
              }
        });
        return response;
    }catch (error) {
        return error;
    }
}

/**
 * UnBlock User through stored procedure.
* @param {any} phone The first params.
 * @return return ph number
 */


let unBlockUser = {
    unblock(phone: string) {
        SQL.connect(SQL_CONFIGURATION)
        .then((pool: any) => {
            //Stored procedure to unblock user
            return pool
            .request()
            .execute('spne_DeleteUserBlockedStateByPhoneNumber', phone);
        })
        .then((result: any) => {
            return result;// return ph number
          }); 
    },

    createDirectory() {
      const path = './server';
      if(!fs.existsSync(path)) {
        fs.mkdirSync(path);
      }
    }
}


var IsPhoneNumberInInternationalFormat = {
    some: function(phone: string) {
      //console.log(phone);
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
  
  var ValidatePhoneNumber = {
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