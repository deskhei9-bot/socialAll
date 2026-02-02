import { createHash } from 'crypto';

/**
 * Generate content hash for duplicate detection
 */
export function generateContentHash(content: string): string {
  // Normalize content: lowercase, remove extra whitespace, trim
  const normalized = content
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
  
  // Generate SHA256 hash
  return createHash('sha256')
    .update(normalized)
    .digest('hex')
    .substring(0, 16); // Use first 16 chars for shorter hash
}

/**
 * Calculate similarity between two strings (0-1)
 * Using Levenshtein distance
 */
export function calculateSimilarity(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;
  
  if (len1 === 0) return len2 === 0 ? 1 : 0;
  if (len2 === 0) return 0;
  
  const matrix: number[][] = [];
  
  // Initialize matrix
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }
  
  // Calculate distances
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,     // deletion
        matrix[i][j - 1] + 1,     // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }
  
  const maxLen = Math.max(len1, len2);
  const distance = matrix[len1][len2];
  return 1 - (distance / maxLen);
}

/**
 * Check if content is similar to existing posts
 */
export function findSimilarContent(
  newContent: string,
  existingPosts: Array<{ content: string; created_at: string; id: string }>
): Array<{ post: any; similarity: number }> {
  const normalized = newContent.toLowerCase().trim();
  const similar: Array<{ post: any; similarity: number }> = [];
  
  // Only check posts from last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  for (const post of existingPosts) {
    const postDate = new Date(post.created_at);
    if (postDate < thirtyDaysAgo) continue;
    
    const similarity = calculateSimilarity(
      normalized,
      post.content.toLowerCase().trim()
    );
    
    // If similarity > 80%, consider it duplicate
    if (similarity > 0.8) {
      similar.push({ post, similarity });
    }
  }
  
  return similar.sort((a, b) => b.similarity - a.similarity);
}
