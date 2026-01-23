import { Router } from "express";
import { z } from "zod";

import { query } from "../db.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { demo, demoMode, computeStudentStats } from "../demoStore.js";

export const assistantRouter = Router();

function makeCard({ title, severity, message, actions }) {
  return {
    title,
    severity,
    message,
    actions: actions || [],
  };
}

function buildInterventionPlan({ studentName, groupName, riskLevel }) {
  const base = [
    "Проверить посещаемость за 7 дней и выявить причины пропусков",
    "Назначить 15-мин консультацию и зафиксировать план обучения",
    "Поставить 2 короткие цели на неделю и проверить прогресс",
  ];

  if (riskLevel === "red") {
    base.unshift("Срочное действие: связаться со студентом сегодня и согласовать поддержку");
    base.push("Если ситуация не меняется — подключить куратора/администрацию");
  } else if (riskLevel === "yellow") {
    base.unshift("Сделать профилактику: короткая встреча и уточнение пробелов");
  } else {
    base.unshift("Поддерживать мотивацию: отметить прогресс и дать следующую цель");
  }

  const notification = {
    subject: `Risk → Action: ${studentName}`,
    body:
      `Студент: ${studentName}${groupName ? ` (${groupName})` : ""}\n` +
      `Уровень риска: ${riskLevel.toUpperCase()}\n\n` +
      `План на 7 дней:\n` +
      base.map((x, i) => `${i + 1}. ${x}`).join("\n"),
  };

  return { plan: base, notification };
}

async function getStudentStatsDb(studentId) {
  const result = await query(
    `select
       count(*) filter (where status in ('present','late'))::int as attended,
       count(*)::int as total,
       coalesce(avg(grade), 0)::float as avg_grade
     from attendance
     where student_id = $1`,
    [studentId]
  );

  const row = result.rows[0] || { attended: 0, total: 0, avg_grade: 0 };
  const attendanceRate = row.total > 0 ? row.attended / row.total : 1;
  const performanceIndex = Math.round(0.6 * row.avg_grade + 0.4 * attendanceRate * 100);
  const score = Math.round(0.55 * attendanceRate * 100 + 0.45 * performanceIndex);
  const level = score >= 75 ? "green" : score >= 55 ? "yellow" : "red";

  return {
    attended: row.attended,
    total: row.total,
    attendanceRate,
    avgGrade: row.avg_grade,
    performanceIndex,
    risk: { level, score },
  };
}

async function studentInsights(user) {
  const stats = demoMode() ? computeStudentStats() : await getStudentStatsDb(Number(user.sub));

  const riskMsg =
    stats.risk.level === "green"
      ? "Низкий риск. Продолжай в том же темпе."
      : stats.risk.level === "yellow"
        ? "Средний риск. Стоит улучшить посещаемость и закрепить темы."
        : "Высокий риск. Нужен план: посещаемость + консультация с преподавателем.";

  return {
    cards: [
      makeCard({
        title: "Риск",
        severity: stats.risk.level,
        message: `${riskMsg} (score ${stats.risk.score})`,
        actions: [
          "Открой расписание и проверь ближайшие занятия",
          "Сдай пропущенные задания/контрольные",
          "Попроси консультацию у преподавателя",
        ],
      }),
      makeCard({
        title: "Посещаемость",
        severity: stats.attendanceRate >= 0.85 ? "green" : stats.attendanceRate >= 0.7 ? "yellow" : "red",
        message: `Посещаемость: ${Math.round(stats.attendanceRate * 100)}% (посещено ${stats.attended}/${stats.total})`,
        actions: ["Ставь цель: +1 неделя без пропусков", "Включи напоминания по расписанию"],
      }),
      makeCard({
        title: "Индекс успеваемости",
        severity: stats.performanceIndex >= 75 ? "green" : stats.performanceIndex >= 55 ? "yellow" : "red",
        message: `Performance Index: ${stats.performanceIndex} · Средняя оценка: ${Math.round(stats.avgGrade)}`,
        actions: ["Сфокусируйся на 1-2 слабых предметах", "Реши 10 задач для закрепления"],
      }),
    ],
    suggestions: ["покажи риск", "что делать если красный риск", "мое расписание"],
  };
}

