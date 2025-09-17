<template>
  <NuxtPage />
</template>

<script setup>
useHead({
  title: 'Dashboard Analytics CIPREL',
  meta: [
    { name: 'description', content: 'Dashboard des métriques Google Analytics pour le site ciprel.ci' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  link: [
    { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
  ]
})
</script>

<style>
html {
  overflow-y: auto;
}

body {
  font-family: 'Roboto', sans-serif;
}
</style>