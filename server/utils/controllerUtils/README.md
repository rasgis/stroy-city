# Утилиты контроллеров для соблюдения принципа DRY

Данная директория содержит набор общих утилит, которые помогают избежать повторения кода в контроллерах и следовать принципу DRY (Don't Repeat Yourself).

## Основные утилиты

### authMiddleware.js

Содержит функции для проверки авторизации и прав доступа:

```javascript
import {
  checkAuth,
  createAuthMiddleware,
  requireAdmin,
} from "../utils/controllerUtils/index.js";
```

- **checkAuth**: Базовая функция для проверки авторизации
- **createAuthMiddleware**: Создает функцию middleware с заданными опциями
- **requireAdmin**: Готовый middleware для проверки прав администратора

### responseUtils.js

Унифицирует создание ответов API:

```javascript
import {
  sendSuccess,
  sendCreated,
  sendMessage,
  sendError,
  sendNotFound,
  sendBadRequest,
  sendForbidden,
} from "../utils/controllerUtils/index.js";
```

- **sendSuccess**: Отправляет успешный ответ (200 OK)
- **sendCreated**: Отправляет ответ о создании ресурса (201 Created)
- **sendMessage**: Отправляет сообщение об успешном действии
- **sendError**: Отправляет ошибку с указанным кодом
- **sendNotFound**: Отправляет ошибку "Не найдено" (404)
- **sendBadRequest**: Отправляет ошибку "Неверный запрос" (400)
- **sendForbidden**: Отправляет ошибку "Доступ запрещен" (403)

### entityUtils.js

Содержит функции для типовых операций с сущностями:

```javascript
import {
  checkEntityExists,
  checkEntityExistsOrFail,
  checkUniqueness,
  createBasicController,
} from "../utils/controllerUtils/index.js";
```

- **checkEntityExists**: Проверяет существование сущности
- **checkEntityExistsOrFail**: Проверяет и возвращает ошибку, если сущность не найдена
- **checkUniqueness**: Проверяет уникальность значения в базе данных
- **createBasicController**: Создает базовый CRUD-контроллер для модели

## Применение в контроллерах

Пример использования в контроллере:

```javascript
import {
  sendSuccess,
  sendCreated,
  sendMessage,
  sendError,
  checkEntityExistsOrFail,
} from "../utils/controllerUtils/index.js";

// Получение сущности по ID
export const getById = asyncHandler(async (req, res) => {
  try {
    const entity = await checkEntityExistsOrFail(
      res,
      Model,
      req.params.id,
      { populate: "relatedField" },
      "Сущность"
    );

    if (!entity) return; // Ошибка уже отправлена в checkEntityExistsOrFail

    sendSuccess(res, entity);
  } catch (error) {
    sendError(res, `Ошибка при получении: ${error.message}`);
  }
});
```

## Преимущества использования утилит

1. **Единообразие кода** - все контроллеры используют одинаковый формат ответов
2. **Сокращение дублирования** - общая логика вынесена в утилиты
3. **Улучшение читаемости** - контроллеры становятся короче и понятнее
4. **Упрощение поддержки** - изменения в общей логике требуют правок только в утилитах
5. **Повышение безопасности** - централизованная проверка прав доступа
