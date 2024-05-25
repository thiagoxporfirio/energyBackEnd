# Energy Billing Backend

Este repositório contém o backend para a aplicação de faturamento de energia.

## Início Rápido

Estas instruções fornecerão uma cópia do projeto em execução na sua máquina local para fins de desenvolvimento e teste.

### Pré-requisitos

- Node.js
- Yarn
- Docker

### Instalação

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/thiagoporfirio/energyBackEnd.git
   cd energyBackEnd
```

2. **Instale as dependências:**
 ```bash
  yarn install
```

3. **Crie o banco de dados PostgreSQL usando Docker:**
   ```bash
   docker run --name lumy -e POSTGRES_PASSWORD=password -d -p 5432:5432 postgres
```

4. **Crie as tabelas no banco de dados PostgreSQL:**
  ```postgres
  CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    numero_cliente VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE faturas (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER REFERENCES clientes(id),
    mes_referencia VARCHAR(255) NOT NULL,
    total_kwh DECIMAL(10, 2) NOT NULL,
    total_valor DECIMAL(10, 2) NOT NULL,
    data_emissao DATE NOT NULL,
    url_pdf VARCHAR(255) NOT NULL
);

CREATE TABLE detalhes_consumo (
    id SERIAL PRIMARY KEY,
    fatura_id INTEGER REFERENCES faturas(id),
    tipo_consumo VARCHAR(255) NOT NULL,
    quantidade_kwh DECIMAL(10, 2) NOT NULL,
    valor DECIMAL(10, 2) NOT NULL
);
```
4. **Executando a aplicação**
   ```bash
   yarn dev
   ```

   Endpoints
Upload Faturas:

URL: /upload-faturas
Método: POST
Descrição: Faz o upload de um arquivo PDF de fatura e extrai seus dados.
Requisição: FormData com file (arquivo PDF) e clienteId (ID do Cliente).
Get Fatura URLs:

URL: /fatura-url/:clienteId
Método: GET
Descrição: Recupera todas as URLs de faturas para um determinado ID de cliente.
Construído com
Node.js - Ambiente de execução JavaScript
Express - Framework web para Node.js
TypeORM - ORM para TypeScript e JavaScript
PostgreSQL - Banco de dados relacional open-source
