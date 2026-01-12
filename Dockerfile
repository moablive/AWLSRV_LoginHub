# Imagem base leve do Node 20
FROM node:20-alpine

# Define diretório de trabalho
WORKDIR /usr/src/app

# 1. Copia apenas os arquivos de dependência primeiro (Cache Layering)
COPY package*.json ./

# 2. Instala dependências (incluindo devDependencies para rodar o 'tsc')
RUN npm install

# 3. Copia o restante do código fonte
COPY . .

# 4. Executa o Build (TS -> JS na pasta dist)
RUN npm run build

# 5. Expõe a porta
EXPOSE 3000

# 6. Comando de inicialização (usa o script 'start' do package.json)
CMD ["npm", "start"]