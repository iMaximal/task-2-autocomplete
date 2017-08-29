'use strict';
module.exports = (sequelize, DataTypes) => {
    const cities = sequelize.define('cities', {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        city_name: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        tableName: 'cities'
    });
    return cities;
};
