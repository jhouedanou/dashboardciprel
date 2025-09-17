<template>
  <v-app>
    <v-app-bar color="white" elevation="2">
      <v-app-bar-title class="d-flex align-center">
        <img :src="logoUrl" alt="CIPREL" style="height:57px;" class="m-0" />
      </v-app-bar-title>
      <v-spacer></v-spacer>
      
      <!-- Bouton d'impression PDF -->
      <v-btn
        color="primary"
        variant="outlined"
        class="me-3"
        prepend-icon="mdi-printer"
        @click="printToPDF"
      >
        Imprimer PDF
      </v-btn>
      
      <v-menu>
        <template v-slot:activator="{ props }">
          <v-btn
            color="warning"
            variant="outlined"
            v-bind="props"
            prepend-icon="mdi-calendar-range"
          >
            {{ getPeriodLabel() }}
            <v-icon icon="mdi-chevron-down" class="ms-2"></v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-subheader class="font-weight-bold">PÉRIODES RAPIDES</v-list-subheader>
          <v-list-item
            v-for="period in quickPeriods"
            :key="period.value"
            :value="period.value"
            @click="selectedPeriod = period.value"
            :class="{ 'bg-warning text-white': selectedPeriod === period.value }"
          >
            <v-list-item-title>{{ period.label }}</v-list-item-title>
            <v-list-item-subtitle>{{ period.description }}</v-list-item-subtitle>
          </v-list-item>
          
          <v-divider class="my-2"></v-divider>
          
          <v-list-subheader class="font-weight-bold">PÉRIODES ÉTENDUES</v-list-subheader>
          <v-list-item
            v-for="period in extendedPeriods"
            :key="period.value"
            :value="period.value"
            @click="selectedPeriod = period.value"
            :class="{ 'bg-warning text-white': selectedPeriod === period.value }"
          >
            <v-list-item-title>{{ period.label }}</v-list-item-title>
            <v-list-item-subtitle>{{ period.description }}</v-list-item-subtitle>
          </v-list-item>

          <v-divider class="my-2"></v-divider>
          
          <v-list-subheader class="font-weight-bold">PLAGE PERSONNALISÉE</v-list-subheader>
          <v-list-item @click="dateRangeMenu = true">
            <template v-slot:prepend>
              <v-icon>mdi-calendar-edit</v-icon>
            </template>
            <v-list-item-title>Choisir des dates</v-list-item-title>
            <v-list-item-subtitle>{{ customDateRange.start && customDateRange.end 
              ? `${formatDate(customDateRange.start)} - ${formatDate(customDateRange.end)}`
              : 'Sélectionner une plage'
            }}</v-list-item-subtitle>
          </v-list-item>
        </v-list>
      </v-menu>

      <!-- Menu de sélection de plage de dates personnalisée -->
      <v-menu
        v-model="dateRangeMenu"
        :close-on-content-click="false"
        transition="scale-transition"
        offset-y
        min-width="400"
      >
        <template v-slot:activator="{ props }">
          <div v-bind="props"></div>
        </template>
        
        <v-card>
          <v-card-title class="text-h6 pa-4">
            <v-icon class="me-2">mdi-calendar-range</v-icon>
            Sélectionner une plage de dates
          </v-card-title>
          
          <v-card-text class="pa-4">
            <v-row>
              <v-col cols="6">
                <v-text-field
                  v-model="customDateRange.start"
                  label="Date de début"
                  type="date"
                  variant="outlined"
                  density="compact"
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="customDateRange.end"
                  label="Date de fin"
                  type="date"
                  variant="outlined"
                  density="compact"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-card-text>
          
          <v-card-actions class="pa-4">
            <v-spacer></v-spacer>
            <v-btn
              variant="text"
              @click="dateRangeMenu = false"
            >
              Annuler
            </v-btn>
            <v-btn
              color="primary"
              variant="flat"
              @click="applyCustomDateRange"
              :disabled="!customDateRange.start || !customDateRange.end"
            >
              Appliquer
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-menu>
    </v-app-bar>
    
    <!-- Arrière-plan avec blur et overlay -->
    <div class="app-bg">
      <div class="app-bg__image"></div>
      <div class="app-bg__overlay"></div>
    </div>

    <!-- Barre de chargement globale avec logo -->
    <v-progress-linear
      v-if="loading || loadingTraffic || loadingPages || loadingKeywords || loadingReferrals"
      color="primary"
      height="6"
      indeterminate
    >
      <template v-slot:default>
        <div class="d-flex align-center justify-center" style="gap:8px;">
          <img :src="logoUrl" alt="Chargement" style="height:18px;" />
          <span class="text-caption">Chargement des données...</span>
        </div>
      </template>
    </v-progress-linear>

    <v-main class="app-content">
      <v-container fluid class="pa-4">
        <v-row v-if="error" class="mb-4">
          <v-col cols="12">
            <v-alert type="error" dismissible @click:close="error = null">
              {{ error }}
            </v-alert>
          </v-col>
        </v-row>

        <!-- Métriques Principales - Version Marketing Friendly -->
        <v-row class="mb-6">
          <v-col cols="12" md="3">
            <v-skeleton-loader v-if="loading" type="card" class="h-100"></v-skeleton-loader>
            <MetricsCard v-else
              title="Sessions"
              subtitle="Nombre total de visites sur le site"
              :value="summary?.sessions || 0"
              icon="mdi-account-group"
              icon-color="#244370"
              :change="calculateChange('sessions')"
              :insight="getSessionsInsight(summary?.sessions || 0)"
              explanation="Une session correspond à une visite d'un utilisateur sur votre site. Elle commence quand l'utilisateur arrive et se termine après 30 minutes d'inactivité ou à minuit."
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-skeleton-loader v-if="loading" type="card" class="h-100"></v-skeleton-loader>
            <MetricsCard v-else
              title="Utilisateurs Uniques"
              subtitle="Visiteurs distincts identifiés"
              :value="summary?.users || 0"
              icon="mdi-account"
              icon-color="#0C942E"
              :change="calculateChange('users')"
              :insight="getUsersInsight(summary?.users || 0)"
              explanation="Nombre d'individus uniques qui ont visité votre site pendant la période sélectionnée. Chaque personne est comptée une seule fois, même si elle revient plusieurs fois. Cette métrique mesure la taille réelle de votre audience et l'étendue de votre portée. Un utilisateur unique peut générer plusieurs sessions (visites) mais n'est compté qu'une seule fois dans cette statistique."
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-skeleton-loader v-if="loading" type="card" class="h-100"></v-skeleton-loader>
            <MetricsCard v-else
              title="Pages Vues"
              subtitle="Nombre total de pages consultées"
              :value="summary?.pageviews || 0"
              icon="mdi-eye"
              icon-color="#FF7D23"
              :change="calculateChange('pageviews')"
              :insight="getPageviewsInsight(summary?.pageviews || 0)"
              explanation="Nombre total de pages web consultées par tous vos visiteurs pendant la période. Chaque chargement de page compte comme une page vue, y compris les rechargements et les retours sur la même page. Cette métrique indique l'engagement de votre audience et la richesse de votre contenu. Plus le nombre de pages vues est élevé par rapport aux sessions, plus vos visiteurs explorent votre site."
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-skeleton-loader v-if="loading" type="card" class="h-100"></v-skeleton-loader>
            <MetricsCard v-else
              title="Taux de Rebond"
              subtitle="Pourcentage de sessions à page unique"
              :value="summary?.bounceRate || 0"
              icon="mdi-exit-to-app"
              icon-color="#ED7F05"
              format-type="percentage"
              :insight="getBounceInsight(summary?.bounceRate || 0)"
              explanation="Pourcentage de visiteurs qui quittent votre site après avoir consulté une seule page sans interagir davantage. Un taux de rebond élevé (>70%) peut indiquer un problème de contenu, de navigation ou d'expérience utilisateur. Un taux faible (<40%) montre que vos visiteurs explorent plusieurs pages, signe d'un contenu engageant et d'une bonne structure de site. Le taux de rebond varie selon le type de site : un blog peut avoir un taux plus élevé qu'un site e-commerce."
            />
          </v-col>
        </v-row>

        <!-- Graphique Principal -->
        <v-row class="mb-6">
          <v-col cols="12">
            <v-skeleton-loader v-if="loading" type="image"></v-skeleton-loader>
            <AnalyticsChart v-else
              title="Évolution du Trafic Web"
              :data="analyticsData"
            />
          </v-col>
        </v-row>

        <!-- Sources de Trafic - 3 Groupes -->
        <v-row class="mb-6">
          <v-col cols="12">
            <v-card elevation="4" class="bg-gradient-to-r from-primary to-secondary text-white">
              <v-card-title class="d-flex align-center py-4">
                <v-avatar color="warning" size="48" class="me-3">
                  <v-icon icon="mdi-radar" size="large"></v-icon>
                </v-avatar>
                <div class="flex-grow-1">
                  <div class="text-h5 font-weight-black">SOURCES DE TRAFIC</div>
                  <div class="text-subtitle-1 opacity-80">Analyse des canaux d'acquisition par groupe</div>
                </div>
                <v-chip color="warning" variant="flat" class="font-weight-bold">
                  {{ getTotalSessions() }} sessions totales
                </v-chip>
              </v-card-title>
            </v-card>
          </v-col>
        </v-row>

        <!-- Grille des 3 Groupes de Sources -->
        <v-row class="mb-6">
          <!-- État de chargement -->
          <v-col 
            v-if="loadingTraffic" 
            v-for="n in 3" 
            :key="`loading-${n}`"
            cols="12" 
            md="4"
          >
            <v-skeleton-loader 
              type="card" 
              elevation="3"
              class="h-100"
            ></v-skeleton-loader>
          </v-col>
          
          <!-- Groupe 1: Google Search (sans détail mots-clés pour sobriété) -->
          <v-col cols="12" md="4">
            <v-card elevation="3" class="h-100" style="border-left: 4px solid #4285F4;">
              <v-card-title class="bg-blue-lighten-5 d-flex align-center">
                <v-avatar color="blue" size="40" class="me-3">
                  <v-icon icon="mdi-google" color="white"></v-icon>
                </v-avatar>
                <div>
                  <div class="text-h6 font-weight-bold text-blue-darken-2">Recherche Google</div>
                  <div class="text-caption text-blue-darken-1">Trafic organique</div>
                  </div>
              </v-card-title>
              <v-card-text class="pa-4">
                <div class="d-flex align-center justify-space-between">
                  <div class="text-h5 font-weight-bold text-blue-darken-2">
                    {{ (trafficGroups?.googleSearch || []).reduce((s, k) => s + (k.sessions || 0), 0).toLocaleString() }}
                  </div>
                  <div class="text-caption">sessions</div>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
          
          <!-- Groupe 2: Sites Référents -->
          <v-col cols="12" md="4">
            <v-card elevation="3" class="h-100" style="border-left: 4px solid #FF9800;">
              <v-card-title class="bg-orange-lighten-5 d-flex align-center">
                <v-avatar color="orange" size="40" class="me-3">
                  <v-icon icon="mdi-link" color="white"></v-icon>
                </v-avatar>
                <div>
                  <div class="text-h6 font-weight-bold text-orange-darken-2">Sites Référents</div>
                  <div class="text-caption text-orange-darken-1">Liens externes</div>
                </div>
              </v-card-title>
              <v-card-text class="pa-0">
                <v-list v-if="trafficGroups?.referrals && trafficGroups.referrals.length > 0">
                  <v-list-item
                    v-for="(referral, index) in trafficGroups.referrals.slice(0, 5)"
                    :key="index"
                    class="py-2"
                  >
                    <template v-slot:prepend>
                      <v-chip color="orange" size="small" class="font-weight-bold">
                        {{ index + 1 }}
                      </v-chip>
                    </template>
                    <v-list-item-title class="font-weight-medium">
                      {{ referral.source }}
                    </v-list-item-title>
                    <v-list-item-subtitle>
                      {{ referral.sessions.toLocaleString() }} sessions • {{ referral.users }} visiteurs
                    </v-list-item-subtitle>
                  </v-list-item>
                </v-list>
                <div v-else class="pa-4 text-center text-grey">
                  <v-icon icon="mdi-link-off" size="32" class="mb-2"></v-icon>
                  <div class="text-caption">Aucun site référent</div>
                </div>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Groupe 3: Accès Directs -->
          <v-col cols="12" md="4">
            <v-card elevation="3" class="h-100" style="border-left: 4px solid #4CAF50;">
              <v-card-title class="bg-green-lighten-5 d-flex align-center">
                <v-avatar color="green" size="40" class="me-3">
                  <v-icon icon="mdi-home" color="white"></v-icon>
                </v-avatar>
                <div>
                  <div class="text-h6 font-weight-bold text-green-darken-2">Accès Direct</div>
                  <div class="text-caption text-green-darken-1">URL directe ou favoris</div>
                </div>
              </v-card-title>
              <v-card-text class="pa-0">
                <v-list v-if="trafficGroups?.directAccess && trafficGroups.directAccess.length > 0">
                  <v-list-item
                    v-for="(direct, index) in trafficGroups.directAccess.slice(0, 5)"
                    :key="index"
                    class="py-2"
                  >
                    <template v-slot:prepend>
                      <v-chip color="green" size="small" class="font-weight-bold">
                        {{ index + 1 }}
                      </v-chip>
                    </template>
                    <v-list-item-title class="font-weight-medium">
                      {{ direct.source }}
                    </v-list-item-title>
                    <v-list-item-subtitle>
                      {{ direct.sessions.toLocaleString() }} sessions • {{ direct.users }} visiteurs
                    </v-list-item-subtitle>
                  </v-list-item>
                </v-list>
                <div v-else class="pa-4 text-center text-grey">
                  <v-icon icon="mdi-home-outline" size="32" class="mb-2"></v-icon>
                  <div class="text-caption">Aucun accès direct</div>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Top 10 Pages les Plus Consultées -->
        <v-row class="mb-6">
          <v-col cols="12">
            <v-skeleton-loader v-if="loadingPages" type="card"></v-skeleton-loader>
            <v-card v-else elevation="4">
              <v-card-title class="bg-gradient-to-r from-primary to-secondary text-white d-flex align-center">
                <v-icon icon="mdi-trending-up" class="me-2"></v-icon>
                <div class="flex-grow-1">
                  <div class="text-h5 font-weight-black">TOP 10 PAGES LES PLUS CONSULTÉES</div>
                  <div class="text-subtitle-1 opacity-80">Contenu le plus populaire sur ciprel.ci</div>
                </div>
                <v-chip color="warning" variant="flat" class="font-weight-bold">
                  {{ (topPages || []).reduce((sum, page) => sum + (page.views || 0), 0).toLocaleString() }} vues totales
                </v-chip>
              </v-card-title>
              <v-card-text class="pa-0">
                <v-list v-if="topPages && topPages.length > 0">
                  <v-list-item
                    v-for="(page, index) in topPages.slice(0, 10)"
                    :key="index"
                    :href="`https://ciprel.ci${page.path}`"
                    target="_blank"
                    class="py-3"
                    :class="{ 'bg-grey-lighten-5': index % 2 === 0 }"
                  >
                    <template v-slot:prepend>
                      <v-avatar 
                        :color="index < 3 ? 'warning' : 'primary'" 
                        size="40"
                        class="font-weight-bold"
                      >
                        <span class="text-white">{{ index + 1 }}</span>
                      </v-avatar>
                    </template>
                    
                    <v-list-item-title class="font-weight-medium text-h6">
                      {{ cleanPageTitle(page.title) }}
                    </v-list-item-title>
                    <v-list-item-subtitle class="text-body-2">
                      <v-row no-gutters>
                        <v-col cols="6">
                          <v-icon icon="mdi-eye" size="small" class="me-1"></v-icon>
                          {{ page.views.toLocaleString() }} vues
                        </v-col>
                        <v-col cols="6">
                          <v-icon icon="mdi-account" size="small" class="me-1"></v-icon>
                          {{ page.users }} visiteurs
                        </v-col>
                      </v-row>
                      <div class="text-caption text-medium-emphasis mt-1">
                        Durée moyenne: {{ formatDuration(page.avgDuration) }}
                      </div>
                    </v-list-item-subtitle>
                    
                    <template v-slot:append>
                      <v-btn
                        icon="mdi-open-in-new"
                        variant="text"
                        color="primary"
                        size="small"
                      ></v-btn>
                    </template>
                  </v-list-item>
                </v-list>
                <div v-else-if="loadingPages" class="pa-8 text-center">
                  <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
                  <div class="text-body-1 mt-4">Chargement des pages populaires...</div>
                </div>
                <div v-else class="pa-8 text-center text-grey">
                  <v-icon icon="mdi-file-document-outline" size="64" class="mb-4"></v-icon>
                  <div class="text-h6">Aucune page consultée</div>
                  <div class="text-body-2">Les données apparaîtront dès que du trafic sera détecté</div>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Sites Référents -->
        <v-row class="mb-6">
          <v-col cols="12">
            <v-card elevation="4">
              <v-card-title class="bg-info text-white d-flex align-center">
                <v-icon icon="mdi-link-variant" class="me-2"></v-icon>
                Sites Référents et Réseaux Sociaux
              </v-card-title>
              <v-card-text class="pa-0">
                <v-list v-if="referrals && referrals.length > 0">
                  <v-list-item
                    v-for="(referral, index) in referrals.slice(0, 10)"
                    :key="index"
                    class="py-2"
                  >
                    <template v-slot:prepend>
                      <v-avatar :color="getReferralColor(referral.source)" size="32">
                        <v-icon :icon="getReferralIcon(referral.source)" color="white" size="small"></v-icon>
                      </v-avatar>
                    </template>
                    
                    <v-list-item-title class="font-weight-medium">
                      {{ formatReferralSource(referral.source) }}
                    </v-list-item-title>
                    <v-list-item-subtitle>
                      {{ referral.sessions }} sessions • {{ referral.users }} utilisateurs
                    </v-list-item-subtitle>
                    
                    <template v-slot:append>
                      <v-chip :color="getReferralTypeColor(referral.medium)" size="x-small">
                        {{ formatMedium(referral.medium) }}
                      </v-chip>
                    </template>
                  </v-list-item>
                </v-list>
                <div v-else-if="loadingReferrals" class="pa-4 text-center">
                  <v-progress-circular indeterminate color="info"></v-progress-circular>
                </div>
                <div v-else class="pa-4 text-center text-medium-emphasis">
                  Aucun site référent pour cette période
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- KPI et Informations du Site -->
        <v-row>
          <v-col cols="12" md="6">
            <v-card elevation="4" class="bg-gradient-to-r from-primary to-secondary text-white">
              <v-card-title class="d-flex align-center">
                <v-icon icon="mdi-web" class="me-2"></v-icon>
                Informations du Site Web
              </v-card-title>
              <v-card-text>
                <v-row>
                  <v-col cols="6">
                    <div class="text-caption opacity-75">Domaine</div>
                    <div class="text-h6 font-weight-bold">ciprel.ci</div>
                  </v-col>
                  <v-col cols="6">
                    <div class="text-caption opacity-75">Durée moyenne de session</div>
                    <div class="text-h6 font-weight-bold">
                      {{ formatDuration(summary?.avgSessionDuration || 0) }}
                    </div>
                  </v-col>
                  <v-col cols="6">
                    <div class="text-caption opacity-75">Période d'analyse</div>
                    <div class="text-body-1">{{ getPeriodLabel() }}</div>
                  </v-col>
                  <v-col cols="6">
                    <div class="text-caption opacity-75">Dernière mise à jour</div>
                    <div class="text-body-1">{{ lastUpdate }}</div>
                  </v-col>
                </v-row>
              </v-card-text>
              <v-card-actions>
                <v-btn 
                  color="warning" 
                  variant="flat" 
                  @click="refreshData" 
                  :loading="loading"
                  prepend-icon="mdi-refresh"
                >
                  Actualiser les Données
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
          <v-col cols="12" md="6">
            <v-card elevation="4" class="bg-gradient-to-r from-success to-warning text-white">
              <v-card-title class="d-flex align-center">
                <v-icon icon="mdi-chart-box" class="me-2"></v-icon>
                Indicateurs de Performance
              </v-card-title>
              <v-card-text>
                <v-list class="bg-transparent text-white">
                  <v-list-item class="px-0">
                    <v-list-item-title>Audience Totale</v-list-item-title>
                    <v-list-item-subtitle class="text-grey-lighten-2">
                      {{ (summary?.users || 0).toLocaleString() }} utilisateurs uniques
                    </v-list-item-subtitle>
                  </v-list-item>
                  <v-list-item class="px-0">
                    <v-list-item-title>Engagement Moyen</v-list-item-title>
                    <v-list-item-subtitle class="text-grey-lighten-2">
                      {{ ((summary?.pageviews || 0) / (summary?.sessions || 1)).toFixed(1) }} pages par session
                    </v-list-item-subtitle>
                  </v-list-item>
                  <v-list-item class="px-0">
                    <v-list-item-title>Qualité du Trafic</v-list-item-title>
                    <v-list-item-subtitle class="text-grey-lighten-2">
                      {{ (100 - (summary?.bounceRate || 0)).toFixed(0) }}% de sessions engagées
                    </v-list-item-subtitle>
                  </v-list-item>
                </v-list>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12">
            <v-card elevation="2">
              <v-card-title>À propos de CIPREL</v-card-title>
              <v-card-text>
                <p>
                  La Compagnie Ivoirienne de Production d'Electricité (CIPREL) est le premier 
                  producteur indépendant d'électricité en Côte d'Ivoire. Ce dashboard présente 
                  les statistiques de fréquentation du site web officiel ciprel.ci.
                </p>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  
  <!-- Footer -->
  <v-footer app color="white" elevation="1" class="py-3">
    <v-container class="d-flex align-center justify-space-between">
      <span class="text-caption text-grey">© {{ new Date().getFullYear() }} CIPREL</span>
      <span class="text-caption">
        Dashboard développé par 
        <a href="https://bigfive.solutions" target="_blank" rel="noopener" class="text-primary text-decoration-none">BigFive Solutions</a>
      </span>
    </v-container>
  </v-footer>
  </v-app>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useAnalytics } from '~/composables/useAnalytics'
