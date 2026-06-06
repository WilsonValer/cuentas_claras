-- Seed data for Cuenta Clara MVP
-- Run after schema.sql

-- Clean previous data (safe order because FK cascade)
TRUNCATE TABLE consumption_items RESTART IDENTITY CASCADE;
TRUNCATE TABLE participants RESTART IDENTITY CASCADE;
TRUNCATE TABLE lunch_events RESTART IDENTITY CASCADE;

INSERT INTO lunch_events (name, event_date, payer_name, description, status, expires_at)
VALUES
  ('Cumpleanos de Jorge', '2026-04-15', 'Wilson Valer', 'Almuerzo grupal del trabajo', 'PENDING', '2026-05-15'),
  ('Ascenso de Nelson', '2026-04-25', 'Carlos Ramirez', 'Celebracion por ascenso', 'COMPLETED', '2026-05-25'),
  ('Cambio de regalos', '2026-05-15', 'Ana Torres', 'Almuerzo por intercambio', 'PENDING', '2026-06-14');

INSERT INTO participants (lunch_event_id, full_name, payment_status, payment_method, paid_at)
VALUES
  -- Event 1
  (1, 'Carlos Suarez', 'PENDING', NULL, NULL),
  (1, 'Ana Torres', 'PAID', 'YAPE', NOW() - INTERVAL '20 days'),
  (1, 'Luis Perez', 'PENDING', NULL, NULL),
  (1, 'Maria Gomez', 'PAID', 'PLIN', NOW() - INTERVAL '18 days'),
  -- Event 2
  (2, 'Nelson Rojas', 'PAID', 'TRANSFER', NOW() - INTERVAL '27 days'),
  (2, 'Valeria Mena', 'PAID', 'YAPE', NOW() - INTERVAL '27 days'),
  (2, 'Jorge Ramos', 'PAID', 'CASH', NOW() - INTERVAL '27 days'),
  -- Event 3
  (3, 'Andrea Gil', 'PAID', 'YAPE', NOW() - INTERVAL '7 days'),
  (3, 'Pedro Diaz', 'PENDING', NULL, NULL),
  (3, 'Sofia Linares', 'PENDING', NULL, NULL);

INSERT INTO consumption_items (participant_id, description, price)
VALUES
  -- Event 1 details
  (1, 'Arroz con pollo', 18.00),
  (1, 'Inca Kola', 5.00),
  (1, 'Postre', 8.00),
  (2, 'Menu ejecutivo', 20.00),
  (2, 'Gaseosa', 5.00),
  (3, 'Pollo a la plancha', 22.00),
  (4, 'Lomo saltado', 24.00),
  (4, 'Jugo', 6.00),

  -- Event 2 details
  (5, 'Parrilla personal', 40.00),
  (5, 'Bebida', 8.00),
  (6, 'Pasta', 28.00),
  (6, 'Postre', 9.00),
  (7, 'Ceviche', 35.00),

  -- Event 3 details
  (8, 'Menu del dia', 19.00),
  (8, 'Agua', 4.00),
  (9, 'Hamburguesa', 24.00),
  (10, 'Ensalada', 17.00),
  (10, 'Cafe', 6.00);

-- Recalculate event statuses based on pending participants
UPDATE lunch_events e
SET status = CASE
  WHEN EXISTS (
    SELECT 1
    FROM participants p
    WHERE p.lunch_event_id = e.id
      AND p.payment_status = 'PENDING'
  ) THEN 'PENDING'::lunch_event_status
  ELSE 'COMPLETED'::lunch_event_status
END,
updated_at = NOW();
