const env = process.env.NODE_ENV || 'development'

// default to dev database
const DATABASE_URL = (
  process.env.DATABASE_URL ||
  global.DATABASE_URL ||
  `postgres://${process.env.DB_USER}:${process.env.DB_PW}@localhost:5432/twitch_extensions`
);

const TEST_DATABASE_URL = (
  process.env.TEST_DATABASE_URL ||
  global.TEST_DATABASE_URL ||
  `postgres://${process.env.DB_USER}:${process.env.DB_PW}@localhost:5432/twitch_extensions_TEST`);

module.exports = {
    PORT: process.env.PORT || 8080,
    // if we're in test environment, we use the test database url,
    // otherwise DATABASE_URl, which defaults to dev
    DATABASE_URL: env === 'test' ? TEST_DATABASE_URL : DATABASE_URL,
    // see http://docs.sequelizejs.com/en/latest/api/sequelize/#new-sequelizedatabase-usernamenull-passwordnull-options
    SEQUELIZE_OPTIONS: {
      dialect: `postgres`,
      logging: env === 'test' ? false : console.log
    }
};

