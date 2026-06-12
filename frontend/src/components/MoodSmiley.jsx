import veryGoodSmiley from '../assets/mood/mood-very-good.svg'
import goodSmiley from '../assets/mood/mood-good.svg'
import neutralSmiley from '../assets/mood/mood-neutral.svg'
import tiredSmiley from '../assets/mood/mood-tired.svg'
import angrySmiley from '../assets/mood/mood-angry.svg'
import chartVeryGoodSmiley from '../assets/mood/chart-mood-very-good.svg'
import chartGoodSmiley from '../assets/mood/chart-mood-good.svg'
import chartNeutralSmiley from '../assets/mood/chart-mood-neutral.svg'
import chartTiredSmiley from '../assets/mood/chart-mood-tired.svg'
import chartAngrySmiley from '../assets/mood/chart-mood-angry.svg'

export const moodSmileys = {
  5: veryGoodSmiley,
  4: goodSmiley,
  3: neutralSmiley,
  2: tiredSmiley,
  1: angrySmiley
}

export const chartMoodSmileys = {
  5: chartVeryGoodSmiley,
  4: chartGoodSmiley,
  3: chartNeutralSmiley,
  2: chartTiredSmiley,
  1: chartAngrySmiley
}

export const getMoodSmiley = (value = 5, variant = 'default') => {
  const score = Math.max(1, Math.min(5, Number(value) || 5))
  return variant === 'chart' ? chartMoodSmileys[score] : moodSmileys[score]
}

const MoodSmiley = ({ value = 5, alt = '', className = '', variant = 'default', ...props }) => (
  <img src={getMoodSmiley(value, variant)} alt={alt} className={className} {...props} />
)

export default MoodSmiley
