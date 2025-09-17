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

    console.log('📊 Making Analytics traffic groups request...')

    // 1. Google Search (mots-clés organiques)
    const googleSearchResponse = await analyticsData.properties.runReport({
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
        limit: 5
      }
    })

    // 2. Sites Référents
    const referralsResponse = await analyticsData.properties.runReport({
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
        limit: 5
      }
    })

    // 3. Accès Directs
    const directAccessResponse = await analyticsData.properties.runReport({
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
          andGroup: {
            expressions: [
              {
                filter: {
                  fieldName: 'sessionDefaultChannelGrouping',
                  stringFilter: {
                    matchType: 'EXACT',
                    value: 'Direct'
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
        limit: 5
      }
    })

    // Traitement des données Google Search
    const googleSearchData = googleSearchResponse.data.rows?.map(row => {
      const keyword = row.dimensionValues[0].value || row.dimensionValues[1].value || 'Recherche organique'
      return {
        type: 'google',
        title: 'Recherche Google',
        source: keyword,
        sessions: parseInt(row.metricValues[0].value) || 0,
        users: parseInt(row.metricValues[1].value) || 0,
        pageviews: parseInt(row.metricValues[2].value) || 0
      }
    }) || []

    // Traitement des données Sites Référents
    const referralsData = referralsResponse.data.rows?.map(row => {
      const source = row.dimensionValues[0].value
      const medium = row.dimensionValues[1].value
      return {
        type: 'referral',
        title: 'Sites Référents',
        source: source,
        sessions: parseInt(row.metricValues[0].value) || 0,
        users: parseInt(row.metricValues[1].value) || 0,
        pageviews: parseInt(row.metricValues[2].value) || 0
      }
    }) || []

    // Traitement des données Accès Directs
    const directAccessData = directAccessResponse.data.rows?.map(row => {
      const source = row.dimensionValues[0].value
      return {
        type: 'direct',
        title: 'Accès Direct',
        source: source === '(direct)' ? 'Accès direct' : source,
        sessions: parseInt(row.metricValues[0].value) || 0,
        users: parseInt(row.metricValues[1].value) || 0,
        pageviews: parseInt(row.metricValues[2].value) || 0
      }
    }) || []

    console.log('✅ Analytics traffic groups received:', {
      google: googleSearchData.length,
      referrals: referralsData.length,
      direct: directAccessData.length
    })

    return {
      success: true,
      data: {
        googleSearch: googleSearchData,
        referrals: referralsData,
        directAccess: directAccessData
      }
    }
  } catch (error: any) {
    console.error('❌ Analytics Traffic Groups API Error:', {
      message: error.message,
      code: error.code,
      status: error.status
    })
    
    return {
      success: false,
      error: error.message || 'Failed to fetch traffic groups data',
      code: error.code,
      status: error.status
    }
  }
})
