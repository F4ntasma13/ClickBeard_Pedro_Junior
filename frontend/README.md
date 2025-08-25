# Sistema de Barbearia

Sistema completo de agendamentos para barbearia com frontend Next.js e backend Node.js/PostgreSQL em TypeScript.

**Desenvolvido por: Pedro Junior**

## Configuração Local

### 1. Configurar Banco de Dados
Certifique-se de que o PostgreSQL está rodando e execute o script SQL:

\`\`\`bash
# Execute o script database.sql no seu PostgreSQL
psql -U postgres -d barbershop -f backend/database.sql
\`\`\`

### 2. Configurar Backend
\`\`\`bash
cd backend
npm install
npm run dev
\`\`\`
O servidor rodará em http://localhost:3001

### 3. Configurar Frontend
\`\`\`bash
# Na raiz do projeto
npm install
npm run dev
\`\`\`
O frontend rodará em http://localhost:3000

## Credenciais de Teste

### Cliente
- Email: cliente@teste.com
- Senha: cliente123

### Administrador
- Email: admin@teste.com
- Senha: admin123

## Estrutura do Projeto

\`\`\`
Click Beard/
├── backend/                 # Backend TypeScript
│   ├── src/
|   |   ├── config/        # Configuração do banco
│   │   ├── controllers/   # Controladores da API
|   |   ├── entities/      # Configuração das entidades
│   │   ├── middleware/    # Middleware de autenticação e validação
│   │   ├── routes/        # Definição das rotas
│   │   ├── types/         # Tipagens
│   │   └── server.ts      # Servidor principal
│   └── package.json
├── frontend/
    ├── app/                  # Frontend Next.js
    ├── components/           # Componentes React
    ├── contexts/             # Contextos React
    ├── hooks/                # hooks personalizados
    └── package.json
\`\`\`

## Funcionalidades

### Cliente
- Cadastro e login
- Agendamento de horários
- Visualização de agendamentos
- Cancelamento de agendamentos (até 2h antes)

### Administrador
- Login administrativo
- Dashboard com estatísticas
- Visualização de agendamentos (hoje/futuros)
- Gerenciamento completo de barbeiros
- Gerenciamento completo de especialidades
- Associação de especialidades aos barbeiros

## Tecnologias

### Frontend
- **Next.js** - Framework React
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **Shadcn/ui** - Componentes UI

### Backend
- **Node.js** - Runtime
- **TypeScript** - Tipagem estática
- **Express** - Framework web
- **PostgreSQL** - Banco de dados
- **JWT** - Autenticação
- **bcryptjs** - Hash de senhas
- **Joi** - Validação de dados

## APIs Disponíveis

Consulte o README do backend para documentação completa da API.

---

**© 2024 Pedro Junior - Todos os direitos reservados**
