import { Model, DataTypes } from 'sequelize'
import { sequelize } from '../src/db'

/* eslint-disable no-unused-vars */

export enum ListingType {
  Casa = 'Casa',
  ChaletPareado = 'ChaletPareado',
  Piso = 'Piso',
  Duplex = 'Duplex',
  Atico = 'Atico',
  Finca = 'Finca',
  Desconocido = 'Desconocido',
}

export default class Listing extends Model {
  public id!: number
  public site!: string
  public type!: ListingType
  public siteId!: string
  public eurPrice!: number
  public roomsCount!: number | null
  public squareMeters!: number | null
  public flatFloorNumber!: number | null
  public location!: string
  public latitude!: number | null
  public longitude!: number | null
  public areCoordiantesAccurate!: boolean | null
}

Listing.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    site: {
      type: new DataTypes.STRING(128),
      allowNull: false,
    },
    siteId: {
      type: new DataTypes.STRING(128),
      allowNull: false,
    },
    type: {
      type: new DataTypes.ENUM(...Object.values(ListingType)),
      allowNull: false,
    },
    eurPrice: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    roomsCount: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    squareMeters: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    flatFloorNumber: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    location: {
      type: new DataTypes.STRING(256),
      allowNull: false,
    },
    latitude: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    longitude: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    areCoordiantesAccurate: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
  },
  {
    tableName: 'listings',
    sequelize,
    indexes: [
      {
        unique: true,
        fields: ['site', 'siteId'],
      },
    ],
  }
)
