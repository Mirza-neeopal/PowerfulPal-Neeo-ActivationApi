import { Request, Response, NextFunction } from 'express';
import { Client } from 'models/Client.model';
import { DeviceInfo } from 'models/DeviceInfo.model';

const SQL = require('mssql');
const SQL_CONFIGURATION = require('../configuration.json');
const phoneUtil = require("google-libphonenumber").PhoneNumberUtil.getInstance();
const axios = require('axios');


var crypto = require('crypto');
var fs = require('fs');

let isTransactional: boolean;
let insertUpdateAllFields: boolean;


export class RegisterAppUserController {
    RegisterAppUser = async (
        request: Request, 
        response: Response,
        next : NextFunction
    ) => {
        try{ 
            // Params list
            const phoneNumber = request.body.ph;
            const client = request.body.client as Client;
            const deviceInfo = request.body.DeviceInfo as DeviceInfo;
            const devicePlateForm = deviceInfo.DevicePlateform;
            const dVenderID = deviceInfo.DeviceVenderId;
            const AppVer = client.AppVer;
            const AppId = client.AppID;
            const deviceToken = deviceInfo.DeviceToken;
            const deviceTokenVoIP = deviceInfo.DeviceTokenVoip;
            const deviceModel = deviceInfo.DeviceModel;
            const osVersion = deviceInfo.OsVersion;
            const pnSource = deviceInfo.PushNotificationSource;
            if(phoneNumber ===  '') {
              return response.status(500).send({
                status: 400,
                code: -1,
                message: "fail",
                version: "1.0.0",
                error: "error",
                data: { message: 'Phone Number is not provided'}
              });
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
              }else 
              SQL.connect(SQL_CONFIGURATION)
               .then((pool:any) => {
                return pool.request()
                .input('phoneNumber', SQL.VarChar(64), internationalPhNo)
                .output('userExists', SQL.boolean)
                .execute('spne_CheckUserExistanceByPhoneNumber', internationalPhNo);
            })
            .then((result: any) => {
              console.log(result);
                const userExist = result.output.userExist === '0';

                if(userExist) {  //If user not exist in DB 
                 
                  const generatedDeviceKey = GenDeviceKey.generateDeviceKey(internationalPhNo, dVenderID, AppId); //Generate DeviceKey     
                  if(generatedDeviceKey != null) {

                    const unBlockDb = UnBlockUser.unblock(internationalPhNo); //UnBlock user from DB

                    const createDirectory = UnBlockUser.createDirectory();  //Created Dictionary on Server

                    const registerUserXmpp = registerUserOnXmpp(internationalPhNo,generatedDeviceKey, AppId, AppVer, deviceInfo);  //Registrate user on Xmpp

                    const upDatedDeviceTokenInfo = upDateUserDeviceInfo.updateInfo(internationalPhNo, devicePlateForm, dVenderID, AppId??"", deviceToken??"",
                      deviceTokenVoIP??"", AppVer??"", deviceModel??"", osVersion??"", pnSource, isTransactional, insertUpdateAllFields);
                     
                    const registerUserVoip = regUserVoip(internationalPhNo, generatedDeviceKey);
                    if(upDatedDeviceTokenInfo != null && registerUserVoip) {
                      return response.status(200).send({
                        status: 200,
                        code: 1,
                        message: "success",
                        version: "1.0.0",
                        data: { message: 'User is register in all cases'}
                      });
                    } else {
                      return response.status(500).send({
                        status: 500,
                        code: -1,
                        message: "fail",
                        version: "1.0.0",
                        error: "error",
                        data: { message: 'User is not generated'}
                      });
                    }
                  }else {
                    return response.status(500).send({
                      status: 500,
                      code: -1,
                      message: "fail",
                      version: "1.0.0",
                      error: "error",
                      data: { message: 'Device key is not generated'}
                    });
                  }
                 
                }else {   // If user Is already exist in DB
                  const unBlockDb = UnBlockUser.unblock(internationalPhNo); //UnBlock user from DB

                  const generatedDeviceKey = GenDeviceKey.generateDeviceKey(internationalPhNo, dVenderID, AppId);//Device 

                  if(generatedDeviceKey != null) {

                    const registerUserXmpp = registerUserOnXmpp(internationalPhNo, generatedDeviceKey, AppId, AppVer, deviceInfo);  //Registrate user on Xmpp

                    const upDatedDeviceTokenInfo = upDateUserDeviceInfo.updateInfo(internationalPhNo, devicePlateForm, dVenderID, AppId??"", deviceToken??"",
                      deviceTokenVoIP??"", AppVer??"", deviceModel??"", osVersion??"", pnSource, isTransactional, insertUpdateAllFields);

                    const registerUserVoip = regUserVoip(internationalPhNo, generatedDeviceKey);
                    if(upDatedDeviceTokenInfo != null && registerUserVoip) {
                      return response.status(200).send({
                        status: 200,
                        code: 1,
                        message: "success",
                        version: "1.0.0",
                        data: { returnValue: result.recordset[0] }
                      });
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
                  }else {
                    return response.status(500).send({
                      status: 500,
                      code: -1,
                      message: "fail",
                      version: "1.0.0",
                      error: "error",
                      data: { message: 'Device key is not generated'}
                    });
                  }
                }
            })
        }
        catch(error) {
          return response.status(500).send({
            status: 500,
            code: -1,
            message: "fail",
            version: "1.0.0",
            error: error,
            data: {}
          });
    
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


/**
 * Register User to rtsip Server.
 * @return it will return message.
 */

let regUserRtsip = async (mob: string, pass: string) =>  {
  try {
    const params = {
     username: 'WebApp',
     password: 'A@$i1U&fK8',
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

/**
 * Register User to Xmpp Server.
 * @param {string} phoneNumber The first params.
 * @param {string} applicationID The second param.
 * @param {string} applicationVersion The second param.
 * @param {object} deviceInfo The second param.
 * @return true if user account is successfully registered on XMPP server; otherwise, false.
 */



const registerUserOnXmpp = async (phoneNumber: string, password: string, applicationID: string, applicationVersion: string, deviceInfo: Object) => {
    try {
        const data = {
            username: 'test3',
            //password: 'start12234',
            // name: '',
            email: 'test3@example.com'
        };

        // request config that includes `headers`
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Axios',
                'Authorization': 'B8z0WBmnxZRoHRbv'
            }
        };
        const addUser = await axios.post('http://open.bnmax.com:9090/plugins/restapi/v1/users', phoneNumber, password, 
        deviceInfo, applicationID, applicationVersion, data, config);
        if(addUser.status=== 201) {
          return true;
        }     
    } catch (err) {
        const error = JSON.stringify(err.name);
        if(error === 'Error') {
            return false;
        }else {
            return;
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
      devicePlatform: string,
      deviceVenderId: string,
      applicationId: string, 
      deviceToken: string,
      deviceTokenVoIP: string,
      applicationVersion: string, 
      deviceModel: string,
      osVersion: string,
      pnSource: number,
      isTransactional: boolean,
      insertUpdateAllColumns: boolean
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
          .input('devicePlatform', SQL.VarChar(64), devicePlatform)
          .input('deviceVenderId', SQL.VarChar(64), deviceVenderId)
          .input('applicationId', SQL.VarChar(64), applicationId)
          .input('deviceToken', SQL.VarChar(64), deviceToken)
          .input('deviceTokenVoIP', SQL.VarChar(64), deviceTokenVoIP)
          .input('applicationVersion', SQL.VarChar(64), applicationVersion)
          .input('deviceModel', SQL.VarChar(64), deviceModel)
          .input('osVersion', SQL.VarChar(64), osVersion)
          .input('pnSource', SQL.VarChar(64), pnSource)
          .input('isTransactiona', SQL.boolean, isTransactional)
          .input('insertUpdateAllFields', SQL.boolean, insertUpdateAllColumns)
          .output('result', SQL.boolean)
          .execute('spne_UpdateUserDeviceInfoByPhoneNumber', 
          userId, 
          devicePlatform,
          deviceVenderId,
          applicationId, 
          deviceToken,
          deviceTokenVoIP,
          applicationVersion, 
          deviceModel,
          osVersion,
          pnSource
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
 * Generate Device Key.
 * @param {string} phoneNumber The first params.
 * @param {string} deviceVenderID The second param.
 * * @param {string} applicationID The second param.
 * @return It will generate md5 hexadecimal string from MD5 encryption
 */

const GenDeviceKey = {
  generateDeviceKey: function(
    phoneNumber: string, 
    deviceVenderID: string, 
    applicationID: string
    ) {
    const hasingData: string = phoneNumber + deviceVenderID + applicationID;
    let hash = crypto.createHash('md5').update(hasingData).digest("hex")
    return hash;  
  }
}


let UnBlockUser = {
    unblock(phone: any) {
        SQL.connect(SQL_CONFIGURATION)
        .then((pool: any) => {
            //Stored procedure to unblock user
            return pool
            .request()
            .input('phoneNumber', SQL.VarChar(64), phone)
            .output('outPut', SQL.VarChar(64), )
            .execute('spne_DeleteUserBlockedStateByPhoneNumber', phone);
        })
        .then((result: any) => {
          return result;
          
          }).catch((err: any) => {
            return err;
          }) 
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

