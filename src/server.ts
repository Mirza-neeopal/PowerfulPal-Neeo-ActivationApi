import { config } from 'dotenv';
import app from './app';

config()

const App = new app().app
const start = () => {
   App.listen(process.env.PORT, () => { console.log(`Server up: http://localhost: ${process.env.Port}`) });
};

start();
