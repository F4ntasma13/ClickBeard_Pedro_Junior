
-- Criar banco de dados
CREATE DATABASE barbershop;
-- Conecte-se ao banco 'barbershop' e execute os comandos abaixo:
-- Criar tabela de administradores
CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,                 
    name VARCHAR(100) NOT NULL,         
    email VARCHAR(100) UNIQUE NOT NULL,         
    password VARCHAR(255) NOT NULL,           
    is_admin BOOLEAN DEFAULT TRUE,                  
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
);

-- Tabela de usuários (clientes)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Tabela de especialidades
CREATE TABLE IF NOT EXISTS specialties (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    duration INTEGER NOT NULL, -- duração em minutos
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Tabela de barbeiros
CREATE TABLE IF NOT EXISTS barbers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    age INTEGER NOT NULL,
    hire_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Tabela de relacionamento barbeiro-especialidades
CREATE TABLE IF NOT EXISTS barber_specialties (
    id SERIAL PRIMARY KEY,
    barber_id INTEGER REFERENCES barbers(id) ON DELETE CASCADE,
    specialty_id INTEGER REFERENCES specialties(id) ON DELETE CASCADE,
    UNIQUE(barber_id, specialty_id)
);
-- Tabela de agendamentos
CREATE TABLE IF NOT EXISTS appointments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    barber_id INTEGER REFERENCES barbers(id) ON DELETE CASCADE,
    specialty_id INTEGER REFERENCES specialties(id) ON DELETE CASCADE,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    status VARCHAR(20) DEFAULT 'scheduled', -- scheduled, cancelled, completed
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Inserir dados de teste
-- Administrador de teste
INSERT INTO users (name, email, password, is_admin) VALUES 
('Admin Teste', 'admin@teste.com', '$2a$10$tMuLQxsU22nfR3NWCpq3buioLKXAiVhNqa7.sGCumsq1VvVPqbDuu', TRUE)
ON CONFLICT (email) DO NOTHING;
-- Usuário cliente de teste
INSERT INTO users (name, email, password) VALUES 
('Cliente Teste', 'cliente@teste.com', '$2a$10$tMuLQxsU22nfR3NWCpq3buioLKXAiVhNqa7.sGCumsq1VvVPqbDuu')
ON CONFLICT (email) DO NOTHING;
-- Especialidades
INSERT INTO specialties (name, price, duration) VALUES 
('Corte Masculino', 25.00, 30),
('Barba', 15.00, 20),
('Corte + Barba', 35.00, 45),
('Sobrancelha', 10.00, 15),
('Bigode', 8.00, 10)
ON CONFLICT (name) DO NOTHING;
-- Barbeiros
INSERT INTO barbers (name, age, hire_date) VALUES 
('João Silva', 28, '2023-01-15'),
('Pedro Santos', 32, '2022-06-10'),
('Carlos Oliveira', 25, '2023-03-20')
ON CONFLICT (name) DO NOTHING;
-- Associar especialidades aos barbeiros
INSERT INTO barber_specialties (barber_id, specialty_id) VALUES 
(1, 1), (1, 2), (1, 3),
(2, 1), (2, 3), (2, 4),
(3, 2), (3, 4), (3, 5)
ON CONFLICT (barber_id, specialty_id) DO NOTHING;
