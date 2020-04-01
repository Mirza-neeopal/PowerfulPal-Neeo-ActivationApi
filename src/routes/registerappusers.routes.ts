import { Router } from "express";

const router = Router();

import { RegisterUserController } from '../controller/RegisterUser.controller';

const registerUser = new RegisterUserController();

// RegisterUserController

router.post('/RegisterAppUser' , registerUser.RegisterUser);

export default router;


