'use strict'

// we need the Sequelize library in order to
// get the different data types for model properties
// (for instance, `Sequelize.string`).
const Sequelize = require('sequelize')
// we should only have one sequelize instance in our
// whole app, which we can import here and other model
// files.
const {sequelize} = require('../db/sequelize')

const Extension = sequelize.define('extension', {
    twitch_ext_id: {
      type: Sequelize.STRING,
      allowNull: false
    },
    state: {
      type: Sequelize.STRING,
      allowNull: false
    },
    version: {
      type: Sequelize.STRING,
      allowNull: false
    },
    anchor: {
      type: Sequelize.STRING,
      allowNull: false
    },
    panel_height: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    author_name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    support_email: {
      type: Sequelize.STRING,
      allowNull: false
    },
    name: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    summary: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    viewer_url: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    config_url: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    live_config_url: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    icon_url: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    screenshot_urls: {
      type: Sequelize.ARRAY(Sequelize.TEXT),
      allowNull: true
    },
    asset_urls: {
      type: Sequelize.ARRAY(Sequelize.TEXT),
      allowNull: true
    },
    installation_count: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    can_install: {
      type: Sequelize.BOOLEAN,
      allowNull: false
    },
    whitelisted_panel_urls: {
      type: Sequelize.ARRAY(Sequelize.TEXT),
      allowNull: true
    },
    whitelisted_config_urls: {
      type: Sequelize.ARRAY(Sequelize.TEXT),
      allowNull: true
    },
    required_broadcaster_abilities: {
      type: Sequelize.ARRAY(Sequelize.TEXT),
      allowNull: true
    },
    eula_tos_url: {
      type: Sequelize.STRING,
      allowNull: true
    },
    privacy_policy_url: {
      type: Sequelize.STRING,
      allowNull: true
    },
    request_identity_link: {
      type: Sequelize.BOOLEAN,
      allowNull: false
    },
    vendor_code: {
      type: Sequelize.STRING,
      allowNull: true
    },
    sku: {
      type: Sequelize.STRING,
      allowNull: true
    },
  }, {
    // we explicitly tell Sequelize that this model is based
    // on a table called 'extension' instead of having Sequelize
    // automatically determine table names, which can be error
    // prone
    tableName: 'extensions',
    underscored: true,

    classMethods: {
      // relations between models are declared in `.classMethods.associate`.
      associate: function(models) {
        Extension.hasMany(
          models.Channel,
          {
            as: 'Channels',
            foreignKey: { allowNull: false },
          });
      }
    }
  }
);

// Although we export `extension` here, any code that needs `extension`
// should import it from `./models/index.js` (so, for instance,
// `const {Extension} = require('./models')`).
module.exports = {
  Extension
}