const { fetchAnalyticsData, getMetricsSummary, fetchTrafficSources, fetchTopPages, fetchTrafficGroups } = useAnalytics()

const selectedPeriod = ref('30daysAgo')
const logoUrl = 'https://ciprel.ci/wp-content/smush-webp/2024/04/images.png.webp'
const analyticsData = ref<any[]>([])
const summary = ref<any>(null)
const trafficSources = ref<any[]>([])
const topArticles = ref<any[]>([])
const topNews = ref<any[]>([])
const topPages = ref<any[]>([])
const trafficGroups = ref<any>(null)
const keywords = ref<any[]>([])
const referrals = ref<any[]>([])
const loading = ref(false)
const loadingTraffic = ref(false)
const loadingPages = ref(false)
const loadingKeywords = ref(false)
const loadingReferrals = ref(false)
const error = ref<string | null>(null)
const lastUpdate = ref('')
const previousSummary = ref<any>(null)

// Variables pour le filtre de plage de dates personnalisée
const dateRangeMenu = ref(false)
const customDateRange = ref({
  start: '',
  end: ''
})

// Périodes de filtrages étendues depuis janvier 2023
const quickPeriods = ref([
  { value: '7daysAgo', label: '7 jours', description: 'Semaine dernière' },
  { value: '30daysAgo', label: '30 jours', description: 'Mois dernier' },
  { value: '90daysAgo', label: '90 jours', description: 'Trimestre dernier' }
])

