import { Model, DataTypes } from 'sequelize'
import { sequelize } from '../src/db'

export default class ListingPictures extends Model {
  public id!: number
  public listingId!: number
  public originalUrl!: string
  public imgBlob!: Buffer
  public imgHash!: string
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
    imgBlob: {
      type: DataTypes.BLOB,
      allowNull: true,
    },
    imgHash: {
      type: new DataTypes.STRING(1024),
      allowNull: true,
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
      {
        fields: ['imgHash'],
      },
    ],
  }
)
