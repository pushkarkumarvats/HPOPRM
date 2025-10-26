# Contracts Dockerfile: for running a local Hardhat node
FROM node:18-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --no-audit --no-fund
COPY . .
EXPOSE 8545
CMD ["npx", "hardhat", "node"]
