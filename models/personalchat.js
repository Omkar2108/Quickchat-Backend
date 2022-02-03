'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class personalchat extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
    toJSON(){
      return{
        ...this.get(),
        id:undefined,
        updatedAt:undefined
      }
    }
  }
  personalchat.init({
    to: {
      type:DataTypes.STRING,
      allowNull:false,
    },
    from: {
      type:DataTypes.STRING,
      allowNull:false,
    },
    msg: {
      type:DataTypes.STRING,
      allowNull:false,
    }
  }, {
    sequelize,
    modelName: 'personalchat',
  });
  return personalchat;
};