import {DocumentTextIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'
import {localeMeta, locales} from '../../i18n/locales'

const localeFields = locales.map((code) => ({
  name: code,
  title: `${localeMeta[code].flag} ${localeMeta[code].endonym}`,
}))

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
    defineField({
      name: 'category',
      type: 'string',
      title: 'Category',
      group: 'shared',
      options: {
        list: [
          {title: 'Guide', value: 'guide'},
          {title: 'Product', value: 'product'},
          {title: 'Sustainability', value: 'sustainability'},
          {title: 'News', value: 'news'},
        ],
        layout: 'radio',
      },
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
              source: `${locale.name}.title`,
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
      titleEn: 'en.title',
      titleCs: 'cs.title',
      media: 'en.mainImage',
      publishedAt: 'publishedAt',
      category: 'category',
    },
    prepare(selection) {
      const title = selection.titleCs || selection.titleEn || 'Untitled post'
      const date = selection.publishedAt
        ? new Date(selection.publishedAt).toLocaleDateString()
        : 'Draft'
      const category = selection.category ? String(selection.category) : null
      return {
        title,
        subtitle: category ? `${category} · ${date}` : date,
        media: selection.media,
      }
    },
  },
})
