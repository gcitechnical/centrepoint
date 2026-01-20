import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';

config();

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DATABASE_USERNAME || 'centrepoint',
  password: process.env.DATABASE_PASSWORD || 'centrepoint_dev_2026',
  database: process.env.DATABASE_NAME || 'centrepoint_dev',
  entities: [__dirname.includes('dist') ? __dirname + '/../../**/*.entity.js' : __dirname + '/../../**/*.entity.ts'],
  migrations: [__dirname.includes('dist') ? __dirname + '/migrations/*.js' : __dirname + '/migrations/*.ts'],
  synchronize: process.env.DATABASE_SYNCHRONIZE === 'true',
  logging: process.env.DATABASE_LOGGING === 'true',
};

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;
