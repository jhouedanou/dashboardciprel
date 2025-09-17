import { google } from 'googleapis'

const analyticsData = google.analyticsdata('v1beta')

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    
    console.log('🔍 Configuration check:')
    console.log('- Property ID:', config.googleAnalyticsPropertyId)
    console.log('- Client Email:', config.googleClientEmail?.substring(0, 20) + '...')
    console.log('- Has Private Key:', !!config.googlePrivateKey)
    
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: config.googleClientEmail,
        private_key: config.googlePrivateKey?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
    })

    console.log('🔐 Authenticating...')
    const authClient = await auth.getClient()
    google.options({ auth: authClient })

    const query = getQuery(event)
    const { startDate = '30daysAgo', endDate = 'today' } = query

    console.log('📊 Making Analytics request...')
    console.log('- Property:', `properties/${config.googleAnalyticsPropertyId}`)
    console.log('- Date range:', startDate, 'to', endDate)

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
        dimensions: [{ name: 'date' }],
        keepEmptyRows: true,
        returnPropertyQuota: true
      }
    })

    console.log('✅ Analytics data received:', response.data.rows?.length, 'rows')
    return {
      success: true,
      data: response.data
    }
  } catch (error: any) {
    console.error('❌ Analytics API Error:', {
      message: error.message,
      code: error.code,
      status: error.status,
      details: error.details
    })
    
    return {
      success: false,
      error: error.message || 'Failed to fetch analytics data',
      code: error.code,
      status: error.status
    }
  }
})