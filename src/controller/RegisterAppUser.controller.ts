import { Request, Response, NextFunction, request } from 'express';
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
let deviceInfo : DeviceInfo;
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
            // const deviceInfo = request.body.DeviceInfo as DeviceInfo;
            const DVenID = client.DVentId;
            const AppVer = client.AppVer;
            const AppId = client.AppID;
            const username = client.name;
            if(phoneNumber ===  '' && client === null) {
               return response.status(400).send({ error: "Enter Full information is  required" });
            }

            let internationalPhNo = "";

            let checkInter = IsPhoneNumberInInternationalFormat.some(phoneNumber);
            if(!checkInter) {
              internationalPhNo = '+' + phoneNumber;
            }else {
                internationalPhNo = phoneNumber;
            }

            console.log(internationalPhNo);
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
                if(userExist) {  //If Uder id not register
                  const unBlockDb = UnBlockUser.unblock(internationalPhNo); //UnBlock user from DB
                  const generatedDeviceKey = GenDeviceKey.generateDeviceKey(internationalPhNo, DVenID, AppId); //Generate DeviceKey 
                  if(generatedDeviceKey != null) {
                    
                    const createDirectory = UnBlockUser.createDirectory();  //Created Dictionary on Server

                    const createUserXmpp = createUser(username, generatedDeviceKey, internationalPhNo);
                      const upDateDeviceInfo = upDateUserDeviceInfo.updateInfo(DVenID, AppId, AppVer, deviceInfo, isTransactional, insertUpdateAllFields);
                     
                      const registerUserVoip = regUserVoip(internationalPhNo, generatedDeviceKey);
                      
                      return response.status(200).send({
                        status: 200,
                        code: 1,
                        message: "success",
                        version: "1.0.0",
                        data: { }
                      });
                        
                
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
                 
                }else {   // If user Is already register
                  const unBlockDb = UnBlockUser.unblock(internationalPhNo); //UnBlock user from DB
                  const generatedDeviceKey = GenDeviceKey.generateDeviceKey(internationalPhNo, DVenID, AppId);
                  if(generatedDeviceKey != null) {
                    const upDateDeviceInfo = upDateUserDeviceInfo.updateInfo(DVenID, AppId, AppVer, deviceInfo, isTransactional, insertUpdateAllFields);
                    const registerUserVoip = regUserVoip(internationalPhNo, generatedDeviceKey);
                    if(upDateDeviceInfo != null && registerUserVoip) {
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
 * Register User to Xmpp Server.
 * @param {string} phoneNumber The first params.
 * @param {string} deviceVenderID The second param.
 * @return it will send 201 status in sccess case.
 */



const createUser = async (username: string, password: string, userID: string) => {
    try {
        const data = {
            // username: 'test3',
            // password: 'start12234',
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
        const res = await axios.post('http://open.bnmax.com:9090/plugins/restapi/v1/users', username,password,userID, data, config);
        return true;
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
      applicationId: string, 
      applicationVersion: string, 
      deviceInfo: DeviceInfo,
      isTransactiona: boolean,
      insertUpdateAllFields: boolean
       ) {
        if(!isTransactiona) {
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
          .input('isTransactiona', SQL.boolean, isTransactiona)
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

