import { Sequelize } from 'sequelize'

export const sequelize = new Sequelize('real_estate_aggregator', 'postgres', '4040', {
  logging: false,
  dialect: 'postgres',
  host: 'localhost',
  port: 5432,
})
