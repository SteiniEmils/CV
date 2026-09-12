import { useEffect, useMemo, useState, type FormEvent } from 'react'

type Lang = 'is' | 'en'

const EMAIL = 'kveikjumeld.is@gmail.com'
const INSTAGRAM = 'https://www.instagram.com/kveikjumeld.is'
const FACEBOOK = 'https://www.facebook.com/p/Kveikjumeldis-61581093242977/'

const stones = [
  {
    id: 'travertine',
    image: '/kveikjumeld/travertine-silver.jpg',
    name: { is: 'Travertine Silver', en: 'Travertine Silver' },
    kind: { is: 'Náttúrusteinn', en: 'Natural stone' },
    note: {
      is: 'Mjúkar silfurlínur og hlýtt yfirborð. Klassískt val á pallinn.',
      en: 'Soft silver veining and a warm surface. A classic choice for the deck.',
    },
  },
  {
    id: 'via-latte',
    image: '/kveikjumeld/via-latte.jpg',
    name: { is: 'Via Latte', en: 'Via Latte' },
    kind: { is: 'Granít', en: 'Granite' },
    note: {
      is: 'Dökk granít með fínum æðum. Rólegt og glæsilegt kvöldljós.',
      en: 'Dark granite with fine veining. Quiet, elegant evening light.',
    },
  },
  {
    id: 'cosmic',
    image: '/kveikjumeld/cosmic-black.jpg',
    name: { is: 'Cosmic Black', en: 'Cosmic Black' },
    kind: { is: 'Granít', en: 'Granite' },
    note: {
      is: 'Dramatískar línur og dýpt. Borðplata sem dregur augað.',
      en: 'Dramatic movement and depth. A tabletop that holds the eye.',
    },
  },
  {
    id: 'brown',
    image: '/kveikjumeld/brown-antique.jpg',
    name: { is: 'Brown Antique', en: 'Brown Antique' },
    kind: { is: 'Granít', en: 'Granite' },
    note: {
      is: 'Dökkbrúnt granít sem fellur vel að ebonylituðu timbri.',
      en: 'Deep brown granite that sits well with ebony-stained timber.',
    },
  },
] as const

const copy = {
  is: {
    brand: 'Kveikjumeld',
    menu: 'Valmynd',
    close: 'Loka',
    nav: [
      { href: '#um-okkur', label: 'Um okkur' },
      { href: '#steinar', label: 'Steinar' },
      { href: '#samband', label: 'Samband' },
    ],
    langLabel: 'English',
    eyebrow: 'Sérsmíðuð gaseldstæði',
    heroTitle: 'Kveikjum eld',
    heroLead: 'Fullkomin á pallinn eða svalirnar.',
    ctaPrimary: 'Hafðu samband',
    ctaStones: 'Veldu stein',
    proof: ['Handsmíðað', 'Gaslogi', 'Steinn frá Granítsmiðjunni', 'Á hjólum'],
    aboutEyebrow: 'Handverk',
    aboutTitle: 'Unnið af ástríðu',
    aboutBody:
      'Kveikjumeld.is býður upp á vönduð handsmíðuð eldstæði sem eru tilvalin viðbót á pallinn eða svalirnar. Eldstæðin gefa frá sér góða hlýju og fallegan loga sem framlengir gæða kvöldstundum í útiverunni.',
    craftTitle: 'Timbur, steinn og logi',
    craftBody:
      'Hvert eldstæði er smíðað eftir máli. Borðplöturnar eru unnar í samstarfi við Granítsmiðjuna — þú velur steininn, við smíðum restina.',
    craftPoints: [
      { title: 'Að þínu máli', body: 'Stærðir eins og 90×120 eða 120×60, og aðrar eftir samtali.' },
      { title: 'Hreyfanlegt', body: 'Á hjólum, með hurð og plássi fyrir gas. Hlíf fylgir oft með.' },
      { title: 'Úti allt árið', body: 'Hugsað fyrir íslenskan pall og svalir — hlýja þegar kvöldin lengjast.' },
    ],
    stonesEyebrow: 'Borðplötur',
    stonesTitle: 'Veldu þinn stein',
    stonesLead: 'Eldstæðin skarta glæsilegum borðplötum, unnum með Granítsmiðjunni.',
    selected: 'Valinn steinn',
    contactTitle: 'Byrjum samtalið',
    contactLead: 'Segðu okkur frá pallinum, stærð og hvaða steinn heillar. Við svörum í tölvupósti.',
    name: 'Nafn',
    email: 'Netfang',
    message: 'Skilaboð',
    messagePlaceholder: 'Pallur eða svalir, áætluð stærð, og steinn ef þú hefur valið.',
    send: 'Senda fyrirspurn',
    orMail: 'Eða skrifaðu beint',
    follow: 'Fylgdu okkur',
    instagram: 'Instagram',
    facebook: 'Facebook',
    demo: 'Tillaga að nýrri síðu — aðeins sýnishorn, ekki opinber útgáfa.',
    rights: 'Kveikjumeld.is',
  },
  en: {
    brand: 'Kveikjumeld',
    menu: 'Menu',
    close: 'Close',
    nav: [
      { href: '#um-okkur', label: 'About' },
      { href: '#steinar', label: 'Stone' },
      { href: '#samband', label: 'Contact' },
    ],
    langLabel: 'Íslenska',
    eyebrow: 'Custom gas fire tables',
    heroTitle: 'Light the fire',
    heroLead: 'Made for the deck or the balcony.',
    ctaPrimary: 'Get in touch',
    ctaStones: 'Choose a stone',
    proof: ['Handmade', 'Gas flame', 'Stone with Granítsmiðjan', 'On wheels'],
    aboutEyebrow: 'Craft',
    aboutTitle: 'Made with care',
    aboutBody:
      'Kveikjumeld.is makes carefully built, handmade fire tables — a natural addition to a deck or balcony. They give real warmth and a beautiful flame, stretching good evenings outdoors a little longer.',
    craftTitle: 'Timber, stone and flame',
    craftBody:
      'Each piece is built to measure. Tabletops are made with Granítsmiðjan — you choose the stone, we build the rest.',
    craftPoints: [
      { title: 'To your measure', body: 'Sizes such as 90×120 or 120×60, and others by conversation.' },
      { title: 'Easy to move', body: 'On wheels, with a door and space for gas. A cover is often included.' },
      { title: 'Outdoor evenings', body: 'Designed for Icelandic decks and balconies — warmth when nights draw in.' },
    ],
    stonesEyebrow: 'Tabletops',
    stonesTitle: 'Choose your stone',
    stonesLead: 'Each fire table is finished with a striking top, made with Granítsmiðjan.',
    selected: 'Selected stone',
    contactTitle: 'Start the conversation',
    contactLead: 'Tell us about the deck, the size, and which stone you like. We reply by email.',
    name: 'Name',
    email: 'Email',
    message: 'Message',
    messagePlaceholder: 'Deck or balcony, intended size, and a stone if you have one in mind.',
    send: 'Send enquiry',
    orMail: 'Or write directly',
    follow: 'Follow along',
    instagram: 'Instagram',
    facebook: 'Facebook',
    demo: 'A proposed redesign — local preview only, not the live site.',
    rights: 'Kveikjumeld.is',
  },
} as const