const extendedPeriods = ref([
  { value: '2024-01-01', label: '2024 Complet', description: 'Année en cours' },
  { value: '2023-01-01', label: 'Depuis Création', description: 'Depuis janvier 2023' },
  { value: '2023-01-01|2023-12-31', label: '2023 Complet', description: 'Année de lancement' },
  { value: '365daysAgo', label: 'Dernière Année', description: '12 mois glissants' },
  { value: '180daysAgo', label: '6 Mois', description: 'Semestre dernier' }
])

const loadAnalyticsData = async () => {
  loading.value = true
  loadingTraffic.value = true
  loadingPages.value = true
  loadingKeywords.value = true
  loadingReferrals.value = true
  error.value = null
  
  try {
    // Gérer les périodes personnalisées avec dates spécifiques
    let startDate = selectedPeriod.value
    let endDate = 'today'
    
    // Si période avec plage de dates spécifique (ex: 2023-01-01|2023-12-31)
    if (selectedPeriod.value.includes('|')) {
      const [start, end] = selectedPeriod.value.split('|')
      startDate = start
      endDate = end
    }
    
    const [data, summaryData, sources, articles, news, allPages, trafficGroupsData, keywordsData, referralsData] = await Promise.all([
      fetchAnalyticsData({
        startDate,
        endDate
      }),
      getMetricsSummary(startDate, endDate),
      fetchTrafficSources(startDate, endDate),
      fetchTopPages('articles', startDate, endDate),
      fetchTopPages('news', startDate, endDate),
      fetchTopPages('all', startDate, endDate),
      fetchTrafficGroups(startDate, endDate),
      fetchKeywords(startDate, endDate),
      fetchReferrals(startDate, endDate)
    ])

    analyticsData.value = data
    summary.value = summaryData
    trafficSources.value = sources
    topArticles.value = articles
    topNews.value = news
    topPages.value = allPages
    trafficGroups.value = trafficGroupsData
    keywords.value = keywordsData
    referrals.value = referralsData
    lastUpdate.value = new Date().toLocaleString('fr-FR')
  } catch (err) {
    error.value = 'Impossible de charger les données Analytics'
    console.error(err)
  } finally {
    loading.value = false
    loadingTraffic.value = false
    loadingPages.value = false
    loadingKeywords.value = false
    loadingReferrals.value = false
  }
}

