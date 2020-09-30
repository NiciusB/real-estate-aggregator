import { Sequelize } from 'sequelize'

export const sequelize = new Sequelize('postgres://localhost/real_estate_aggregator', {
  logging: false,
})
sequelize.sync()
