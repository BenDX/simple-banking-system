FROM node:20-alpine

# 設定工作目錄
WORKDIR /app

# 複製所有檔案到 workdir
COPY . .

# 安裝依賴套件
RUN npm install

# Expose port
EXPOSE 3000

# 執行 express server
CMD ["npm", "start"]