import type { HttpContext } from '@adonisjs/core/http'
import swaggerJSDocImport from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'
import swaggerConfig from '#config/swagger'

const swaggerJSDoc = swaggerJSDocImport as unknown as (options: any) => any
const swaggerSpec = swaggerJSDoc(swaggerConfig)

export default class Swagger_controller {
  /**
   * Serve the Swagger UI HTML
   */
  public async show({ response }: HttpContext) {
    // Generate HTML with custom options
    console.log("Swagger spec keys:", Object.keys(swaggerSpec));
    let html = swaggerUi.generateHTML(swaggerSpec, {
      explorer: true,
      swaggerOptions: {
        url: '/api-docs/swagger.json', // Point to your JSON endpoint
      }
    })

    // Replace relative asset paths with CDN URLs from unpkg
    html = html.replace(/href="\.\/swagger-ui\.css"/g, 'href="https://unpkg.com/swagger-ui-dist/swagger-ui.css"')
      .replace(/src="\.\/swagger-ui-bundle\.js"/g, 'src="https://unpkg.com/swagger-ui-dist/swagger-ui-bundle.js"')
      .replace(/src="\.\/swagger-ui-standalone-preset\.js"/g, 'src="https://unpkg.com/swagger-ui-dist/swagger-ui-standalone-preset.js"')
      .replace(/src="\.\/swagger-ui-init\.js"/g, 'src="https://unpkg.com/swagger-ui-dist/swagger-ui-init.js"')

    // Remove stray "undefined" in style tags, if any
    html = html.replace(/<style>\s*undefined\s*<\/style>/g, '')

    // Add initialization script right before the closing body tag
    const initScript = `
<script>
  window.onload = function() {
    const ui = SwaggerUIBundle({
      url: "/api-docs/swagger.json",
      dom_id: '#swagger-ui',
      deepLinking: true,
      presets: [
        SwaggerUIBundle.presets.apis,
        SwaggerUIStandalonePreset
      ],
      plugins: [
        SwaggerUIBundle.plugins.DownloadUrl
      ],
      layout: "StandaloneLayout"
    });
    window.ui = ui;
  };
</script>
    `
    html = html.replace('</body>', `${initScript}\n</body>`)

    return response.type('text/html').send(html)
  }

  /**
   * Serve the raw Swagger JSON spec
   */
  public async spec({ response }: HttpContext) {
    return response.json(swaggerSpec)
  }
}
