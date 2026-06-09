FROM node:20-alpine

# Set working directory
WORKDIR /app

# The frontend code will be volume mounted in development.
# We just need to expose the port and provide a command to install deps and run.
EXPOSE 5173

# En desarrollo, el comando de compose será responsable de 'npm i' y vite.
# Sin embargo, agregamos un dummy config para que no falle el contenedor inicialmente si se corre sin volumen
COPY package*.json ./

CMD ["sh", "-c", "npm install && npm run dev"]
