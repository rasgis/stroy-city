import mongoose from "mongoose";
import { sendBadRequest, sendNotFound } from "./responseUtils.js";

export const checkEntityExists = async (Model, id, options = {}) => { // проверка существования сущности
  const { populate = null, select = null } = options;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return null;
  }

  let query = Model.findById(id);

  if (populate) {
    query = query.populate(populate);
  }

  if (select) {
    query = query.select(select);
  }

  return await query;
};

export const checkEntityExistsOrFail = async (
  res,
  Model,
  id,
  options = {},
  entityName = "Объект"
) => {
  const entity = await checkEntityExists(Model, id, options); 

  if (!entity) {
    sendNotFound(res, `${entityName} не найден`);
    return null;
  }

  return entity;
};

export const checkUniqueness = async (Model, condition, res, errorMessage) => { 
  const exists = await Model.findOne(condition);

  if (exists) {
    sendBadRequest(res, errorMessage);
    return false;
  }

  return true;
};

export const createBasicController = (Model, options = {}) => { 
  const {
    entityName = "объект",
    populateFields = null,
    allowedFields = null,
  } = options;

  return {

    getAll: async (req, res) => { 
      try {
        let query = Model.find(); 

        if (populateFields) {
          query = query.populate(populateFields); 
        }

        const entities = await query;

        res.status(200).json(entities);
      } catch (error) {
        res.status(500).json({
          message: `Ошибка при получении ${entityName}ов: ${error.message}`,
        });
      }
    },

    getById: async (req, res) => { 
      try {
        const entity = await checkEntityExistsOrFail(
          res,
          Model,
          req.params.id,
          { populate: populateFields },
          entityName
        );

        if (!entity) return;

        res.status(200).json(entity);
      } catch (error) {
        res.status(500).json({
          message: `Ошибка при получении ${entityName}а: ${error.message}`,
        });
      }
    },

    create: async (req, res) => { 
      try {
        let entityData = req.body;

        if (allowedFields) {
          entityData = Object.keys(entityData)
            .filter((key) => allowedFields.includes(key))
            .reduce((obj, key) => {
              obj[key] = entityData[key];
              return obj;
            }, {});
        }

        const entity = await Model.create(entityData);

        let result = entity;
        if (populateFields) {
          result = await Model.findById(entity._id).populate(populateFields);
        }

        res.status(201).json(result);
      } catch (error) {
        res.status(500).json({
          message: `Ошибка при создании ${entityName}а: ${error.message}`,
        });
      }
    },

    update: async (req, res) => {
      try {
        const entity = await checkEntityExistsOrFail(
          res,
          Model,
          req.params.id,
          {},
          entityName
        );

        if (!entity) return;

        let updateData = req.body;

        if (allowedFields) {
          updateData = Object.keys(updateData)
            .filter((key) => allowedFields.includes(key))
            .reduce((obj, key) => {
              obj[key] = updateData[key];
              return obj;
            }, {});
        }

        Object.keys(updateData).forEach((key) => {
          entity[key] = updateData[key];
        });

        await entity.save();

        let result = entity;
        if (populateFields) {
          result = await Model.findById(entity._id).populate(populateFields);
        }

        res.status(200).json(result);
      } catch (error) {
        res.status(500).json({
          message: `Ошибка при обновлении ${entityName}а: ${error.message}`,
        });
      }
    },

    delete: async (req, res) => {
      try {
        const entity = await checkEntityExistsOrFail(
          res,
          Model,
          req.params.id,
          {},
          entityName
        );

        if (!entity) return;

        await entity.deleteOne();

        res.status(200).json({ message: `${entityName} успешно удален` });
      } catch (error) {
        res.status(500).json({
          message: `Ошибка при удалении ${entityName}а: ${error.message}`,
        });
      }
    },
  };
};
