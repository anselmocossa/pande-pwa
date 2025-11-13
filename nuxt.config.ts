// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({

    devServer: {
        //host: '10.0.122.30',
        // host: '192.168.1681.244',
        port: 3000
    },
    devtools: {
      enabled: false,

      timeline: {
        enabled: false,
      },
    },
    modules: ["@pinia/nuxt", "vuetify-nuxt-module"],


    app: {
        head: {
            title:
                "Pande - ENH",
        },
    },

    runtimeConfig: {
        public: {
            base_url: 'http://10.0.4.114:82/WebApi/api/v1/',
            base_uri: 'http://10.0.4.114:82/WebApi/api/v1/'
        }
    },
})