function FlameMark() {
  return (
    <svg className="km-mark" viewBox="0 0 32 32" aria-hidden="true">
      <path d="M16.2 6.2c.4 2.6-1.1 4.2-2.6 5.8-1.7 1.8-3.3 3.5-2.6 6.1 1.4-1 2.4-1.2 2.4-1.2-.8 2.4.2 4.1 2.6 5.6-4.8.4-8.2-2.6-8.2-7.1 0-4.2 3.2-6.6 8.4-9.2Z" />
      <path d="M19.4 11.4c.2 1.7-.8 2.8-1.8 3.9-1.1 1.2-2.1 2.3-1.6 4.1.9-.7 1.6-.8 1.6-.8-.5 1.6.2 2.8 1.8 3.8-3.2.3-5.4-1.7-5.4-4.8 0-2.8 2.1-4.4 5.4-6.2Z" />
    </svg>
  )
}

function App() {
  const [lang, setLang] = useState<Lang>('is')
  const [menuOpen, setMenuOpen] = useState(false)
  const [stoneIndex, setStoneIndex] = useState(0)
  const [scrolled, setScrolled] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')

  const t = copy[lang]
  const stone = stones[stoneIndex]

  const defaultMessage = useMemo(() => {
    if (lang === 'is') {
      return `Hæ, ég hef áhuga á eldstæði með ${stone.name.is} borðplötu.`
    }
    return `Hi, I’m interested in a fire table with a ${stone.name.en} top.`
  }, [lang, stone])

  useEffect(() => {
    document.documentElement.lang = lang === 'is' ? 'is' : 'en'
  }, [lang])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [menuOpen])

  const sendEnquiry = (event: FormEvent) => {
    event.preventDefault()
    const body = [
      message.trim() || defaultMessage,
      '',
      `${t.selected}: ${stone.name[lang]} (${stone.kind[lang]})`,
      name.trim() ? `${t.name}: ${name.trim()}` : '',
      email.trim() ? `${t.email}: ${email.trim()}` : '',
    ]
      .filter(Boolean)
      .join('\n')
    const url = `mailto:${EMAIL}?subject=${encodeURIComponent(
      `Kveikjumeld — ${stone.name[lang]}`,
    )}&body=${encodeURIComponent(body)}`
    window.location.href = url
  }

  return (
    <div className="km-shell">
      <div className="km-ambient" aria-hidden="true" />
      <div className="km-phone">
        <header className={`km-header${scrolled ? ' is-scrolled' : ''}`}>
          <a className="km-logo" href="#top">
            <FlameMark />
            <span>{t.brand}</span>
          </a>
          <div className="km-header-actions">
            <button
              type="button"
              className="km-lang"
              onClick={() => setLang(lang === 'is' ? 'en' : 'is')}
            >
              {t.langLabel}
            </button>
            <button
              type="button"
              className={`km-menu-btn${menuOpen ? ' is-open' : ''}`}
              aria-expanded={menuOpen}
              aria-controls="km-menu"
              aria-label={menuOpen ? t.close : t.menu}
              onClick={() => setMenuOpen((open) => !open)}
            >
              <span />
              <span />
            </button>
          </div>
        </header>

        <div id="km-menu" className={`km-menu${menuOpen ? ' is-open' : ''}`} hidden={!menuOpen}>
          <nav aria-label={t.menu}>
            {t.nav.map((link) => (
              <a key={link.href} href={link.href} onClick={() => setMenuOpen(false)}>
                {link.label}
              </a>
            ))}
          </nav>
          <p className="km-menu-note">{t.demo}</p>
        </div>

        <main id="top">
          <section className="km-hero">
            <img
              className="km-hero-image"
              src="/kveikjumeld/firepit-portrait.jpg"
              alt=""
              fetchPriority="high"
            />
            <div className="km-hero-shade" />
            <div className="km-hero-copy">
              <p className="km-eyebrow">{t.eyebrow}</p>
              <h1>{t.heroTitle}</h1>
              <p className="km-lead">{t.heroLead}</p>
              <div className="km-hero-actions">
                <a className="km-btn km-btn-primary" href="#samband">
                  {t.ctaPrimary}
                </a>
                <a className="km-btn km-btn-ghost" href="#steinar">
                  {t.ctaStones}
                </a>
              </div>
            </div>
          </section>

          <ul className="km-proof">
            {t.proof.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          <section className="km-section km-paper" id="um-okkur">
            <p className="km-eyebrow dark">{t.aboutEyebrow}</p>
            <h2>{t.aboutTitle}</h2>
            <p className="km-body">{t.aboutBody}</p>
          </section>

          <section className="km-craft">
            <img src="/kveikjumeld/firepit-landscape.jpg" alt="" />
            <div className="km-craft-copy">
              <h2>{t.craftTitle}</h2>
              <p>{t.craftBody}</p>
            </div>
          </section>

          <section className="km-section km-paper km-points">
            {t.craftPoints.map((point) => (
              <article key={point.title}>
                <h3>{point.title}</h3>
                <p>{point.body}</p>
              </article>
            ))}
          </section>

          <section className="km-section km-stones" id="steinar">
            <p className="km-eyebrow">{t.stonesEyebrow}</p>
            <h2>{t.stonesTitle}</h2>
            <p className="km-body light">{t.stonesLead}</p>

            <div className="km-stone-stage">
              <img src={stone.image} alt={stone.name[lang]} />
              <div className="km-stone-caption">
                <p className="km-stone-kind">{stone.kind[lang]}</p>
                <h3>{stone.name[lang]}</h3>
                <p>{stone.note[lang]}</p>
              </div>
            </div>

            <div className="km-stone-row" role="list">
              {stones.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  role="listitem"
                  className={index === stoneIndex ? 'is-active' : ''}
                  aria-pressed={index === stoneIndex}
                  aria-label={`${item.name[lang]}, ${item.kind[lang]}`}
                  onClick={() => setStoneIndex(index)}
                >
                  <img src={item.image} alt="" />
                  <span>{item.name[lang]}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="km-section km-contact" id="samband">
            <h2>{t.contactTitle}</h2>
            <p className="km-body">{t.contactLead}</p>
            <form className="km-form" onSubmit={sendEnquiry}>
              <label>
                {t.name}
                <input
                  name="name"
                  autoComplete="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              </label>
              <label>
                {t.email}
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  inputMode="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </label>
              <label>
                {t.message}
                <textarea
                  name="message"
                  rows={4}
                  placeholder={t.messagePlaceholder}
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                />
              </label>
              <button className="km-btn km-btn-primary km-btn-block" type="submit">
                {t.send}
              </button>
            </form>
            <p className="km-mail">
              {t.orMail}
              <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
            </p>
          </section>
        </main>

        <footer className="km-footer">
          <p className="km-follow-label">{t.follow}</p>
          <div className="km-social">
            <a href={INSTAGRAM} target="_blank" rel="noreferrer">
              {t.instagram} · @kveikjumeld.is
            </a>
            <a href={FACEBOOK} target="_blank" rel="noreferrer">
              {t.facebook}
            </a>
          </div>
          <p className="km-rights">{t.rights}</p>
          <p className="km-demo">{t.demo}</p>
        </footer>

        <div className="km-dock">
          <a className="km-btn km-btn-primary km-btn-block" href="#samband">
            {t.ctaPrimary}
          </a>
        </div>
      </div>
    </div>
  )
}

export default App
