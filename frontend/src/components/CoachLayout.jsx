const CoachLayout = ({ title, subtitle, action, compactBottom = false, children }) => {
  return (
    <div className={`client-screen ${compactBottom ? 'pb-6' : ''}`}>
      <div className={`client-frame relative ${compactBottom ? 'pb-6' : 'pb-28'}`}>
        {title || subtitle || action ? (
          <div className="mb-7 flex items-start justify-between gap-4">
            <div>
              {title ? (
                <h1 className="font-display text-3xl font-normal text-brand-tamarillo">
                  {title}
                </h1>
              ) : null}

              {subtitle ? (
                <p className="mt-2 text-sm leading-5 text-brand-brown">
                  {subtitle}
                </p>
              ) : null}
            </div>

            {action}
          </div>
        ) : null}

        {children}
      </div>
    </div>
  )
}

export default CoachLayout
