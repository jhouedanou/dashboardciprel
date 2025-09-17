import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { aliases, mdi } from 'vuetify/iconsets/mdi'

export default defineNuxtPlugin((app) => {
  const vuetify = createVuetify({
    components,
    directives,
    icons: {
      defaultSet: 'mdi',
      aliases,
      sets: {
        mdi,
      },
    },
    theme: {
      defaultTheme: 'light',
      themes: {
        light: {
          colors: {
            primary: '#244370',      // Indigo CIPREL
            secondary: '#0C942E',    // Forest Green CIPREL
            accent: '#FF7D23',       // Pumpkin CIPREL
            error: '#ED7F05',        // Tangerine
            info: '#244370',         // Indigo CIPREL
            success: '#0C942E',      // Forest Green CIPREL
            warning: '#FF7D23',      // Pumpkin CIPREL
            surface: '#FFFFFF',      // White CIPREL
            'ciprel-orange': '#FF7D23',
            'ciprel-tangerine': '#ED7F05',
            'ciprel-green': '#0C942E',
            'ciprel-blue': '#244370',
          },
        },
      },
    },
  })
  app.vueApp.use(vuetify)
})