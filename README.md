# **Project Onboarding: The Beauty Mirror Quiz**

Этот документ описывает полный процесс создания, тестирования и развёртывания веб\-онбординга для приложения Beauty Mirror.

## **🎯 Цель проекта**

Создать легковесный, быстрый и стабильный веб\-онбординг в виде квиза. Пользователь проходит опрос, загружает фото, получает AI-анализ, настраивает процедуры и оплачивает подписку. После этого его данные бесшовно передаются в основное Flutter-приложение.

## **🛠️ Технологический стек**

| Компонент | Технология |
| :---- | :---- |
| **Фронтенд** | Next.js (React \+ TypeScript) |
| **Стилизация** | Tailwind CSS |
| **Хостинг и Бэкенд** | Firebase (Hosting \+ Cloud Functions) |
| **База данных** | Firebase Firestore |
| **Хранилище файлов** | Firebase Storage |
| **Платежи** | Stripe \+ RevenueCat |
| **IDE** | Cursor IDE |

---

## **Фаза 0: Настройка окружения**

Перед началом убедитесь, что у вас установлены:

* ✅ [**Node.js**](https://nodejs.org/en/) (последняя LTS-версия)  
* ✅ **Firebase CLI:**  
* Bash

npm install \-g firebase-tools

*   
*   
* ✅ **Аккаунт Firebase и Stripe**

---

## **Фаза 1: Инициализация проекта**

#### **1\. Настройка проекта Firebase**

* В [консоли Firebase](https://console.firebase.google.com/) откройте ваш основной проект.  
* Убедитесь, что активированы: **Firestore, Storage, Authentication** (включите "Анонимный вход").

#### **2\. Создание отдельного сайта для квиза**

Мы используем мульти-хостинг, чтобы не затрагивать ваше основное веб\-приложение.

1. Перейдите в раздел **Hosting**.  
2. Нажмите **"Добавить еще один сайт"**.  
3. Назовите его quiz-beautymirror-app (или похоже).  
4. Сразу после создания, нажмите **"Подключить домен"** и добавьте quiz.beautymirror.app. Следуйте инструкциям Firebase для добавления DNS-записей у вашего доменного регистратора.

#### **3\. Создание локального проекта Next.js**

Bash

npx create-next-app@latest beauty-quiz \--typescript \--tailwind \--eslint

cd beauty-quiz

#### **4\. Инициализация Firebase в проекте**

1. Выполните команду firebase login и firebase init.  
2. Выберите следующие опции:  
   * Firestore: Configure security rules and indexes files for Firestore  
   * Functions: Configure a Functions directory and related files  
   * Hosting: Configure files for Firebase Hosting...  
   * Storage: Configure security rules file for Cloud Storage  
3. Выберите ваш существующий проект Firebase.  
4. **ВАЖНО:** Когда CLI спросит Which site would you like to use for this directory?, выберите **именно тот сайт, который вы создали на шаге 2** (quiz-beautymirror-app).  
5. **Functions:** Выберите TypeScript, установите зависимости.  
6. **Hosting:** В качестве public directory укажите out. Configure as a single-page app? \-\> No.

#### **5\. Настройка целей деплоя (Deploy Targets)**

Откройте файл **.firebaserc** и приведите его к такому виду, чтобы связать проект с нужным сайтом:

JSON

{

  "projects": {

    "default": "\<your-firebase-project-id\>"

  },

  "targets": {

    "\<your-firebase-project-id\>": {

      "hosting": {

        "quiz": \[

          "quiz-beautymirror-app"

        \]

      }

    }

  }

}

#### **6\. Конфигурация firebase.json**

Замените содержимое **firebase.json** на следующее. Это настроит SSR для Next.js.

JSON

{

  "functions": {

    "source": "functions",

    "runtime": "nodejs20"

  },

  "hosting": \[

    {

      "target": "quiz",

      "public": "out",

      "cleanUrls": true,

      "rewrites": \[

        {

          "source": "\*\*",

          "function": "nextServer"

        }

      \]

    }

  \]

}

---

## **Фаза 2: Разработка с Cursor IDE**

Откройте проект в Cursor. Мы будем активно использовать его AI-возможности.

### **А. Фронтенд: Квиз**

#### **1\. Управление состоянием (Zustand)**

* Установите: npm install zustand  
* Создайте файл store/quizStore.ts для хранения всех ответов пользователя. Используйте Cmd/Ctrl+K и промпт:  
  "Создай хранилище Zustand для многошагового квиза. Оно должно содержать объект answers со всеми полями из моего Flutter-проекта (name, age, gender, skinType и т.д.), а также функции для обновления полей setAnswer и перехода между шагами nextStep, prevStep."

#### **2\. Перенос UI из Flutter с помощью Cursor AI**

Это ключевой шаг для ускорения работы.

1. **Откройте файлы рядом:** слева — ваш старый .dart файл с UI, справа — новый .tsx файл компонента в app/quiz/\[step\]/.  
2. **Выделите код Flutter-виджета**.  
3. Нажмите Cmd/Ctrl \+ L (Edit/Generate with AI).  
4. Используйте детальный промпт:  
   Промпт для Cursor:  
   "Переведи этот Flutter-виджет на React-компонент, используя TypeScript и Tailwind CSS.  
   * Структура должна быть максимально похожей.  
   * Используй onChange для инпутов, чтобы вызывать функцию setAnswer('fieldName', value) из хранилища Zustand.  
   * Текущее значение для инпутов бери из answers.fieldName.  
   * Для кнопок используй компонент \<button\> со стилями Tailwind."  
5. **Доработка:** AI создаст 90% кода. Вам останется доработать стили и убедиться, что логика привязана к состоянию правильно.

#### **3\. Загрузка фото в Firebase Storage**

* Создайте компонент для загрузки (ImageUpload.tsx).  
* Логика загрузки:  
* TypeScript

// lib/firebase.ts \- ваш файл с инициализацией Firebase

import { getStorage } from "firebase/storage";

...

export const storage \= getStorage(app);

*   
* TypeScript

// components/ImageUpload.tsx

import { storage } from '../lib/firebase';

import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

import { useQuizStore } from '../store/quizStore';

const handleUpload \= async (file: File, userId: string, type: 'face' | 'hair') \=\> {

  if (\!file || \!userId) return;

  const storageRef \= ref(storage, \`onboarding/${userId}/${type}\-${Date.now()}\`);

  try {

    await uploadBytes(storageRef, file);

    const downloadURL \= await getDownloadURL(storageRef);

    useQuizStore.getState().setAnswer(\`${type}ImageUrl\`, downloadURL);

    console.log('File available at', downloadURL);

  } catch (error) {

    console.error("Upload failed:", error);

  }

};

*   
* 

### **Б. Бэкенд: Cloud Functions**

Все функции находятся в functions/src/index.ts.

#### **1\. Функция для AI-анализа**

Используйте **Callable Function** для безопасности.

TypeScript

// functions/src/index.ts

import \* as functions from "firebase-functions";

import \* as admin from "firebase-admin";

import axios from "axios";

admin.initializeApp();

// Установите секрет командой: firebase functions:secrets:set AI\_KEY

const aiApiKey \= functions.config().secrets.AI\_KEY;

export const analyzeUserData \= functions.https.onCall(async (data, context) \=\> {

  if (\!context.auth) {

    throw new functions.https.HttpsError("unauthenticated", "User must be authenticated.");

  }


  const { answers } \= data;

  const userId \= context.auth.uid;


  // 1\. Вызов AI API

  const response \= await axios.post("...", { answers }, { headers: { 'Authorization': \`Bearer ${aiApiKey}\` }});


  // 2\. Сохранение результата в Firestore

  await admin.firestore().collection("users").doc(userId).collection("analysis").add(response.data);


  return { success: true, result: response.data };

});

#### **2\. Функции для Stripe и RevenueCat**

* **createStripeCheckout (Callable Function):** Принимает userId и planId, создаёт сессию в Stripe и возвращает URL для редиректа.  
* **stripeWebhook (HTTP Function):** Принимает вебхук от Stripe, **обязательно проверяет подпись запроса**, обновляет данные в RevenueCat и Firestore.

---

## **Фаза 3: Локальное тестирование**

1. **Запустите эмуляторы:**  
2. Bash

firebase emulators:start

3.   
4. Это запустит локальные версии Firestore, Functions, Auth и Hosting.  
5. **Запустите Next.js dev server:**  
6. Bash

npm run dev

7.   
8.   
9. **Тестируйте:** Откройте http://localhost:3000. Ваше приложение будет работать, а все запросы к Firebase будут перехватываться локальными эмуляторами. Вы можете видеть данные и логи в **Firebase Emulator UI** по адресу http://localhost:4000.

---

## **Фаза 4: Деплой**

1. **Преддеплойная проверка:**  
   * Убедитесь, что все секретные ключи (AI, Stripe) установлены для продакшн-среды в Firebase.  
   * Соберите Next.js приложение: npm run build.  
2. **Команда для деплоя:**  
3. Bash

firebase deploy \--only hosting:quiz,functions

4.   
5. Эта команда развернёт ваш сайт на quiz.beautymirror.app и обновит Cloud Functions, не затрагивая основной сайт.

---

## **Фаза 5: Интеграция с Flutter**

* **Источник правды:** Firestore. Веб-онбординг создаёт и наполняет документ пользователя (/users/{userId}).  
* **Логика в Flutter:**  
  1. При логине пользователя Flutter-приложение обращается к его документу в Firestore по userId.  
  2. Проверяет поле, например, onboardingWebComplete: true.  
  3. Если true, приложение загружает готовые процедуры, статус подписки и переходит на главный экран.  
  4. Если false, направляет пользователя на quiz.beautymirror.app для прохождения онбординга.

