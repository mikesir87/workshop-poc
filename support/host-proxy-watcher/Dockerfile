FROM node:lts-slim AS base
WORKDIR /usr/local/app
RUN apt update && \
    apt install -y socat && \
    rm -rf /var/lib/apt/lists/*

COPY package* ./
RUN npm install --omit=dev
COPY ./src ./src

FROM base AS dev
ENV NODE_ENV=development
RUN npm install
CMD ["npm", "run", "dev"]

FROM base AS final
ENV NODE_ENV=production
CMD ["node", "src/index.js"]
