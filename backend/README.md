# Backend - Sistema de Barbearia (TypeScript)

## Instalação

1. Navegue até a pasta backend:
\`\`\`bash
cd backend
\`\`\`

2. Instale as dependências:
\`\`\`bash
npm install
\`\`\`

3. Configure o banco de dados PostgreSQL:
   - Certifique-se de que o PostgreSQL está rodando
   - Execute o script `database.sql` no seu banco PostgreSQL

4. Configure as variáveis de ambiente:
   - Copie o arquivo `.env` e ajuste conforme necessário

5. Para desenvolvimento:
\`\`\`bash
npm run dev
\`\`\`

6. Para produção:
\`\`\`bash
npm run build
npm start
\`\`\`

O servidor estará rodando em `http://localhost:3001`

## Estrutura do Projeto

\`\`\`
backend/
├── src/
│   ├── config/
│   │   └── database.ts                # Configuração do PostgreSQL
│   ├── controllers/
|   |   ├── adminController.ts         # Funcionalidades admin
│   │   ├── appointmentController.ts   # Agendamentos
│   │   ├── authController.ts          # Autenticação
│   │   ├── barberController.ts        # Gerenciamento de barbeiros
│   │   └── specialtyController.ts     # Gerenciamento de especialidades
|   ├── entities/                      # Configuração das entidades
|   |    ├── admin                     # entidade administradores
|   |    ├── appointment               # entidade agendamentos
|   |    ├── barber                    # entidade barbeiros
|   |    ├── specialty                 # entidade especialidades
|   |    └── user                      # entidade usuarios
│   ├── middleware/
│   │   ├── auth.ts                    # Middleware de autenticação
│   │   └── validation.ts              # Validação de dados
│   ├── routes/
│   │   ├── auth.ts                    # Rotas de autenticação
│   │   ├── appointments.ts            # Rotas de agendamentos
│   │   ├── admin.ts                   # Rotas administrativas
│   │   └── public.ts                  # Rotas públicas
│   ├── types/
│   │   └── index.ts                   # Definições de tipos TypeScript
│   └── server.ts                      # Servidor principal
├── .env                               # Variáveis de ambiente
├── package.json
├── tsconfig.json
└── database.sql                       # script para criar o banco de dados
\`\`\`

## Scripts Disponíveis

- `npm run dev`   - Executa em modo desenvolvimento com hot reload
- `npm run build` - Compila o TypeScript para JavaScript
- `npm start`     - Executa a versão compilada

## Estrutura da API

### Autenticação
- `POST /api/auth/login` - Login de cliente
- `POST /api/auth/admin/login` - Login de administrador
- `POST /api/auth/register` - Registro de cliente
- `GET /api/auth/me` - Verificar token

### Especialidades (Público)
- `GET /api/specialties` - Listar especialidades

### Barbeiros (Público)
- `GET /api/barbers/specialty/:specialtyId` - Barbeiros por especialidade

### Agendamentos
- `GET /api/appointments/available-times` - Horários disponíveis
- `POST /api/appointments` - Criar agendamento
- `GET /api/appointments/my` - Meus agendamentos
- `PATCH /api/appointments/:id/cancel` - Cancelar agendamento

### Admin - Estatísticas
- `GET /api/admin/stats` - Estatísticas do dashboard

### Admin - Agendamentos
- `GET /api/admin/appointments/today` - Agendamentos de hoje
- `GET /api/admin/appointments/future` - Agendamentos futuros

### Admin - Especialidades
- `GET /api/admin/specialties` - Listar especialidades
- `POST /api/admin/specialties` - Criar especialidade
- `PUT /api/admin/specialties/:id` - Editar especialidade
- `DELETE /api/admin/specialties/:id` - Excluir especialidade

### Admin - Barbeiros
- `GET /api/admin/barbers` - Listar barbeiros
- `POST /api/admin/barbers` - Criar barbeiro
- `PUT /api/admin/barbers/:id` - Editar barbeiro
- `DELETE /api/admin/barbers/:id` - Excluir barbeiro
- `POST /api/admin/barbers/:id/specialties` - Associar especialidade
- `DELETE /api/admin/barbers/:barberId/specialties/:specialtyId` - Desassociar especialidade

## Credenciais de Teste

**Administrador:**
- Email: admin@teste.com
- Senha: admin123

**Cliente:**
- Email: cliente@teste.com
- Senha: cliente123

## Tecnologias Utilizadas

- **Node.js** - Runtime JavaScript
- **TypeScript** - Superset tipado do JavaScript
- **Express** - Framework web
- **PostgreSQL** - Banco de dados
- **JWT** - Autenticação
- **bcryptjs** - Hash de senhas
- **Joi** - Validação de dados
- **Helmet** - Segurança HTTP
- **CORS** - Cross-Origin Resource Sharing
- **Rate Limiting** - Limitação de requisições
