import { TOOL_DEFINITIONS } from './tool-definitions';

describe('desktop Explorer destinations', () => {
  it('has one destination for every installer-supported extension', () => {
    const expected = ['.json', '.yaml', '.yml', '.xml', '.csv', '.md', '.txt', '.toml', '.ini', '.sql', '.js', '.ts', '.html', '.css'];
    const extensions = TOOL_DEFINITIONS.flatMap((tool) => tool.desktopOpen?.extensions ?? []);
    expect(extensions.slice().sort()).toEqual(expected.slice().sort());
    expect(new Set(extensions).size).toBe(extensions.length);
    for (const tool of TOOL_DEFINITIONS.filter((item) => item.desktopOpen?.extensions?.length)) {
      expect(tool.desktopOpen?.inputKey).toBeTruthy();
    }
  });

  it('has one folder destination', () => {
    expect(TOOL_DEFINITIONS.filter((tool) => tool.desktopOpen?.directory).map((tool) => tool.id)).toEqual(['directory-diff']);
  });
});
