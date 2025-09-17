import { google } from 'googleapis'

const analyticsData = google.analyticsdata('v1beta')

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: config.googleClientEmail,
        private_key: config.googlePrivateKey?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
    })

    const authClient = await auth.getClient()
    google.options({ auth: authClient })

    const query = getQuery(event)
    const { startDate = '30daysAgo', endDate = 'today' } = query

    console.log('📊 Making Analytics summary request...')

    // Requête sans dimensions pour avoir les totaux
    const response = await analyticsData.properties.runReport({
      property: `properties/${config.googleAnalyticsPropertyId}`,
      requestBody: {
        dateRanges: [{ startDate: startDate as string, endDate: endDate as string }],
        metrics: [
          { name: 'sessions' },
          { name: 'totalUsers' },
          { name: 'screenPageViews' },
          { name: 'bounceRate' },
          { name: 'averageSessionDuration' }
        ],
        // Pas de dimensions = totaux seulement
      }
    })

    console.log('✅ Analytics summary received')
    return {
      success: true,
      data: response.data
    }
  } catch (error: any) {
    console.error('❌ Analytics Summary API Error:', {
      message: error.message,
      code: error.code,
      status: error.status
    })
    
    return {
      success: false,
      error: error.message || 'Failed to fetch analytics summary',
      code: error.code,
      status: error.status
    }
  }
})