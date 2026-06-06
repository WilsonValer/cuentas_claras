DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'lunch_event_status') THEN
    CREATE TYPE lunch_event_status AS ENUM ('PENDING', 'COMPLETED', 'ARCHIVED');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
    CREATE TYPE payment_status AS ENUM ('PENDING', 'PAID');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_method') THEN
    CREATE TYPE payment_method AS ENUM ('YAPE', 'PLIN', 'CASH', 'TRANSFER', 'OTHER');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS lunch_events (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(180) NOT NULL,
  event_date DATE NOT NULL,
  payer_name VARCHAR(140) NOT NULL,
  description TEXT,
  status lunch_event_status NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  expires_at DATE
);

CREATE TABLE IF NOT EXISTS participants (
  id BIGSERIAL PRIMARY KEY,
  lunch_event_id BIGINT NOT NULL REFERENCES lunch_events(id) ON DELETE CASCADE,
  full_name VARCHAR(140) NOT NULL,
  payment_status payment_status NOT NULL DEFAULT 'PENDING',
  payment_method payment_method,
  paid_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS consumption_items (
  id BIGSERIAL PRIMARY KEY,
  participant_id BIGINT NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  description VARCHAR(180) NOT NULL,
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_participants_lunch_event_id ON participants (lunch_event_id);
CREATE INDEX IF NOT EXISTS idx_consumption_items_participant_id ON consumption_items (participant_id);
