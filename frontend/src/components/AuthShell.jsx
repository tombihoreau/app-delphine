import logoDc from '../assets/brand/logo-dc.svg'
import authWaveBottom from '../assets/brand/auth-wave-bottom.svg'
import authWaveTop from '../assets/brand/auth-wave-top.svg'

const AuthShell = ({ title, subtitle, children, compact = false }) => (
  <div className="min-h-screen bg-[#dedede] px-0 sm:px-4 sm:py-6">
    <main className="relative mx-auto flex min-h-screen w-full max-w-md overflow-hidden bg-brand-beige px-5 text-brand-brown sm:min-h-[calc(100vh-3rem)] sm:rounded-[18px]">
      <img
        src={authWaveTop}
        alt=""
        className="pointer-events-none absolute left-0 top-0 w-full select-none"
        aria-hidden="true"
      />
      <img
        src={authWaveBottom}
        alt=""
        className="pointer-events-none absolute bottom-0 left-0 w-full select-none"
        aria-hidden="true"
      />

      <section
        className={`relative z-10 mx-auto flex w-full max-w-[345px] flex-col items-center text-center ${
          compact ? 'justify-center py-20' : 'justify-center py-24'
        }`}
      >
        <img src={logoDc} alt="DC" className="mb-9 w-[118px]" />

        <h1 className="font-display text-[1.75rem] font-normal leading-none text-brand-tamarillo">
          {title}
        </h1>
        <p className="mt-2 max-w-[275px] text-xs italic leading-4 text-brand-brown">
          {subtitle}
        </p>

        <div className="mt-7 w-full">{children}</div>
      </section>
    </main>
  </div>
)

export default AuthShell
