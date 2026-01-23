import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const I18nContext = createContext(null);

const dict = {
  ru: {
    language: "Язык",
    ru: "Русский",
    ky: "Кыргызча",

    login_title: "Система колледжей Аль-Тамими",
    sign_in: "Войти",
    email: "Электронная почта",
    password: "Пароль",
    quick_role: "Быстрая смена ролей",
    admin: "Администратор",
    teacher: "Учитель",
    student: "Студент",

    dashboard: "Дашборд",
    schedule: "Расписание",
    journal: "Журнал посещаемости",
    announcements: "Объявления",
    badges: "Бейджи",
    analytics: "Аналитика",

    ai_assistant: "ИИ помощник",
    insights: "Инсайты",
    chat: "Чат",
    ask_placeholder: "Напиши вопрос: риск, прогулы, топ группы...",
    send: "Отправить",
  },
  ky: {
    language: "Тил",
    ru: "Русча",
    ky: "Кыргызча",

    login_title: "Аль-Тамими колледж системасы",
    sign_in: "Кирүү",
    email: "Электрондук почта",
    password: "Сырсөз",
    quick_role: "Ролду тез алмаштыруу",
    admin: "Админ",
    teacher: "Мугалим",
    student: "Студент",

    dashboard: "Башкы панель",
    schedule: "Жадыбал",
    journal: "Катышуу журналы",
    announcements: "Билдирүүлөр",
    badges: "Белгилер",
    analytics: "Аналитика",

    ai_assistant: "ИИ жардамчы",
    insights: "Инсайттар",
    chat: "Чат",
    ask_placeholder: "Суроо бер: тобокел, прогульщиктер, топ топтор...",
    send: "Жөнөтүү",
  },
};

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem("altamimi_lang") || "ru");

  useEffect(() => {
    localStorage.setItem("altamimi_lang", lang);
  }, [lang]);

  const t = useMemo(() => {
    return (key) => dict[lang]?.[key] ?? dict.ru[key] ?? key;
  }, [lang]);

  const value = useMemo(() => ({ lang, setLang, t }), [lang, t]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("I18nContext missing");
  return ctx;
}
