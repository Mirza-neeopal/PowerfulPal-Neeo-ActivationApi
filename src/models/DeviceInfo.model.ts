export interface DeviceInfo {
    DeviceModel: string,
    OsVersion : string,
    DeviceVenderId: string,
    DeviceToken: string,
    DeviceTokenVoip: string
  }

  enum DevicePlatform {
   iOS = 1,
   Android = 2,
   WindowsMobile = 3
   //Tablet = 4,
   //Mac = 5
 }

 enum PushNotificationSource {
    Default = 1,
    Pushy = 2
 }