const refreshData = () => {
  loadAnalyticsData()
}

const calculateChange = (metric: string): number | null => {
  if (!summary.value || !previousSummary.value) return null
  
  const current = summary.value[metric] || 0
  const previous = previousSummary.value[metric] || 0
  
  if (previous === 0) return null
  
  return ((current - previous) / previous) * 100
}

const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes}m ${remainingSeconds}s`
}

const getPeriodLabel = (): string => {
  // Vérifier si c'est une plage de dates personnalisée
  if (customDateRange.value.start && customDateRange.value.end) {
    return `${formatDate(customDateRange.value.start)} - ${formatDate(customDateRange.value.end)}`
  }
  
  // Chercher dans les périodes rapides
  const quickPeriod = quickPeriods.value.find(p => p.value === selectedPeriod.value)
  if (quickPeriod) return quickPeriod.label
  
  // Chercher dans les périodes étendues
  const extendedPeriod = extendedPeriods.value.find(p => p.value === selectedPeriod.value)
  if (extendedPeriod) return extendedPeriod.label
  
  // Fallback pour les valeurs personnalisées
  return selectedPeriod.value
}

const formatDate = (dateString: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

const applyCustomDateRange = () => {
  if (customDateRange.value.start && customDateRange.value.end) {
    selectedPeriod.value = `${customDateRange.value.start}|${customDateRange.value.end}`
    dateRangeMenu.value = false
    loadAnalyticsData()
  }
}

const getTotalSessions = () => {
  if (!trafficGroups.value) return 0
  const googleSessions = (trafficGroups.value.googleSearch || []).reduce((sum, item) => sum + (item.sessions || 0), 0)
  const referralSessions = (trafficGroups.value.referrals || []).reduce((sum, item) => sum + (item.sessions || 0), 0)
  const directSessions = (trafficGroups.value.directAccess || []).reduce((sum, item) => sum + (item.sessions || 0), 0)
  return googleSessions + referralSessions + directSessions
}

const printToPDF = () => {
  // Masquer les éléments non nécessaires pour l'impression
  const elementsToHide = document.querySelectorAll('.v-app-bar, .v-btn, .v-menu')
  elementsToHide.forEach(el => {
    if (el instanceof HTMLElement) {
      el.style.display = 'none'
    }
  })
  
  // Ajouter des styles d'impression
  const printStyles = document.createElement('style')
  printStyles.textContent = `
    @media print {
      body { margin: 0; }
      .v-container { padding: 20px !important; }
      .v-card { box-shadow: none !important; border: 1px solid #ddd !important; }
      .v-btn, .v-menu, .v-app-bar { display: none !important; }
      .print-header {
        text-align: center;
        margin-bottom: 30px;
        padding-bottom: 20px;
        border-bottom: 2px solid #244370;
      }
      .print-title {
        font-size: 24px;
        font-weight: bold;
        color: #244370;
        margin-bottom: 10px;
      }
      .print-subtitle {
        font-size: 14px;
        color: #666;
      }
      .print-date {
        font-size: 12px;
        color: #888;
        margin-top: 10px;
      }
    }
  `
  document.head.appendChild(printStyles)
  
  // Ajouter un en-tête d'impression
  const printHeader = document.createElement('div')
  printHeader.className = 'print-header'
  printHeader.innerHTML = `
    <div class="print-title">Tableau de Bord Analytics - ciprel.ci</div>
    <div class="print-subtitle">Rapport de performance digital</div>
    <div class="print-date">Période: ${getPeriodLabel()} | Généré le: ${new Date().toLocaleString('fr-FR')}</div>
  `
  document.body.insertBefore(printHeader, document.body.firstChild)
  
  // Lancer l'impression
  window.print()
  
  // Nettoyer après impression
  setTimeout(() => {
    elementsToHide.forEach(el => {
      if (el instanceof HTMLElement) {
        el.style.display = ''
      }
    })
    document.head.removeChild(printStyles)
    document.body.removeChild(printHeader)
  }, 1000)
}

// Insights business orientés KPI
const getSessionsInsight = (sessions: number): string => {
  if (sessions > 1000) return 'Performance élevée'
  if (sessions > 500) return 'Trafic satisfaisant'
  if (sessions > 100) return 'Croissance modérée'
  return 'Optimisation requise'
}

const getUsersInsight = (users: number): string => {
  if (users > 800) return 'Audience large'
  if (users > 400) return 'Reach correct'
  if (users > 100) return 'Base à développer'
  return 'Action marketing nécessaire'
}

const getPageviewsInsight = (pageviews: number): string => {
  if (pageviews > 2000) return 'Engagement fort'
  if (pageviews > 1000) return 'Intérêt confirmé'
  if (pageviews > 500) return 'Consultation modérée'
  return 'Contenu à optimiser'
}

const getBounceInsight = (bounceRate: number): string => {
  if (bounceRate < 30) return 'Excellent engagement'
  if (bounceRate < 50) return 'Rétention correcte'
  if (bounceRate < 70) return 'Amélioration possible'
  return 'Action immédiate requise'
}

// Fonctions pour les sources de trafic
const getChannelIcon = (channel: string): string => {
  const icons: Record<string, string> = {
    'Organic Search': 'mdi-google',
    'Direct': 'mdi-account-arrow-right',
    'Social': 'mdi-facebook',
    'Referral': 'mdi-link-variant',
    'Email': 'mdi-email',
    'Paid Search': 'mdi-google-ads',
    'Display': 'mdi-monitor-screenshot',
    'Affiliate': 'mdi-handshake',
    'Video': 'mdi-youtube'
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
    'Affiliate': '#34A853',        // Google Green
    'Video': '#FF0000'             // YouTube Red
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
    'Affiliate': 'Partenaires',
    'Video': 'Vidéos'
  }
  return labels[channel] || channel
}

// Fonctions pour récupérer les mots-clés et référents
const fetchKeywords = async (startDate: string, endDate: string) => {
  try {
    const response = await $fetch<any>('/api/analytics/keywords', {
      query: { startDate, endDate }
    })

    if (!response?.success || !response.data?.rows) {
      return []
    }

    return response.data.rows.map((row: any) => ({
      term: row.dimensionValues[0].value || row.dimensionValues[1].value,
      sessions: parseInt(row.metricValues[0].value) || 0,
      users: parseInt(row.metricValues[1].value) || 0,
      pageviews: parseInt(row.metricValues[2].value) || 0
    })).filter((keyword: any) => keyword.term && keyword.term !== '(not set)')
  } catch (error) {
    console.error('Failed to fetch keywords:', error)
    return []
  }
}

const fetchReferrals = async (startDate: string, endDate: string) => {
  try {
    const response = await $fetch<any>('/api/analytics/referrals', {
      query: { startDate, endDate }
    })

    if (!response?.success || !response.data?.rows) {
      return []
    }

    return response.data.rows.map((row: any) => ({
      source: row.dimensionValues[0].value,
      medium: row.dimensionValues[1].value,
      sessions: parseInt(row.metricValues[0].value) || 0,
      users: parseInt(row.metricValues[1].value) || 0,
      pageviews: parseInt(row.metricValues[2].value) || 0
    }))
  } catch (error) {
    console.error('Failed to fetch referrals:', error)
    return []
  }
}

// Fonctions de formatage pour les référents
const getReferralIcon = (source: string): string => {
  const icons: Record<string, string> = {
    'facebook.com': 'mdi-facebook',
    'instagram.com': 'mdi-instagram', 
    'twitter.com': 'mdi-twitter',
    'linkedin.com': 'mdi-linkedin',
    'youtube.com': 'mdi-youtube',
    'google.com': 'mdi-google',
    'bing.com': 'mdi-microsoft',
    'yahoo.com': 'mdi-yahoo'
  }
  
  for (const [domain, icon] of Object.entries(icons)) {
    if (source.includes(domain)) return icon
  }
  
  return 'mdi-web'
}

const getReferralColor = (source: string): string => {
  const colors: Record<string, string> = {
    'facebook.com': '#1877F2',
    'instagram.com': '#E4405F',
    'twitter.com': '#1DA1F2',
    'linkedin.com': '#0A66C2',
    'youtube.com': '#FF0000',
    'google.com': '#4285F4',
    'bing.com': '#00809D',
    'yahoo.com': '#720E9E'
  }
  
  for (const [domain, color] of Object.entries(colors)) {
    if (source.includes(domain)) return color
  }
  
  return '#757575'
}

const formatReferralSource = (source: string): string => {
  return source.replace('www.', '').replace('.com', '').replace('.fr', '')
}

const getReferralTypeColor = (medium: string): string => {
  const colors: Record<string, string> = {
    'social': 'blue',
    'referral': 'orange',
    'organic': 'green',
    'cpc': 'purple'
  }
  return colors[medium] || 'grey'
}

const formatMedium = (medium: string): string => {
  const labels: Record<string, string> = {
    'social': 'Social',
    'referral': 'Référent',
    'organic': 'Organique',
    'cpc': 'Payant'
  }
  return labels[medium] || medium
}

const cleanPageTitle = (title: string): string => {
  if (!title || title === '(not set)') return 'Page sans titre'
  
  return title
    .replace(/^CIPREL\s*[-|]\s*/, '')
    .replace(/\s*[-|]\s*CIPREL.*$/, '')
    .replace(/elementor-\d+/, '')
    .trim() || 'Page sans titre'
}

watch(selectedPeriod, () => {
  loadAnalyticsData()
})

onMounted(() => {
  loadAnalyticsData()
})
</script>

<style scoped>
.v-container {
  max-width: 1400px;
}

/* App bar separation */
.v-app-bar {
  border-bottom: 1px solid rgba(0,0,0,0.06);
}

/* Full-page background with blur and overlay */
.app-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
}
.app-bg__image {
  position: absolute;
  inset: 0;
  background-image: url('https://ciprel.ci/wp-content/smush-webp/2023/05/Groupe-851.png.webp');
  background-size: cover;
  background-position: center;
  filter: blur(2.5px);
  transform: scale(1.02);
}
.app-bg__overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(255,255,255,0.72), rgba(255,255,255,0.82));
}

/* Ensure content sits above background */
.app-content {
  position: relative;
  z-index: 1;
}

/* Gradients personnalisés CIPREL */
.bg-gradient-to-r {
  background: linear-gradient(90deg, var(--v-theme-primary), var(--v-theme-secondary));
}

.from-primary.to-secondary {
  background: linear-gradient(135deg, #244370, #0C942E);
}

.from-success.to-warning {
  background: linear-gradient(135deg, #0C942E, #FF7D23);
}

/* Effets de survol pour les cartes */
.v-card {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.v-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 20px rgba(0, 0, 0, 0.15) !important;
}

/* Animation des métriques */
.metrics-card .text-h3 {
  transition: color 0.3s ease;
}

.metrics-card:hover .text-h3 {
  transform: scale(1.05);
  transition: transform 0.2s ease;
}

/* Styles pour les chips d'insight */
.v-chip.v-chip--size-small {
  font-weight: 600;
  font-size: 0.7rem;
}

/* Couleurs personnalisées CIPREL */
.text-ciprel-orange {
  color: #FF7D23 !important;
}

.text-ciprel-green {
  color: #0C942E !important;
}

.text-ciprel-blue {
  color: #244370 !important;
}

.bg-ciprel-orange {
  background-color: #FF7D23 !important;
}

.bg-ciprel-green {
  background-color: #0C942E !important;
}

.bg-ciprel-blue {
  background-color: #244370 !important;
}

/* Styles pour les cartes de sources de trafic */
.traffic-source-card {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  cursor: pointer;
}

.traffic-source-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.2) !important;
}

.border-warning {
  border-top: 3px solid #FF7D23;
}

/* Animation pour les avatars des sources */
.traffic-source-card .v-avatar {
  transition: transform 0.3s ease;
}

.traffic-source-card:hover .v-avatar {
  transform: rotate(360deg) scale(1.1);
}

/* Menu déroulant des périodes */
.v-list-item:hover {
  background-color: rgba(255, 125, 35, 0.1) !important;
}

/* Gradient animé pour le header */
@keyframes gradient-shift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.bg-gradient-to-r.from-primary.to-secondary {
  background: linear-gradient(45deg, #244370, #0C942E, #FF7D23);
  background-size: 300% 300%;
  animation: gradient-shift 6s ease infinite;
}
</style>