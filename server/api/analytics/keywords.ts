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

    console.log('📊 Making Analytics keywords request...')

    const response = await analyticsData.properties.runReport({
      property: `properties/${config.googleAnalyticsPropertyId}`,
      requestBody: {
        dateRanges: [{ startDate: startDate as string, endDate: endDate as string }],
        metrics: [
          { name: 'sessions' },
          { name: 'totalUsers' },
          { name: 'screenPageViews' }
        ],
        dimensions: [
          { name: 'sessionGoogleAdsKeyword' },
          { name: 'sessionManualTerm' }
        ],
        dimensionFilter: {
          andGroup: {
            expressions: [
              {
                filter: {
                  fieldName: 'sessionDefaultChannelGrouping',
                  stringFilter: {
                    matchType: 'EXACT',
                    value: 'Organic Search'
                  }
                }
              }
            ]
          }
        },
        orderBys: [
          {
            metric: { metricName: 'sessions' },
            desc: true
          }
        ],
        limit: 20
      }
    })

    console.log('✅ Analytics keywords received:', response.data.rows?.length, 'keywords')
    return {
      success: true,
      data: response.data
    }
  } catch (error: any) {
    console.error('❌ Analytics Keywords API Error:', {
      message: error.message,
      code: error.code,
      status: error.status
    })
    
    return {
      success: false,
      error: error.message || 'Failed to fetch keywords data',
      code: error.code,
      status: error.status
    }
  }
})