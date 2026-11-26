import {z} from 'zod';

export const createCourseSchema=z.object({
    titre:z
        .string()
        .min(1,'Le titre est obligatoire')
        .max(120,'Le titre ne doit pas dépasser 120 caractères '),
    description: z
        .string()
        .min(1,'la description est obligatoire')
        .max(1000,'La description ne doit pas dépasser 1000 caractères'),
    imageUrl:z.string().url('URL d image invalide').optional().nullable()
})
export const listCoursesSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  per_page: z.coerce.number().int().min(1).max(100).default(10),
})

export const updateCourseSchema = z.object({
  titre: z.string().min(1).max(120).optional(),
  description: z.string().min(1).max(1000).optional(),
  imageUrl: z.string().url('URL de l’image invalide').optional().nullable(),

}).refine(
  (data) => data.titre !== undefined || data.description !== undefined || data.imageUrl !== undefined,
  { message: 'Au moins un champ doit être renseigné.' },
)

export const courseIdSchema = z.object({
  id: z.uuid({ error: 'Identifiant du cours invalide.' }),
})
