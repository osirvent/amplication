ARG IMAGE=node@sha256:d0738468dfc7cedb7d260369e0546fd7ee8731cfd67136f6023d070ad9679090

FROM $IMAGE

ENV OPENCOLLECTIVE_HIDE=1

WORKDIR /app

COPY package.json package-lock.json prisma ./

RUN npm ci --silent

COPY . .

RUN npm run build

EXPOSE 3000

CMD [ "node", "dist/main"]