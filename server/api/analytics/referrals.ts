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

    console.log('📊 Making Analytics referrals request...')

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
          { name: 'sessionSource' },
          { name: 'sessionMedium' }
        ],
        dimensionFilter: {
          orGroup: {
            expressions: [
              {
                filter: {
                  fieldName: 'sessionDefaultChannelGrouping',
                  stringFilter: {
                    matchType: 'EXACT',
                    value: 'Referral'
                  }
                }
              },
              {
                filter: {
                  fieldName: 'sessionDefaultChannelGrouping',
                  stringFilter: {
                    matchType: 'EXACT',
                    value: 'Social'
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
        limit: 15
      }
    })

    console.log('✅ Analytics referrals received:', response.data.rows?.length, 'referrals')
    return {
      success: true,
      data: response.data
    }
  } catch (error: any) {
    console.error('❌ Analytics Referrals API Error:', {
      message: error.message,
      code: error.code,
      status: error.status
    })
    
    return {
      success: false,
      error: error.message || 'Failed to fetch referrals data',
      code: error.code,
      status: error.status
    }
  }
})