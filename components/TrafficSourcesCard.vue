<template>
  <v-card elevation="4" class="traffic-sources-card">
    <v-card-title class="d-flex align-center bg-primary text-white">
      <v-icon icon="mdi-map-marker-radius" class="me-2"></v-icon>
      <span class="text-h6 font-weight-bold">D'où viennent nos visiteurs ?</span>
    </v-card-title>
    
    <v-card-text class="pa-0">
      <v-list v-if="trafficSources && trafficSources.length > 0" class="py-0">
        <v-list-item
          v-for="(source, index) in trafficSources"
          :key="index"
          class="px-4 py-3"
          :class="{ 'bg-grey-lighten-5': index % 2 === 0 }"
        >
          <template v-slot:prepend>
            <v-avatar :color="getChannelColor(source.channel)" size="40">
              <v-icon :icon="getChannelIcon(source.channel)" color="white"></v-icon>
            </v-avatar>
          </template>
          
          <v-list-item-title class="font-weight-bold text-body-1">
            {{ getChannelLabel(source.channel) }}
          </v-list-item-title>
          <v-list-item-subtitle class="text-caption">
            {{ source.source }} • {{ source.users }} visiteurs uniques
          </v-list-item-subtitle>
          
          <template v-slot:append>
            <div class="text-end">
              <div class="text-h6 font-weight-bold text-ciprel-orange">
                {{ source.sessions.toLocaleString() }}
              </div>
              <div class="text-caption text-medium-emphasis">sessions</div>
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
interface TrafficSource {
  channel: string
  source: string
  sessions: number
  users: number
}

interface Props {
  trafficSources: TrafficSource[]
  loading?: boolean
}

defineProps<Props>()

const getChannelIcon = (channel: string): string => {
  const icons: Record<string, string> = {
    'Organic Search': 'mdi-google',
    'Direct': 'mdi-account-arrow-right',
    'Social': 'mdi-facebook',
    'Referral': 'mdi-link-variant',
    'Email': 'mdi-email',
    'Paid Search': 'mdi-google-ads',
    'Display': 'mdi-monitor-screenshot',
    'Affiliate': 'mdi-handshake'
  }
  return icons[channel] || 'mdi-web'
}

const getChannelColor = (channel: string): string => {
  const colors: Record<string, string> = {
    'Organic Search': '#4285F4',    // Google Blue
    'Direct': '#0C942E',           // CIPREL Green
    'Social': '#1877F2',           // Facebook Blue
    'Referral': '#FF7D23',         // CIPREL Orange
    'Email': '#EA4335',            // Gmail Red
    'Paid Search': '#FBBC04',      // Google Yellow
    'Display': '#244370',          // CIPREL Blue
    'Affiliate': '#34A853'         // Google Green
  }
  return colors[channel] || '#757575'
}

const getChannelLabel = (channel: string): string => {
  const labels: Record<string, string> = {
    'Organic Search': 'Recherche Google',
    'Direct': 'Accès Direct',
    'Social': 'Réseaux Sociaux',
    'Referral': 'Sites Référents',
    'Email': 'Email Marketing',
    'Paid Search': 'Publicité Google',
    'Display': 'Bannières Pub',
    'Affiliate': 'Partenaires'
  }
  return labels[channel] || channel
}
</script>

<style scoped>
.traffic-sources-card {
  height: 100%;
}
</style>