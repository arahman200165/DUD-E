import { fetchCratesIoMetadata } from './package-metadata-crates';
import { fetchNpmMetadata } from './package-metadata-npm';
import { fetchNuGetMetadata } from './package-metadata-nuget';
import { fetchPyPiMetadata } from './package-metadata-pypi';
import { PackageEcosystem, PackageLookupResult } from './package-metadata-types';

const FETCHERS: Record<PackageEcosystem, (name: string) => Promise<PackageLookupResult>> = {
  npm: fetchNpmMetadata,
  pypi: fetchPyPiMetadata,
  crates: fetchCratesIoMetadata,
  nuget: fetchNuGetMetadata,
};

export function lookupPackage(ecosystem: PackageEcosystem, name: string): Promise<PackageLookupResult> {
  if (name.trim() === '') return Promise.resolve({ ok: false, error: 'Enter a package name.' });
  return FETCHERS[ecosystem](name.trim());
}
