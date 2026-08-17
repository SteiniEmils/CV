export type Lang = 'en' | 'is'

export type UIKey =
  | 'about'
  | 'experience'
  | 'skills'
  | 'projects'
  | 'contact'
  | 'download'
  | 'contactMe'
  | 'aboutMe'
  | 'technicalSkills'
  | 'featuredProject'
  | 'education'
  | 'languages'
  | 'references'
  | 'availableOnRequest'
  | 'getInTouch'
  | 'buildingSolutions'
  | 'present'

export const ui: Record<Lang, Record<UIKey, string>> = {
  en: {
    about: 'About',
    experience: 'Experience',
    skills: 'Skills',
    projects: 'Projects',
    contact: 'Contact',
    download: 'Download CV',
    contactMe: 'Contact me',
    aboutMe: 'About Me',
    technicalSkills: 'Technical Skills',
    featuredProject: 'Featured Project',
    education: 'Education',
    languages: 'Languages',
    references: 'References',
    availableOnRequest: 'Available on request',
    getInTouch: 'Get in touch',
    buildingSolutions: 'Building solutions, delivering results.',
    present: 'Present',
  },
  is: {
    about: 'Um mig',
    experience: 'Reynsla',
    skills: 'Hæfni',
    projects: 'Verkefni',
    contact: 'Hafa samband',
    download: 'Sækja ferilskrá',
    contactMe: 'Hafa samband',
    aboutMe: 'Um mig',
    technicalSkills: 'Tæknileg hæfni',
    featuredProject: 'Útvalið verkefni',
    education: 'Menntun',
    languages: 'Tungumál',
    references: 'Meðmæli',
    availableOnRequest: 'Fást sé óskað',
    getInTouch: 'Hafa samband',
    buildingSolutions: 'Lausnir sem skila árangri.',
    present: 'Núverandi',
  },
}

export function localize<T extends Record<string, unknown>>(item: T, lang: Lang): T {
  if (lang === 'en') return item
  const locales = (item as Record<string, unknown>).locales as Record<string, unknown> | undefined
  if (!locales) return item
  const override = locales[lang] as Partial<T> | undefined
  if (!override) return item
  return { ...item, ...override }
}
