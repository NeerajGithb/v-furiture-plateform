import { Document } from "mongoose";

export function mapDocumentToPlainObject<T>(doc: Document): T {
  if (!doc) return doc as T;
  
  const obj = doc.toObject();
  
  // Convert _id to id and remove _id
  if (obj._id) {
    obj.id = obj._id.toString();
    delete obj._id;
  }
  
  // Remove __v
  delete obj.__v;
  
  return obj as T;
}

export function mapDocumentsToPlainObjects<T>(docs: Document[]): T[] {
  return docs.map(doc => mapDocumentToPlainObject<T>(doc));
}

export function sanitizeQuery(query: Record<string, any>): Record<string, any> {
  const sanitized: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== '') {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}