import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'filgeo — Maharashtra Board Geology',
    short_name: 'filgeo',
    description: 'Free offline-first study guide for Maharashtra State Board Geology',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#14171B',
    theme_color: '#14171B',
    categories: ['education'],
    icons: [
      {
        src: '/icons/icon-512.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  };
}
