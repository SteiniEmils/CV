// Edit this file with your own details.

export type Experience = {
  company: string
  role: string
  start: string
  end: string
  description: string
}

export type Education = {
  institution: string
  degree: string
  start: string
  end: string
}

export type Project = {
  name: string
  description: string
  url: string
  tech: string
}

export const cv = {
  name: 'Thorsteinn Emils',
  title: 'Flutter & React Developer',
  location: '',
  email: 'thorsteinnemils@gmail.com',
  github: 'https://github.com/SteiniEmils',
  website: 'https://steiniemils.com',
  linkedin: '',
  summary:
    'Mobile-first developer who builds cross-platform apps with Flutter and Dart, and modern web interfaces with React and TypeScript. Comfortable working across the stack — from PostgreSQL and native mobile tooling to self-hosting and shipping apps on real devices.',
  skills: [
    'Flutter',
    'Dart',
    'React',
    'TypeScript',
    'PostgreSQL',
    'C++',
    'Git',
    'Linux',
    'Node.js',
    'Coolify',
  ],
  experience: [
    {
      company: 'Your Company',
      role: 'Your Role',
      start: '20xx',
      end: 'Present',
      description:
        'Describe your responsibilities and achievements here. Replace this placeholder with your real experience.',
    },
  ],
  education: [
    {
      institution: 'Your School',
      degree: 'Your Degree',
      start: '20xx',
      end: '20xx',
    },
  ],
  projects: [
    {
      name: 'MEMM',
      description: 'make more moments',
      url: 'https://github.com/SteiniEmils/MEMM',
      tech: 'Dart, Flutter, PostgreSQL, C++',
    },
    {
      name: 'minngr_app',
      description: 'Personal Flutter project for managing things on the go.',
      url: 'https://github.com/SteiniEmils/minngr_app',
      tech: 'Dart, Flutter, PostgreSQL, C++',
    },
    {
      name: 'steiniemils.com',
      description:
        'This personal CV website — built with React, TypeScript, Vite, Docker, and deployed on a self-hosted Coolify instance.',
      url: 'https://github.com/SteiniEmils/CV',
      tech: 'React, TypeScript, Vite, Docker, Coolify',
    },
  ],
} as const
