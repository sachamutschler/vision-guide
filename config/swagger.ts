import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Vision Guide API',
      version: '1.0.0',
      description: 'API documentation for Vision Guide',
    },
    servers: [
      {
        url: 'http://localhost:3333',
        description: 'Local server',
      },
    ],
  },
  // Now using the computed __dirname:
  apis: [path.join(__dirname, '../start/routes.ts')],
}
