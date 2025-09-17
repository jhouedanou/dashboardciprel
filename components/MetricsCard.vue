<template>
  <v-card class="metrics-card" elevation="4" :style="{ borderTop: `4px solid ${iconColor}` }">
    <v-card-title class="d-flex align-center pb-2">
      <v-avatar :color="iconColor" size="48" class="me-3">
        <v-icon :icon="icon" color="white" size="large"></v-icon>
      </v-avatar>
      <div class="flex-grow-1">
        <div class="d-flex align-center">
          <div class="text-h6 font-weight-bold text-primary">{{ title }}</div>
          <v-tooltip location="top" v-if="explanation">
            <template v-slot:activator="{ props }">
              <v-icon 
                v-bind="props" 
                icon="mdi-help-circle-outline" 
                size="small" 
                color="grey-darken-1" 
                class="ms-2"
              ></v-icon>
            </template>
            <div class="pa-2" style="max-width: 300px;">
              <div class="font-weight-bold mb-1">{{ title }}</div>
              <div>{{ explanation }}</div>
            </div>
          </v-tooltip>
        </div>
        <div class="text-caption text-medium-emphasis">{{ subtitle }}</div>
      </div>
    </v-card-title>
    <v-card-text class="pt-0">
      <div class="text-h3 font-weight-black mb-2" :style="{ color: iconColor }">
        {{ formattedValue }}
      </div>
      <div v-if="change !== null" class="d-flex align-center">
        <v-chip 
          :color="change >= 0 ? 'success' : 'error'"
          variant="flat"
          size="small"
          class="me-2"
        >
          <v-icon 
            :icon="change >= 0 ? 'mdi-trending-up' : 'mdi-trending-down'"
            size="small"
            class="me-1"
          ></v-icon>
          {{ Math.abs(change).toFixed(1) }}%
        </v-chip>
        <span class="text-caption text-medium-emphasis">vs période précédente</span>
      </div>
      <div v-if="insight" class="mt-2">
        <v-chip color="info" variant="tonal" size="small">
          <v-icon icon="mdi-lightbulb" size="x-small" class="me-1"></v-icon>
          {{ insight }}
        </v-chip>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
interface Props {
  title: string
  subtitle?: string
  value: number
  change?: number | null
  icon: string
  iconColor?: string
  valueColor?: string
  formatType?: 'number' | 'duration' | 'percentage'
  insight?: string
  explanation?: string
}

const props = withDefaults(defineProps<Props>(), {
  subtitle: '',
  change: null,
  iconColor: 'primary',
  valueColor: 'text-primary',
  formatType: 'number'
})

const formattedValue = computed(() => {
  switch (props.formatType) {
    case 'duration':
      const minutes = Math.floor(props.value / 60)
      const seconds = Math.floor(props.value % 60)
      return `${minutes}m ${seconds}s`
    case 'percentage':
      return `${props.value.toFixed(1)}%`
    default:
      return props.value.toLocaleString('fr-FR')
  }
})
</script>

<style scoped>
.metrics-card {
  height: 100%;
}
</style>