async function teacherInsights(user) {
  if (demoMode()) {
    return {
      cards: [
        makeCard({
          title: "Класс сегодня",
          severity: "green",
          message: "DEMO: 1 занятие запланировано на этой неделе.",
          actions: ["Открой журнал посещаемости", "Экспортируй отчёт PDF/Excel"],
        }),
      ],
      suggestions: ["кто прогульщики", "риск студентов", "экспорт отчета"],
    };
  }

  const teacherId = Number(user.sub);
  const abs = await query(
    `select
       u.id as student_id,
       u.full_name as student_name,
       g.name as group_name,
       count(*) filter (where a.status='absent')::int as absences,
       count(*)::int as total
     from attendance a
     join users u on u.id = a.student_id
     join groups g on g.id = a.group_id
     where a.teacher_id = $1 and a.date >= (now() - interval '30 days')
     group by u.id, u.full_name, g.name
     order by (count(*) filter (where a.status='absent')::float / nullif(count(*),0)) desc
     limit 5`,
    [teacherId]
  );

  const top = abs.rows;
  const hasTop = top.length > 0;

  return {
    cards: [
      makeCard({
        title: "Фокус недели",
        severity: hasTop ? "yellow" : "green",
        message: hasTop
          ? "Есть студенты с повышенными пропусками за 30 дней."
          : "По данным за 30 дней нет явных прогульщиков.",
        actions: hasTop ? ["Открой список прогульщиков ниже", "Сформируй план: звонок/сообщение родителям", "Назначь консультацию"] : ["Поддерживай темп"],
      }),
      ...top.map((r) => {
        const total = r.total || 0;
        const absences = r.absences || 0;
        const rate = total ? absences / total : 0;
        const sev = rate >= 0.35 ? "red" : rate >= 0.2 ? "yellow" : "green";
        return makeCard({
          title: `Прогулы: ${r.student_name}`,
          severity: sev,
          message: `${r.group_name} · Пропуски ${absences}/${total} (${Math.round(rate * 100)}%)`,
          actions: ["Отметить в журнале", "Отправить комментарий", "Назначить встречу"],
        });
      }),
    ],
    suggestions: ["кто прогульщики", "экспорт excel", "план на неделю"],
  };
}

async function adminInsights() {
  if (demoMode()) {
    const stats = computeStudentStats();
    return {
      cards: [
        makeCard({
          title: "Сводка колледжа",
          severity: "green",
          message: "DEMO: система работает без базы данных. Данные демонстрационные.",
          actions: ["Открой Analytics: лидеры/прогульщики/топ групп"],
        }),
        makeCard({
          title: "Топ студент",
          severity: stats.risk.level,
          message: `${demo.users.student.fullName} · PI ${stats.performanceIndex} · Attendance ${Math.round(stats.attendanceRate * 100)}%`,
          actions: ["Наградить бейджем", "Опубликовать новость"],
        }),
      ],
      suggestions: ["топ прогульщики", "топ группы", "лидеры"],
    };
  }

  const leaders = await query(
    `select
       u.full_name as student_name,
       g.name as group_name,
       coalesce(avg(a.grade), 0)::float as avg_grade,
       (count(*) filter (where a.status in ('present','late'))::float / nullif(count(*),0)) as attendance_rate
     from users u
     join groups g on g.id = u.group_id
     left join attendance a on a.student_id = u.id
     where u.role='student'
     group by u.full_name, g.name
     order by (0.6*coalesce(avg(a.grade),0) + 0.4*coalesce((count(*) filter (where a.status in ('present','late'))::float / nullif(count(*),0))*100, 100)) desc
     limit 3`
  );

  const absentees = await query(
    `select
       u.full_name as student_name,
       g.name as group_name,
       count(*) filter (where a.status='absent')::int as absences,
       count(*)::int as total
     from users u
     join groups g on g.id = u.group_id
     left join attendance a on a.student_id = u.id
     where u.role='student'
     group by u.full_name, g.name
     order by (count(*) filter (where a.status='absent')::float / nullif(count(*),0)) desc
     limit 3`
  );

  const cards = [];

  cards.push(
    makeCard({
      title: "Лидеры колледжа (топ 3)",
      severity: "green",
      message: leaders.rows.length ? "Лучшие студенты по PI." : "Нет данных.",
      actions: ["Открыть Analytics", "Экспорт отчёта"],
    })
  );

  leaders.rows.forEach((r) => {
    const attendanceRate = r.attendance_rate ?? 1;
    const perfIndex = Math.round(0.6 * r.avg_grade + 0.4 * attendanceRate * 100);
    cards.push(
      makeCard({
        title: `Лидер: ${r.student_name}`,
        severity: perfIndex >= 75 ? "green" : perfIndex >= 55 ? "yellow" : "red",
        message: `${r.group_name} · PI ${perfIndex} · Attendance ${Math.round(attendanceRate * 100)}%`,
        actions: ["Наградить", "Отметить в новости"],
      })
    );
  });

  absentees.rows.forEach((r) => {
    const total = r.total || 0;
    const abs = r.absences || 0;
    const rate = total ? abs / total : 0;
    cards.push(
      makeCard({
        title: `Прогульщик: ${r.student_name}`,
        severity: rate >= 0.35 ? "red" : rate >= 0.2 ? "yellow" : "green",
        message: `${r.group_name} · Пропуски ${abs}/${total} (${Math.round(rate * 100)}%)`,
        actions: ["Проверить куратору", "Связаться с родителями"],
      })
    );
  });

  return {
    cards,
    suggestions: ["топ прогульщики", "топ группы", "экспорт"],
  };
}

