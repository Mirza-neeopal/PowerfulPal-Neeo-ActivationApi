import { Router } from "express";

const router = Router();

import { RegisterAppUserController } from '../controller/RegisterAppUser.controller';
import { NeeoActivationController } from '../controller/NeooActivation.controller'

const registerAppUser = new RegisterAppUserController();
const neeoActivation = new NeeoActivationController();


router.post('/RegisterAppUser' , registerAppUser.RegisterAppUser);

router.post('/DeviceToken', neeoActivation.NeeoActivation)

export default router;


