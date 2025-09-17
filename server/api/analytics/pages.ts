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
    const { startDate = '30daysAgo', endDate = 'today', section } = query

    console.log('📊 Making Analytics pages request for section:', section)

    let dimensionFilter = undefined
    if (section === 'articles') {
      dimensionFilter = {
        filter: {
          fieldName: 'pagePath',
          stringFilter: {
            matchType: 'CONTAINS',
            value: '/elementor-1462/'
          }
        }
      }
    } else if (section === 'news') {
      dimensionFilter = {
        filter: {
          fieldName: 'pagePath',
          stringFilter: {
            matchType: 'CONTAINS',
            value: '/elementor-1445/'
          }
        }
      }
    }

    const response = await analyticsData.properties.runReport({
      property: `properties/${config.googleAnalyticsPropertyId}`,
      requestBody: {
        dateRanges: [{ startDate: startDate as string, endDate: endDate as string }],
        metrics: [
          { name: 'screenPageViews' },
          { name: 'totalUsers' },
          { name: 'averageSessionDuration' }
        ],
        dimensions: [
          { name: 'pagePath' },
          { name: 'pageTitle' }
        ],
        dimensionFilter,
        orderBys: [
          {
            metric: { metricName: 'screenPageViews' },
            desc: true
          }
        ],
        limit: 10
      }
    })

    console.log('✅ Analytics pages received:', response.data.rows?.length, 'pages')
    return {
      success: true,
      data: response.data
    }
  } catch (error: any) {
    console.error('❌ Analytics Pages API Error:', {
      message: error.message,
      code: error.code,
      status: error.status
    })
    
    return {
      success: false,
      error: error.message || 'Failed to fetch pages data',
      code: error.code,
      status: error.status
    }
  }
})