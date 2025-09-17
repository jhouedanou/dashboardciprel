<template>
  <v-card elevation="4" class="top-pages-card">
    <v-card-title class="d-flex align-center" :class="titleColor">
      <v-icon :icon="icon" class="me-2"></v-icon>
      <span class="text-h6 font-weight-bold text-white">{{ title }}</span>
    </v-card-title>
    
    <v-card-text class="pa-0">
      <v-list v-if="pages && pages.length > 0" class="py-0">
        <v-list-item
          v-for="(page, index) in pages"
          :key="index"
          class="px-4 py-3"
          :class="{ 'bg-grey-lighten-5': index % 2 === 0 }"
        >
          <template v-slot:prepend>
            <v-chip
              :color="index < 3 ? 'warning' : 'info'"
              size="small"
              class="font-weight-bold"
            >
              #{{ index + 1 }}
            </v-chip>
          </template>
          
          <v-list-item-title class="font-weight-medium text-body-2">
            {{ cleanPageTitle(page.title) }}
          </v-list-item-title>
          <v-list-item-subtitle class="text-caption">
            {{ page.users }} visiteurs • {{ formatDuration(page.avgDuration) }} temps moyen
          </v-list-item-subtitle>
          
          <template v-slot:append>
            <div class="text-end">
              <div class="text-h6 font-weight-bold" :class="valueColor">
                {{ page.views.toLocaleString() }}
              </div>
              <div class="text-caption text-medium-emphasis">vues</div>
            </div>
          </template>
        </v-list-item>
      </v-list>
      
      <div v-else class="pa-4 text-center">
        <v-progress-circular v-if="loading" indeterminate color="primary"></v-progress-circular>
        <div v-else class="text-medium-emphasis">Aucune donnée disponible</div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
interface TopPage {
  path: string
  title: string
  views: number
  users: number
  avgDuration: number
}

interface Props {
  title: string
  pages: TopPage[]
  loading?: boolean
  icon?: string
  titleColor?: string
  valueColor?: string
}

const props = withDefaults(defineProps<Props>(), {
  icon: 'mdi-file-document',
  titleColor: 'bg-secondary',
  valueColor: 'text-ciprel-orange'
})

const cleanPageTitle = (title: string): string => {
  if (!title || title === '(not set)') return 'Page sans titre'
  
  // Nettoyer les titres longs et peu lisibles
  return title
    .replace(/^CIPREL\s*[-|]\s*/, '')
    .replace(/\s*[-|]\s*CIPREL.*$/, '')
    .replace(/elementor-\d+/, '')
    .trim() || 'Page sans titre'
}

const formatDuration = (seconds: number): string => {
  if (seconds < 60) return `${Math.round(seconds)}s`
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.round(seconds % 60)
  return `${minutes}m${remainingSeconds > 0 ? ` ${remainingSeconds}s` : ''}`
}
</script>

<style scoped>
.top-pages-card {
  height: 100%;
}
</style>