export interface DeviceInfo {
    DeviceModel: string,
    OsVersion : string,
    DeviceVenderId: string,
    DeviceToken: string,
    DeviceTokenVoip: string
  }

  export enum DevicePlatform {
   iOS = 1,
   Android = 2,
   WindowsMobile = 3
   //Tablet = 4,
   //Mac = 5
 }

 export enum PushNotificationSource {
    Default = 1,
    Pushy = 2
 }