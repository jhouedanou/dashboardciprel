export interface AnalyticsData {
  sessions: number
  users: number
  pageviews: number
  date: string
}

export interface AnalyticsResponse {
  success: boolean
  data?: {
    rows?: Array<{
      dimensionValues: Array<{ value: string }>
      metricValues: Array<{ value: string }>
    }>
    totals?: Array<{
      metricValues: Array<{ value: string }>
    }>
  }
  error?: string
}

export const useAnalytics = () => {
  const fetchAnalyticsData = async (params: {
    startDate?: string
    endDate?: string
  } = {}): Promise<AnalyticsData[]> => {
    try {
      const response = await $fetch<AnalyticsResponse>('/api/analytics', {
        query: params
      })

      if (!response?.success || !response.data?.rows) {
        throw new Error(response?.error || 'No data received')
      }

      return response.data.rows.map(row => ({
        date: row.dimensionValues[0].value,
        sessions: parseInt(row.metricValues[0].value) || 0,
        users: parseInt(row.metricValues[1].value) || 0,
        pageviews: parseInt(row.metricValues[2].value) || 0
      }))
    } catch (error) {
      console.error('Failed to fetch analytics data:', error)
      throw error
    }
  }

  const getMetricsSummary = async (startDate = '30daysAgo', endDate = 'today') => {
    try {
      const response = await $fetch<AnalyticsResponse>('/api/analytics/summary', {
        query: { startDate, endDate }
      })

      if (!response?.success || !response.data?.rows?.[0]) {
        throw new Error(response?.error || 'No summary data received')
      }

      const metrics = response.data.rows[0].metricValues
      return {
        sessions: parseInt(metrics[0].value) || 0,
        users: parseInt(metrics[1].value) || 0,
        pageviews: parseInt(metrics[2].value) || 0,
        bounceRate: parseFloat(metrics[3].value) * 100 || 0, // Convertir en pourcentage
        avgSessionDuration: parseFloat(metrics[4].value) || 0
      }
    } catch (error) {
      console.error('Failed to fetch metrics summary:', error)
      throw error
    }
  }

  const fetchTrafficSources = async (startDate = '30daysAgo', endDate = 'today') => {
    try {
      const response = await $fetch<AnalyticsResponse>('/api/analytics/sources', {
        query: { startDate, endDate }
      })

      if (!response?.success || !response.data?.rows) {
        throw new Error(response?.error || 'No traffic sources data received')
      }

      return response.data.rows.map(row => ({
        channel: row.dimensionValues[0].value,
        source: row.dimensionValues[1].value,
        sessions: parseInt(row.metricValues[0].value) || 0,
        users: parseInt(row.metricValues[1].value) || 0
      }))
    } catch (error) {
      console.error('Failed to fetch traffic sources:', error)
      throw error
    }
  }

  const fetchTopPages = async (section: 'articles' | 'news' | 'all' = 'all', startDate = '30daysAgo', endDate = 'today') => {
    try {
      const response = await $fetch<AnalyticsResponse>('/api/analytics/pages', {
        query: { startDate, endDate, section }
      })

      if (!response?.success || !response.data?.rows) {
        throw new Error(response?.error || 'No pages data received')
      }

      return response.data.rows.map(row => ({
        path: row.dimensionValues[0].value,
        title: row.dimensionValues[1].value,
        views: parseInt(row.metricValues[0].value) || 0,
        users: parseInt(row.metricValues[1].value) || 0,
        avgDuration: parseFloat(row.metricValues[2].value) || 0
      }))
    } catch (error) {
      console.error('Failed to fetch top pages:', error)
      throw error
    }
  }

  const fetchTrafficGroups = async (startDate = '30daysAgo', endDate = 'today') => {
    try {
      const response = await $fetch<{
        success: boolean
        data: {
          googleSearch: Array<{
            type: string
            title: string
            source: string
            sessions: number
            users: number
            pageviews: number
          }>
          referrals: Array<{
            type: string
            title: string
            source: string
            sessions: number
            users: number
            pageviews: number
          }>
          directAccess: Array<{
            type: string
            title: string
            source: string
            sessions: number
            users: number
            pageviews: number
          }>
        }
        error?: string
      }>('/api/analytics/traffic-groups', {
        query: { startDate, endDate }
      })

      if (!response?.success || !response.data) {
        throw new Error(response?.error || 'No traffic groups data received')
      }

      return response.data
    } catch (error) {
      console.error('Failed to fetch traffic groups:', error)
      throw error
    }
  }

  return {
    fetchAnalyticsData,
    getMetricsSummary,
    fetchTrafficSources,
    fetchTopPages,
    fetchTrafficGroups
  }
}