'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await Promise.all([
        queryInterface.addColumn(
          'listing_pictures',
          'imgBlob',
          {
            type: Sequelize.DataTypes.BLOB,
          },
          { transaction }
        ),
        queryInterface.addColumn(
          'listing_pictures',
          'imgHash',
          {
            type: new Sequelize.DataTypes.STRING(512),
          },
          { transaction }
        ),
      ])
      await queryInterface.addIndex('listing_pictures', ['imgHash'], {
        indexName: 'pic_hash',
        transaction,
      })
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeIndex('listing_pictures', 'pic_hash', { transaction })
      await Promise.all([
        queryInterface.removeColumn('listing_pictures', 'imgBlob', { transaction }),
        queryInterface.removeColumn('listing_pictures', 'imgHash', { transaction }),
      ])
    })
  },
}
