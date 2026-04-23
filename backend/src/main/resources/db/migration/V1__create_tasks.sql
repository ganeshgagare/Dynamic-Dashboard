CREATE TABLE IF NOT EXISTS tasks (
    id       BIGSERIAL    PRIMARY KEY,
    name     VARCHAR(255) NOT NULL,
    status   VARCHAR(50)  NOT NULL,
    date     DATE         NOT NULL,
    category VARCHAR(100) NOT NULL,
    value    INTEGER      NOT NULL
);
