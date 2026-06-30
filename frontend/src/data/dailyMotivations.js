export const dailyMotivations = [
  'Chaque pas compte.',
  "Aujourd'hui est une bonne journée pour prendre soin de toi.",
  'Les petits pas construisent les grands chemins.',
  "Tu n'as pas besoin d'être parfaite pour avancer.",
  'Bouger un peu est déjà une victoire.',
  "Fais de ton mieux aujourd'hui.",
  'La régularité vaut mieux que la perfection.',
  'Ton rythme est le bon.',
  'Tu es déjà en mouvement.',
  'Prends le temps dont tu as besoin.',
  'Le plus difficile est souvent de commencer.',
  'Tu peux être fière de toi.',
  'Continue, même doucement.',
  'Le repos fait aussi partie du chemin.',
  "Ce que tu fais aujourd'hui compte.",
  'Respire profondément.',
  'Tu progresses peut-être plus que tu ne le crois.',
  'Une séance courte reste une séance.',
  'Sois indulgente avec toi-même.',
  'Avancer lentement reste avancer.',
  'Merci à ton corps de te porter chaque jour.',
  "Tu n'as rien à prouver à personne.",
  "Aujourd'hui, choisis ce qui te fait du bien.",
  'Les habitudes construisent les résultats.',
  'Fais confiance au chemin parcouru.',
  'Chaque effort est un cadeau que tu te fais.',
  'Tu es plus forte que tes doutes.',
  "L'important est de continuer à revenir.",
  'Les progrès silencieux sont souvent les plus solides.',
  'Tu mérites ce temps pour toi.',
  'Un jour à la fois.',
  'La constance est une victoire discrète.',
  'Prends quelques secondes pour souffler.',
  'Chaque mouvement a de la valeur.',
  'Tu avances à ton propre rythme.',
  'Écouter son corps est une force.',
  'Tu peux ralentir sans abandonner.',
  "Aujourd'hui est une nouvelle occasion.",
  "Les petites victoires méritent d'être célébrées.",
  'Tu fais déjà beaucoup.',
  "Le mouvement s'adapte à la vie, pas l'inverse.",
  'Tu peux te faire confiance.',
  'Une semaine imparfaite reste une semaine vécue.',
  'Prends soin de ton énergie.',
  'Ton parcours est unique.',
  'Chaque séance construit la suivante.',
  'Fais de la place pour le calme.',
  'Tu es capable de grandes choses.',
  'Le meilleur rythme est celui que tu peux tenir.',
  "Prends le temps d'apprécier le chemin.",
  "Aujourd'hui encore, tu avances.",
  'La récupération prépare les prochaines réussites.',
  'Tu peux être fière du chemin déjà parcouru.',
  'Les grands changements commencent souvent par de petits gestes.',
  'Prends un instant pour reconnaître tes efforts.',
  "Tu n'es pas en retard.",
  "Respire. Tu n'as pas besoin de tout faire aujourd'hui.",
  "Chaque jour est différent, et c'est normal.",
  'Continue à prendre soin de toi.',
  'Respire. Avance.'
]

const hashString = (value) => {
  let hash = 0

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0
  }

  return hash
}

const addDays = (dateKey, days) => {
  const date = new Date(`${dateKey}T12:00:00`)
  date.setDate(date.getDate() + days)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const getMotivationIndex = (dateKey, seed = '') => (
  hashString(`${dateKey}:${seed}`) % dailyMotivations.length
)

export const getDailyMotivation = (dateKey, seed = '') => {
  if (dailyMotivations.length === 0) return ''
  if (dailyMotivations.length === 1) return dailyMotivations[0]

  const todayIndex = getMotivationIndex(dateKey, seed)
  const yesterdayIndex = getMotivationIndex(addDays(dateKey, -1), seed)

  if (todayIndex !== yesterdayIndex) {
    return dailyMotivations[todayIndex]
  }

  return dailyMotivations[(todayIndex + 1) % dailyMotivations.length]
}
