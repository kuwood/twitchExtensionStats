'use strict'

// we need the Sequelize library in order to
// get the different data types for model properties
// (for instance, `Sequelize.string`).
const Sequelize = require('sequelize')
// we should only have one sequelize instance in our
// whole app, which we can import here and other model
// files.
const {sequelize} = require('../db/sequelize')

const Channel = sequelize.define('channel', {
    "twitch_id": {
      type: Sequelize.TEXT,
      allowNull: false
    },
    "username": {
      type: Sequelize.TEXT,
      allowNull: false
    },
    "game": {
      type: Sequelize.TEXT,
      allowNull: false
    },
    "title": {
      type: Sequelize.TEXT,
      allowNull: false
    },
    "view_count": {
      type: Sequelize.TEXT,
      allowNull: false
    },
  }, {
    // we explicitly tell Sequelize that this model is based
    // on a table called 'extension' instead of having Sequelize
    // automatically determine table names, which can be error
    // prone
    tableName: 'channels',
    underscored: true,
    classMethods: {
      // relations between models are declared in `.classMethods.associate`.
      associate: function(models) {
        Channel.belongsTo(
          models.Extension,
          {foreignKey: { allowNull: false },}
        );
      }
    }
  }
);

// Although we export `extension` here, any code that needs `extension`
// should import it from `./models/index.js` (so, for instance,
// `const {Extension} = require('./models')`).
module.exports = {
  Channel
}
