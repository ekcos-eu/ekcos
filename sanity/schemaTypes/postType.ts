import {DocumentTextIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

const localeFields = [
  {name: 'cs', title: '🇨🇿 Čeština'},
  {name: 'en', title: '🇬🇧 English'},
  {name: 'de', title: '🇩🇪 Deutsch'},
  {name: 'fr', title: '🇫🇷 Français'},
  {name: 'it', title: '🇮🇹 Italiano'},
  {name: 'es', title: '🇪🇸 Español'},
] as const

export const postType = defineType({
  name: 'post',
  title: 'Post',
  type: 'document',
  icon: DocumentTextIcon,
  groups: [
    {name: 'shared', title: 'Shared'},
    ...localeFields.map((locale) => ({name: locale.name, title: locale.title})),
  ],
  fields: [
    defineField({
      name: 'publishedAt',
      type: 'datetime',
      title: 'Published at',
      group: 'shared',
    }),
    ...localeFields.map((locale) =>
      defineField({
        name: locale.name,
        title: locale.title,
        type: 'object',
        group: locale.name,
        fields: [
          defineField({
            name: 'title',
            type: 'string',
          }),
          defineField({
            name: 'slug',
            type: 'slug',
            options: {
              source: 'title',
            },
          }),
          defineField({
            name: 'mainImage',
            type: 'image',
            options: {
              hotspot: true,
            },
            fields: [
              defineField({
                name: 'alt',
                type: 'string',
                title: 'Alternative text',
              }),
            ],
          }),
          defineField({
            name: 'excerpt',
            type: 'text',
            rows: 4,
          }),
          defineField({
            name: 'body',
            type: 'blockContent',
          }),
        ],
      }),
    ),
  ],
  preview: {
    select: {
      titleCs: 'cs.title',
      titleEn: 'en.title',
      titleDe: 'de.title',
      titleFr: 'fr.title',
      titleIt: 'it.title',
      titleEs: 'es.title',
      slugCs: 'cs.slug.current',
      slugEn: 'en.slug.current',
      slugDe: 'de.slug.current',
      slugFr: 'fr.slug.current',
      slugIt: 'it.slug.current',
      slugEs: 'es.slug.current',
      media: 'en.mainImage',
      publishedAt: 'publishedAt',
    },
    prepare(selection) {
      const title =
        selection.titleCs ||
        selection.titleEn ||
        selection.titleDe ||
        selection.titleFr ||
        selection.titleIt ||
        selection.titleEs ||
        'Untitled post'

      const languageOrder = ['cs', 'en', 'de', 'fr', 'it', 'es'] as const
      const filledLanguages = languageOrder
        .filter((lang) => {
          const slug =
            lang === 'cs'
              ? selection.slugCs
              : lang === 'en'
                ? selection.slugEn
                : lang === 'de'
                  ? selection.slugDe
                  : lang === 'fr'
                    ? selection.slugFr
                    : lang === 'it'
                      ? selection.slugIt
                      : selection.slugEs
          return typeof slug === 'string' && slug.length > 0
        })
        .map((lang) => lang.toUpperCase())
        .join(', ')

      const date = selection.publishedAt ? new Date(selection.publishedAt).toLocaleDateString() : 'Draft'
      return {
        title,
        subtitle: `${date}${filledLanguages ? ` • ${filledLanguages}` : ''}`,
        media: selection.media,
      }
    },
  },
})
