import "dotenv/config";
import bcrypt from "bcryptjs";
import { pool, query } from "../db.js";

async function run() {
  const client = await pool.connect();
  try {
    await client.query("begin");

    await client.query(`
      create table if not exists groups (
        id serial primary key,
        name text not null unique
      );

      create table if not exists users (
        id serial primary key,
        email text not null unique,
        full_name text not null,
        role text not null check (role in ('student','teacher','admin')),
        group_id int references groups(id),
        password_hash text not null,
        created_at timestamptz not null default now()
      );

      create table if not exists subjects (
        id serial primary key,
        name text not null unique
      );

      create table if not exists schedule (
        id serial primary key,
        group_id int not null references groups(id) on delete cascade,
        subject_id int not null references subjects(id) on delete cascade,
        teacher_id int not null references users(id) on delete cascade,
        day_of_week int not null check (day_of_week between 1 and 7),
        start_time time not null,
        end_time time not null,
        room text,
        unique (group_id, subject_id, teacher_id, day_of_week, start_time)
      );

      create table if not exists attendance (
        id serial primary key,
        student_id int not null references users(id) on delete cascade,
        group_id int not null references groups(id) on delete cascade,
        subject_id int not null references subjects(id) on delete cascade,
        teacher_id int not null references users(id) on delete cascade,
        date date not null,
        status text not null check (status in ('present','late','absent','excused')),
        grade int check (grade between 0 and 100),
        comment text,
        created_at timestamptz not null default now(),
        unique (student_id, subject_id, date)
      );

      create table if not exists news (
        id serial primary key,
        title text not null,
        body text not null,
        audience text not null default 'all' check (audience in ('all','students','teachers')),
        published_at timestamptz not null default now(),
        author_id int references users(id) on delete set null
      );

      create table if not exists badges (
        id serial primary key,
        code text not null unique,
        title text not null,
        description text,
        color text not null default 'emerald'
      );

      create table if not exists user_badges (
        id serial primary key,
        user_id int not null references users(id) on delete cascade,
        badge_id int not null references badges(id) on delete cascade,
        awarded_by int references users(id) on delete set null,
        awarded_at timestamptz not null default now(),
        unique (user_id, badge_id)
      );
    `);

    const groupRes = await client.query(
      "insert into groups(name) values ($1) on conflict(name) do update set name = excluded.name returning id",
      ["CS-101"]
    );
    const groupId = groupRes.rows[0].id;

    const [adminHash, teacherHash, studentHash] = await Promise.all([
      bcrypt.hash("Admin123!", 10),
      bcrypt.hash("Teacher123!", 10),
      bcrypt.hash("Student123!", 10),
    ]);

    const admin = await client.query(
      `insert into users(email, full_name, role, group_id, password_hash)
       values ($1,$2,'admin', null, $3)
       on conflict(email) do update set full_name = excluded.full_name
       returning id`,
      ["admin@altamimi.local", "Admin AL TAMIMI", adminHash]
    );

    const teacher = await client.query(
      `insert into users(email, full_name, role, group_id, password_hash)
       values ($1,$2,'teacher', null, $3)
       on conflict(email) do update set full_name = excluded.full_name
       returning id`,
      ["teacher@altamimi.local", "Aisha Al-Mutairi", teacherHash]
    );

    const student = await client.query(
      `insert into users(email, full_name, role, group_id, password_hash)
       values ($1,$2,'student', $3, $4)
       on conflict(email) do update set full_name = excluded.full_name
       returning id`,
      ["student@altamimi.local", "Omar Al Tamimi", groupId, studentHash]
    );

    const teacherId = teacher.rows[0].id;
    const studentId = student.rows[0].id;
    const adminId = admin.rows[0].id;

    const subjMath = await client.query(
      "insert into subjects(name) values ($1) on conflict(name) do update set name=excluded.name returning id",
      ["Mathematics"]
    );
    const subjProg = await client.query(
      "insert into subjects(name) values ($1) on conflict(name) do update set name=excluded.name returning id",
      ["Programming"]
    );

    const mathId = subjMath.rows[0].id;
    const progId = subjProg.rows[0].id;

    await client.query(
      `insert into schedule(group_id, subject_id, teacher_id, day_of_week, start_time, end_time, room)
       values
        ($1,$2,$3,1,'09:00','10:30','A-12'),
        ($1,$4,$3,3,'11:00','12:30','Lab-1')
       on conflict do nothing`,
      [groupId, mathId, teacherId, progId]
    );

    await client.query(
      `insert into badges(code, title, description, color)
       values
        ('perfect_attendance','Perfect Attendance','No absences for 30 days','emerald'),
        ('top_performer','Top Performer','High performance index','indigo'),
        ('helper','Helpful Teammate','Supports classmates','amber')
       on conflict(code) do nothing`
    );

    await client.query(
      `insert into news(title, body, audience, author_id)
       values ($1,$2,'all',$3)
       on conflict do nothing`,
      [
        "Welcome to AL TAMIMI College System",
        "This is the hackathon MVP: schedule, attendance journal, risk indicator and analytics.",
        adminId,
      ]
    );

    const today = new Date();
    const iso = today.toISOString().slice(0, 10);
    await client.query(
      `insert into attendance(student_id, group_id, subject_id, teacher_id, date, status, grade, comment)
       values ($1,$2,$3,$4,$5,'present',88,'Great work')
       on conflict do nothing`,
      [studentId, groupId, mathId, teacherId, iso]
    );

    await client.query("commit");
    console.log("DB initialized + demo data seeded");
  } catch (e) {
    await client.query("rollback");
    console.error(e);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

run();
