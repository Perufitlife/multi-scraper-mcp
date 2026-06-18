FROM node:22-alpine
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev
COPY index.js tools.js README.md ./
ENTRYPOINT ["node", "index.js"]
