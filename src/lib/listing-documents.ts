import 'server-only'
import { createAdminClient } from '@/lib/supabase/admin'

export type ListingDocumentCategory =
  | 'epc' | 'plattegrond' | 'technische_fiche' | 'schatting'
  | 'foto_brochure' | 'kadaster' | 'stedenbouw' | 'overig'

export type ListingDocument = {
  id: string
  listingId: string
  name: string
  description: string | null
  fileUrl: string
  sizeBytes: number | null
  mimeType: string | null
  category: ListingDocumentCategory
  isPublic: boolean
  orderIndex: number
  createdAt: string
}

export const LISTING_DOC_CATEGORY_LABEL: Record<ListingDocumentCategory, string> = {
  epc: 'EPC-certificaat',
  plattegrond: 'Plattegrond',
  technische_fiche: 'Technische fiche',
  schatting: 'Schatting',
  foto_brochure: 'Brochure',
  kadaster: 'Kadasterplan',
  stedenbouw: 'Stedenbouw',
  overig: 'Document',
}

export async function getPublicListingDocuments(listingId: string): Promise<ListingDocument[]> {
  try {
    const admin = createAdminClient()
    const { data, error } = await admin
      .from('listing_documents')
      .select('*')
      .eq('listing_id', listingId)
      .eq('is_public', true)
      .order('order_index', { ascending: true })
      .order('created_at', { ascending: true })
    if (error || !data) return []

    return (data as Array<{
      id: string; listing_id: string; name: string; description: string | null;
      file_url: string; size_bytes: number | null; mime_type: string | null;
      category: ListingDocumentCategory; is_public: boolean;
      order_index: number; created_at: string;
    }>).map((r) => ({
      id: r.id,
      listingId: r.listing_id,
      name: r.name,
      description: r.description,
      fileUrl: r.file_url,
      sizeBytes: r.size_bytes,
      mimeType: r.mime_type,
      category: r.category,
      isPublic: r.is_public,
      orderIndex: r.order_index,
      createdAt: r.created_at,
    }))
  } catch {
    return []
  }
}

export function formatDocSize(bytes: number | null): string {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}
