import dotenv from 'dotenv';
import path from 'path';

const root = path.join.bind(this, __dirname, '../');
dotenv.config({ path: root('.env') });

export const isDevelopment = process.env.NODE_ENV === 'development';
export const isProduction =
  process.env.NODE_ENV === 'production' || !isDevelopment;

export const port = process.env.PORT;
export const endpointURL = process.env.ENDPOINT_URL;
