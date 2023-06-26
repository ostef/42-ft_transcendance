CREATE schema transcendence;
CREATE TABLE transcendence.users (
	id integer NOT NULL,
	username varchar NOT NULL,
	password varchar NULL,
	nickname varchar NOT NULL,
	has2fa information_schema."yes_or_no" NOT NULL DEFAULT 0,
	"2fa_secret" varchar NULL,
	CONSTRAINT users_pk PRIMARY KEY (id),
	CONSTRAINT users_un UNIQUE (id)
);
