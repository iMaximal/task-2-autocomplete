'use strict';
module.exports = {
    up: (queryInterface, Sequelize) => {
        queryInterface.createTable('cities', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            city_name: {
                type: Sequelize.STRING
            }
        });
    },
    down: (queryInterface, Sequelize) => queryInterface.dropTable('cities')
};
