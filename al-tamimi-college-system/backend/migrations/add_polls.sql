-- Таблица опросов, привязанных к новостям
create table polls (
  id serial primary key,
  news_id integer not null references news(id) on delete cascade,
  question text not null,
  options text[] not null,
  anonymous boolean not null default true,
  multiple boolean not null default false,
  ends_at timestamp,
  created_at timestamp default now()
);

-- Голоса
create table poll_votes (
  id serial primary key,
  poll_id integer not null references polls(id) on delete cascade,
  user_id integer not null references users(id) on delete cascade,
  selected_options integer[] not null,
  created_at timestamp default now(),
  unique(poll_id, user_id)
);

-- Индексы
create index idx_polls_news_id on polls(news_id);
create index idx_poll_votes_poll_id on poll_votes(poll_id);
create index idx_poll_votes_user_id on poll_votes(user_id);
