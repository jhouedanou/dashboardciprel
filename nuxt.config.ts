export default defineNuxtConfig({
  devtools: { enabled: true },
  css: ['vuetify/lib/styles/main.sass', '@mdi/font/css/materialdesignicons.min.css'],
  build: {
    transpile: ['vuetify']
  },
  runtimeConfig: {
    googleClientEmail: process.env.GOOGLE_CLIENT_EMAIL,
    googlePrivateKey: process.env.GOOGLE_PRIVATE_KEY,
    googleAnalyticsPropertyId: process.env.GOOGLE_ANALYTICS_PROPERTY_ID,
    public: {
      googleAnalyticsId: process.env.GOOGLE_ANALYTICS_ID
    }
  }
})