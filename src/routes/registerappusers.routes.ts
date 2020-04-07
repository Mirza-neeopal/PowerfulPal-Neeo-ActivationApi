import { Router } from "express";

const router = Router();

import { RegisterAppUserController } from '../controller/RegisterAppUser.controller';
import { NeeoActivationController } from '../controller/NeooActivation.controller'
import { CheckAppCompatibilityController } from "../controller/CheckAppCompatibilty.controller";

const registerAppUser = new RegisterAppUserController();
const neeoActivation = new NeeoActivationController();
const checkAppCompatibility = new CheckAppCompatibilityController();


router.post('/RegisterAppUser' , registerAppUser.RegisterAppUser);

router.post('/DeviceToken', neeoActivation.NeeoActivation);

router.post('/CheckAppCompatibility', checkAppCompatibility.CheckAppCompatibilty);

export default router;


