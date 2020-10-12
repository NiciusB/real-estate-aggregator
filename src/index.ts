import 'core-js' // Polyfills for ES2020
import * as dotenv from 'dotenv'
dotenv.config()

import('./main').then((module) => module.default())
