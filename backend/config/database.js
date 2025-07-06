const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('classversev5', 'postgres', 'irad', {
    host: 'localhost',
    dialect: 'postgres'
});

sequelize.authenticate()
    .then(() => console.log('Connected to the database'))
    .catch(err => console.error('Unable to connect to the database:', err));

module.exports = sequelize;
