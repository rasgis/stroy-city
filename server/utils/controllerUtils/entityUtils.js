import mongoose from "mongoose";
import { sendBadRequest, sendNotFound } from "./responseUtils.js";

/**
 * Проверяет существование сущности по ID
 * @param {Object} Model - Mongoose модель
 * @param {String} id - ID сущности
 * @param {Object} options - Дополнительные опции
 * @returns {Promise<Object|null>} - Найденная сущность или null
 */
export const checkEntityExists = async (Model, id, options = {}) => {
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

/**
 * Проверяет существование сущности и отправляет ошибку, если не найдена
 * @param {Object} res - Express response объект
 * @param {Object} Model - Mongoose модель
 * @param {String} id - ID сущности
 * @param {Object} options - Дополнительные опции
 * @param {String} entityName - Название сущности для сообщения об ошибке
 * @returns {Promise<Object|null>} - Найденная сущность или null после отправки ошибки
 */
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

/**
 * Проверяет уникальность поля в коллекции
 * @param {Object} Model - Mongoose модель
 * @param {Object} condition - Условие поиска
 * @param {Object} res - Express response объект
 * @param {String} errorMessage - Сообщение об ошибке при нарушении уникальности
 * @returns {Promise<boolean>} - true если проверка прошла успешно, false если сообщение об ошибке отправлено
 */
export const checkUniqueness = async (Model, condition, res, errorMessage) => {
  const exists = await Model.findOne(condition);

  if (exists) {
    sendBadRequest(res, errorMessage);
    return false;
  }

  return true;
};

/**
 * Создает базовый CRUD контроллер для модели
 * @param {Object} Model - Mongoose модель
 * @param {Object} options - Опции для контроллера
 * @returns {Object} - Объект с CRUD методами
 */
export const createBasicController = (Model, options = {}) => {
  const {
    entityName = "объект",
    populateFields = null,
    allowedFields = null,
  } = options;

  return {
    /**
     * Получение всех сущностей
     */
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

    /**
     * Получение сущности по ID
     */
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

    /**
     * Создание новой сущности
     */
    create: async (req, res) => {
      try {
        let entityData = req.body;

        // Если указаны разрешенные поля, фильтруем данные
        if (allowedFields) {
          entityData = Object.keys(entityData)
            .filter((key) => allowedFields.includes(key))
            .reduce((obj, key) => {
              obj[key] = entityData[key];
              return obj;
            }, {});
        }

        const entity = await Model.create(entityData);

        // Если указаны поля для популяции, получаем сущность с ними
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

    /**
     * Обновление сущности
     */
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

        // Если указаны разрешенные поля, фильтруем данные
        if (allowedFields) {
          updateData = Object.keys(updateData)
            .filter((key) => allowedFields.includes(key))
            .reduce((obj, key) => {
              obj[key] = updateData[key];
              return obj;
            }, {});
        }

        // Обновляем поля сущности
        Object.keys(updateData).forEach((key) => {
          entity[key] = updateData[key];
        });

        await entity.save();

        // Если указаны поля для популяции, получаем сущность с ними
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

    /**
     * Удаление сущности
     */
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
