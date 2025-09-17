<template>
  <v-card elevation="2">
    <v-card-title class="d-flex align-center justify-space-between">
      <span>{{ title }}</span>
      <v-btn-toggle v-model="selectedMetric" mandatory>
        <v-btn size="small" value="sessions">Sessions</v-btn>
        <v-btn size="small" value="users">Utilisateurs</v-btn>
        <v-btn size="small" value="pageviews">Pages vues</v-btn>
      </v-btn-toggle>
    </v-card-title>
    <v-card-text>
      <div class="chart-container">
        <Line
          v-if="chartData && chartOptions"
          :data="chartData"
          :options="chartOptions"
        />
        <div v-else class="d-flex justify-center align-center" style="height: 300px;">
          <v-progress-circular indeterminate color="primary"></v-progress-circular>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

interface Props {
  title: string
  data: Array<{
    date: string
    sessions: number
    users: number
    pageviews: number
  }>
}

const props = defineProps<Props>()
const selectedMetric = ref('sessions')

const chartData = computed(() => {
  if (!props.data || props.data.length === 0) return null

  const labels = props.data.map(item => {
    const date = new Date(item.date.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3'))
    return date.toLocaleDateString('fr-FR', { 
      month: 'short', 
      day: 'numeric' 
    })
  })

  const values = props.data.map(item => item[selectedMetric.value as keyof typeof item] as number)

  return {
    labels,
    datasets: [
      {
        label: getMetricLabel(selectedMetric.value),
        data: values,
        borderColor: '#1976D2',
        backgroundColor: 'rgba(25, 118, 210, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#1976D2',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      }
    ]
  }
})

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleColor: '#ffffff',
      bodyColor: '#ffffff',
      borderColor: '#1976D2',
      borderWidth: 1,
    }
  },
  scales: {
    x: {
      grid: {
        display: true,
        color: 'rgba(0, 0, 0, 0.1)'
      },
      ticks: {
        color: '#666666'
      }
    },
    y: {
      beginAtZero: true,
      grid: {
        display: true,
        color: 'rgba(0, 0, 0, 0.1)'
      },
      ticks: {
        color: '#666666',
        callback: function(value: any) {
          return value.toLocaleString('fr-FR')
        }
      }
    }
  },
  interaction: {
    intersect: false,
    mode: 'index' as const
  }
}))

function getMetricLabel(metric: string): string {
  const labels = {
    sessions: 'Sessions',
    users: 'Utilisateurs',
    pageviews: 'Pages vues'
  }
  return labels[metric as keyof typeof labels] || metric
}
</script>

<style scoped>
.chart-container {
  height: 300px;
  position: relative;
}
</style>