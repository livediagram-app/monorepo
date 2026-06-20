import { FeatureCategoryIndex, featureCategoryMetadata } from '@/components/FeatureCategoryIndex';

export const metadata = featureCategoryMetadata('customisation');

export default function CustomisationCategoryPage() {
  return <FeatureCategoryIndex slug="customisation" />;
}
