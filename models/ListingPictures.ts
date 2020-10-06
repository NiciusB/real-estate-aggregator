import { Model, DataTypes } from 'sequelize'
import { sequelize } from '../src/db'

export default class ListingPictures extends Model {
  public id!: number
  public listingId!: number
  public originalUrl!: string
}

ListingPictures.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    listingId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    originalUrl: {
      type: new DataTypes.STRING(128),
      allowNull: false,
    },
  },
  {
    tableName: 'listing_pictures',
    sequelize,
    indexes: [
      {
        unique: true,
        fields: ['listingId', 'originalUrl'],
      },
    ],
  }
)