assistantRouter.get("/insights", requireAuth, async (req, res, next) => {
  try {
    const role = req.user.role;
    if (role === "student") return res.json(await studentInsights(req.user));
    if (role === "teacher") return res.json(await teacherInsights(req.user));
    return res.json(await adminInsights());
  } catch (e) {
    next(e);
  }
});

assistantRouter.post(
  "/intervention-plan",
  requireAuth,
  requireRole("teacher", "admin"),
  async (req, res, next) => {
    try {
      const body = z.object({ studentId: z.number().int() }).parse(req.body);

      if (demoMode()) {
        const stats = computeStudentStats();
        const out = buildInterventionPlan({
          studentName: demo.users.student.fullName,
          groupName: demo.groups[0]?.name,
          riskLevel: stats.risk.level,
        });
        return res.json({
          studentId: demo.users.student.id,
          studentName: demo.users.student.fullName,
          groupName: demo.groups[0]?.name,
          risk: stats.risk,
          ...out,
        });
      }

      const studentRes = await query(
        `select u.full_name as student_name, g.name as group_name
         from users u
         left join groups g on g.id = u.group_id
         where u.id=$1 and u.role='student'`,
        [body.studentId]
      );
      const student = studentRes.rows[0];
      if (!student) return res.status(404).json({ error: { message: "Student not found" } });

      const stats = await getStudentStatsDb(body.studentId);
      const out = buildInterventionPlan({
        studentName: student.student_name,
        groupName: student.group_name,
        riskLevel: stats.risk.level,
      });

      res.json({
        studentId: body.studentId,
        studentName: student.student_name,
        groupName: student.group_name,
        risk: stats.risk,
        ...out,
      });
    } catch (e) {
      next(e);
    }
  }
);

assistantRouter.post("/chat", requireAuth, async (req, res, next) => {
  try {
    const body = z.object({ message: z.string().min(1).max(400) }).parse(req.body);
    const text = body.message.toLowerCase();

    const role = req.user.role;

    const reply = (answer, suggestions) => res.json({ answer, suggestions: suggestions || [] });

    if (/(риск|risk)/.test(text)) {
      if (role !== "student") return reply("Риск рассчитывается по посещаемости и оценкам. Открой Analytics → Risk list.", ["топ прогульщики", "топ группы"]);
      const stats = demoMode() ? computeStudentStats() : await getStudentStatsDb(Number(req.user.sub));
      return reply(
        `Твой риск: ${stats.risk.level.toUpperCase()} (score ${stats.risk.score}). Посещаемость ${Math.round(stats.attendanceRate * 100)}%, PI ${stats.performanceIndex}.`,
        ["что делать если красный риск", "мое расписание"]
      );
    }

    if (/(прогул|absent|прогуль)/.test(text)) {
      if (role === "admin") return reply("Открой Analytics → Top absentees (прогульщики).", ["топ группы", "лидеры"]);
      if (role === "teacher") return reply("Открой Analytics/Journal: я показываю топ прогульщиков среди твоих студентов в инсайтах.", ["экспорт excel", "план на неделю"]);
      return reply("Хочешь снизить риск — начни с посещаемости. Поставь цель: 7 дней без пропусков.", ["покажи риск"]);
    }

    if (/(групп|group|рейтинг)/.test(text)) {
      return reply("Рейтинг групп доступен администратору: Analytics → Top groups.", ["лидеры", "топ прогульщики"]);
    }

    if (/(что делать|план|совет)/.test(text)) {
      if (role === "student") {
        return reply(
          "План на 7 дней: 1) без пропусков 2) повтор 30 минут в день 3) закрыть 1 задолженность 4) спросить преподавателя по слабой теме.",
          ["покажи риск", "мое расписание"]
        );
      }
      if (role === "teacher") {
        return reply(
          "План преподавателя: 1) открыть журнал 2) отметить отсутствующих 3) выделить 3 студентов риска 4) дать короткое домашнее 5) экспорт отчёта.",
          ["кто прогульщики", "экспорт excel"]
        );
      }
      return reply(
        "План администратора: 1) открыть лидеров 2) прогульщиков 3) топ групп 4) выдать награды лидерам 5) объявление для проблемной группы.",
        ["топ прогульщики", "топ группы"]
      );
    }

    return reply(
      "Я могу помочь с: риск, прогулы, топ группы, лидеры, план действий. Напиши, что нужно.",
      role === "admin"
        ? ["лидеры", "топ прогульщики", "топ группы"]
        : role === "teacher"
          ? ["кто прогульщики", "план на неделю", "экспорт excel"]
          : ["покажи риск", "что делать если красный риск", "мое расписание"]
    );
  } catch (e) {
    next(e);
  }
});
