/**
 * Category matching utility for Blue Bells Mobile Shop
 * Shared between client components and server code
 */

export function doesProductBelongToCategory(
  productCategorySlug: string | undefined,
  brand: string | undefined,
  targetCategorySlug: string
): boolean {
  if (!productCategorySlug && !brand) return false;
  const pSlug = (productCategorySlug || '').toLowerCase();
  const tSlug = targetCategorySlug.toLowerCase();

  if (pSlug === tSlug) return true;

  if (tSlug === 'smartphones') {
    return pSlug === 'smartphones' || pSlug === 'iphone' || pSlug === 'samsung';
  }
  if (tSlug === 'iphone') {
    return (
      pSlug === 'iphone' ||
      (brand?.toLowerCase() === 'apple' && (pSlug === 'smartphones' || pSlug === 'iphone'))
    );
  }
  if (tSlug === 'samsung') {
    return (
      pSlug === 'samsung' ||
      (brand?.toLowerCase() === 'samsung' && (pSlug === 'smartphones' || pSlug === 'samsung'))
    );
  }
  if (tSlug === 'tablets' || tSlug === 'ipad') {
    return pSlug === 'tablets' || pSlug === 'ipad';
  }
  if (tSlug === 'smartwatches' || tSlug === 'smart-watches') {
    return pSlug === 'smartwatches' || pSlug === 'smart-watches';
  }
  if (tSlug === 'chargers' || tSlug === 'chargers-cables') {
    return pSlug === 'chargers' || pSlug === 'chargers-cables';
  }
  if (tSlug === 'cases' || tSlug === 'cases-covers') {
    return pSlug === 'cases' || pSlug === 'cases-covers';
  }
  if (tSlug === 'audio') {
    return pSlug === 'audio' || pSlug === 'headphones';
  }
  if (tSlug === 'accessories') {
    return (
      pSlug === 'accessories' ||
      pSlug === 'chargers' ||
      pSlug === 'cases' ||
      pSlug === 'audio' ||
      pSlug === 'chargers-cables' ||
      pSlug === 'cases-covers'
    );
  }
  return false;
}
