<script setup>
const router = useRouter()
const {getToken} = useAxios()
onMounted(() => {
  const strHashCode = getToken()
  if (strHashCode !== '') {
    router.push({path: '/home'})
  }else {
    router.push({path: '/auth'})
  }
})

definePageMeta({
  layout: false
})

</script>


