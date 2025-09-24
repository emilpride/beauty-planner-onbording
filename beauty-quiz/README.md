# Beauty Mirror Quiz - Веб-онбординг

Персонализированный веб-онбординг для приложения Beauty Mirror, созданный с использованием Next.js, Firebase и Stripe.

## 🚀 Быстрый старт

### Предварительные требования

- Node.js (версия 18 или выше)
- Firebase CLI
- Аккаунт Firebase
- Аккаунт Stripe

### Установка

1. **Клонируйте репозиторий и установите зависимости:**
   ```bash
   cd beauty-quiz
   npm install
   ```

2. **Настройте переменные окружения:**
   ```bash
   cp env.example .env.local
   ```
   
   Заполните `.env.local` вашими ключами Firebase и Stripe.

3. **Инициализируйте Firebase:**
   ```bash
   firebase login
   firebase init
   ```

4. **Запустите проект в режиме разработки:**
   ```bash
   npm run dev
   ```

   Откройте [http://localhost:3000](http://localhost:3000) в браузере.

## 📁 Структура проекта

```
beauty-quiz/
├── app/                    # Next.js App Router
│   ├── quiz/[step]/       # Страницы квиза
│   ├── success/           # Страница успеха
│   ├── layout.tsx         # Главный layout
│   └── page.tsx           # Главная страница
├── components/            # React компоненты
│   ├── quiz/              # Компоненты шагов квиза
│   └── ImageUpload.tsx    # Компонент загрузки изображений
├── functions/             # Firebase Cloud Functions
│   └── src/
│       └── index.ts       # Основные функции
├── lib/                   # Утилиты и конфигурация
│   └── firebase.ts        # Конфигурация Firebase
├── store/                 # Zustand store
│   └── quizStore.ts       # Хранилище состояния квиза
└── public/                # Статические файлы
```

## 🎯 Функциональность

### Квиз (8 шагов)
1. **Личная информация** - имя, возраст, пол
2. **Тип кожи** - сухая, жирная, комбинированная, чувствительная, нормальная
3. **Проблемы кожи** - акне, старение, пигментация и др.
4. **Текущий уход** - уровень существующего ухода
5. **Бюджет** - экономный, средний, премиум
6. **Фото лица** - загрузка для AI-анализа
7. **Фото волос** - загрузка для комплексного анализа
8. **Подписка** - выбор тарифного плана

### Технические особенности
- **Responsive дизайн** - адаптивность для всех устройств
- **Загрузка изображений** - интеграция с Firebase Storage
- **AI-анализ** - обработка фотографий (заглушка)
- **Платежи** - интеграция со Stripe
- **Состояние** - управление через Zustand
- **Персистентность** - сохранение данных в localStorage

## 🔧 Настройка

### Firebase

1. Создайте проект в [Firebase Console](https://console.firebase.google.com/)
2. Включите следующие сервисы:
   - Authentication (анонимный вход)
   - Firestore Database
   - Storage
   - Functions
   - Hosting

3. Создайте отдельный сайт для квиза в разделе Hosting

### Stripe

1. Создайте аккаунт в [Stripe](https://stripe.com/)
2. Получите API ключи в разделе Developers
3. Настройте webhook для обработки событий

### Переменные окружения

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# AI API (опционально)
AI_API_KEY=your_ai_key
AI_API_URL=https://your-ai-endpoint.com
```

## 🚀 Деплой

### Локальное тестирование

```bash
# Запуск эмуляторов Firebase
firebase emulators:start

# В другом терминале - запуск Next.js
npm run dev
```

### Продакшн деплой

```bash
# Сборка проекта
npm run build

# Деплой на Firebase
firebase deploy --only hosting:quiz,functions
```

## 🔗 Интеграция с Flutter

После завершения онбординга данные сохраняются в Firestore:

```javascript
// Структура документа пользователя
{
  name: "Имя пользователя",
  age: 25,
  gender: "female",
  skinType: "combination",
  skinConcerns: ["acne", "aging"],
  currentRoutine: "basic",
  budget: "medium",
  faceImageUrl: "https://...",
  hairImageUrl: "https://...",
  aiAnalysis: { /* результаты анализа */ },
  subscription: {
    planId: "premium",
    status: "active",
    stripeCustomerId: "cus_...",
    startDate: "2024-01-01"
  },
  onboardingComplete: true,
  paymentCompleted: true
}
```

В Flutter приложении проверяйте поле `onboardingComplete` для определения необходимости прохождения онбординга.

## 🛠️ Разработка

### Добавление нового шага квиза

1. Создайте компонент в `components/quiz/`
2. Добавьте его в `app/quiz/[step]/page.tsx`
3. Обновите `totalSteps` в `store/quizStore.ts`

### Настройка AI-анализа

Замените моковые данные в `functions/src/index.ts` на реальную интеграцию с AI API.

### Кастомизация дизайна

Используйте Tailwind CSS классы и обновляйте `tailwind.config.js` для изменения цветовой схемы.

## 📝 Лицензия

MIT License - см. файл LICENSE для деталей.

## 🤝 Поддержка

Для вопросов и поддержки обращайтесь к команде разработки Beauty Mirror.



