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

    student_goals: "Мои цели",
    student_goals_sub: "Индивидуальный план и цели по твоему прогрессу",
    teacher_tools: "Инструменты учителя",
    teacher_tools_sub: "Быстрые действия: награды и работа со студентами",
    admin_tools: "Инструменты администратора",
    admin_tools_sub: "Управление расписанием и быстрые админ-действия",

    ai_assistant: "ИИ помощник",
    insights: "Инсайты",
    chat: "Чат",
    ask_placeholder: "Напиши вопрос: риск, прогулы, топ группы...",
    send: "Отправить",

    ai_recommendations: "Рекомендации ИИ",
    my_goals: "Мои цели",
    add_goal_placeholder: "Добавь цель на неделю...",
    no_goals: "Пока нет целей",
    delete: "Удалить",

    award_badge: "Наградить бейджем",
    award: "Наградить",
    awarded_ok: "Бейдж выдан",
    teacher_quick_actions: "Подсказки учителю",
    tip_award_badge: "Награди лидера — это мотивация для группы.",
    tip_journal: "Журнал посещаемости",
    tip_journal_sub: "Отмечай присутствие и добавляй комментарии.",

    add_schedule_item: "Добавить занятие в расписание",
    group: "Группа",
    subject: "Предмет",
    day: "День",
    room: "Аудитория",
    start: "Начало",
    end: "Конец",
    create: "Создать",
    created_ok: "Создано",
    admin_quick_actions: "Подсказки админа",
    tip_news: "Объявления",
    tip_news_sub: "Публикуй новости для студентов и преподавателей.",
    tip_analytics: "Аналитика",
    tip_analytics_sub: "Смотри лидеров, прогульщиков и рейтинг групп.",

    no_data: "Нет данных",
    student_only: "Только для студентов",
    teacher_only: "Только для преподавателей/админов",
    admin_only: "Только для администраторов",
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

    student_goals: "Максаттарым",
    student_goals_sub: "Прогресске жараша жеке план жана максаттар",
    teacher_tools: "Мугалим куралдары",
    teacher_tools_sub: "Тез аракеттер: сыйлыктар жана студенттер менен иш",
    admin_tools: "Админ куралдары",
    admin_tools_sub: "Жадыбалды башкаруу жана тез админ аракеттери",

    ai_assistant: "ИИ жардамчы",
    insights: "Инсайттар",
    chat: "Чат",
    ask_placeholder: "Суроо бер: тобокел, прогульщиктер, топ топтор...",
    send: "Жөнөтүү",

    ai_recommendations: "ИИ сунуштар",
    my_goals: "Максаттарым",
    add_goal_placeholder: "Аптага максат кош...",
    no_goals: "Азырынча максат жок",
    delete: "Өчүрүү",

    award_badge: "Белги ыйгаруу",
    award: "Ыйгаруу",
    awarded_ok: "Белги ыйгарылды",
    teacher_quick_actions: "Мугалим үчүн кеңеш",
    tip_award_badge: "Лидерге белги бер — бул мотивация.",
    tip_journal: "Катышуу журналы",
    tip_journal_sub: "Катышууну белгилеп, комментарий калтыр.",

    add_schedule_item: "Жадыбалга сабак кошуу",
    group: "Топ",
    subject: "Предмет",
    day: "Күн",
    room: "Бөлмө",
    start: "Башталышы",
    end: "Аякташы",
    create: "Түзүү",
    created_ok: "Түзүлдү",
    admin_quick_actions: "Админ кеңештери",
    tip_news: "Билдирүүлөр",
    tip_news_sub: "Студенттер жана мугалимдер үчүн жаңылык жарыяла.",
    tip_analytics: "Аналитика",
    tip_analytics_sub: "Лидерлерди, прогульщиктерди жана топ рейтингин көр.",

    no_data: "Маалымат жок",
    student_only: "Студенттер үчүн гана",
    teacher_only: "Мугалим/админ үчүн гана",
    admin_only: "Админ үчүн гана",
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
