/**
 * Base class for MongoDB-compatible JSON document storage.
 * Documents always include _id for seamless remote migration.
 */
export class ThemedJsonStore {
  constructor(collectionName) {
    this.collectionName = collectionName
  }

  //* -------------------------------- wrapDocument -------------------------------------/
  /* Ensures every stored record has a MongoDB-compatible _id field and ISO updatedAt.
  */
  wrapDocument(id, data) {
    const doc = Object.assign({}, data)
    doc._id = id
    if (!doc.updatedAt) {
      doc.updatedAt = new Date().toISOString()
    }
    return doc
  }

  //* -------------------------------- validateDocument -------------------------------------/
  /* Validates that a document has required MongoDB fields before persistence.
  */
  validateDocument(doc) {
    if (!doc || typeof doc !== 'object') {
      return false
    }
    if (!doc._id || typeof doc._id !== 'string') {
      return false
    }
    return true
  }

  //* -------------------------------- serializeCollection -------------------------------------/
  /* Formats an array of documents as a JSON collection envelope for export or sync.
  */
  serializeCollection(documents) {
    return {
      collection: this.collectionName,
      exportedAt: new Date().toISOString(),
      documents: documents
    }
  }
}
