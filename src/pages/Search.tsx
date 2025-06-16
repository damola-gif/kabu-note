
import { AdvancedSearch } from '@/components/search/AdvancedSearch';

export default function Search() {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Advanced Search</h1>
        <p className="text-muted-foreground">
          Search across posts, strategies, and users with powerful full-text search
        </p>
      </div>
      <AdvancedSearch />
    </div>
  );
}
