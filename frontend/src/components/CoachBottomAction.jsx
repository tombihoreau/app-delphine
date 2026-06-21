export const coachPrimaryActionClass = 'w-full rounded-full bg-brand-tamarillo px-5 py-4 text-lg font-bold text-brand-beige shadow-float disabled:opacity-60'

const CoachBottomAction = ({ children, sticky = false }) => (
  <div
    className={
      sticky
        ? 'sticky bottom-0 z-40 -mx-5 mt-12 bg-brand-beige px-5 pb-6 pt-3'
        : 'mt-auto pt-12'
    }
  >
    {children}
  </div>
)

export default CoachBottomAction
