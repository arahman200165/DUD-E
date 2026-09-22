/**
 * Word list for diceware-style passphrase generation.
 *
 * NOTE: this is a hand-curated placeholder list of common English words, NOT
 * the actual EFF long wordlist (7,776 entries, https://www.eff.org/dice)
 * referenced by the Phase 12 plan — this tool had no network access at
 * implementation time to fetch that exact list, and fabricating text and
 * labeling it "EFF" would be worse than shipping an honestly-labeled
 * placeholder. Swap this file's contents for the real EFF long wordlist
 * (or another audited, fixed-size wordlist) when convenient; the rest of
 * the tool only depends on `WORDLIST.length`, so any list drops in cleanly.
 *
 * Deduplicated at module load (categories below overlap a little, e.g.
 * "orange"/"lime" appear as both a color and a food) so the exported list
 * is guaranteed duplicate-free without hand-auditing every entry.
 */

const ANIMALS = [
  'ant', 'bear', 'bird', 'cat', 'cow', 'deer', 'dog', 'duck', 'eagle', 'fish', 'fox', 'frog', 'goat', 'goose',
  'hawk', 'horse', 'lion', 'lynx', 'mole', 'moose', 'mouse', 'otter', 'owl', 'panda', 'parrot', 'pig', 'rabbit',
  'raven', 'seal', 'shark', 'sheep', 'skunk', 'sloth', 'snake', 'spider', 'squid', 'swan', 'tiger', 'toad',
  'turkey', 'turtle', 'viper', 'walrus', 'wasp', 'whale', 'wolf', 'wombat', 'worm', 'zebra', 'camel', 'crow',
  'dove', 'elk', 'ferret', 'gecko', 'hare', 'ibis', 'jaguar', 'koala', 'lemur', 'badger', 'beetle', 'bison',
  'cobra', 'cougar', 'coyote', 'crab', 'cricket', 'falcon', 'firefly', 'flamingo', 'gazelle', 'heron', 'hornet',
  'hyena', 'iguana', 'jackal', 'ladybug', 'leopard', 'lobster', 'magpie', 'mantis', 'meerkat', 'mink', 'mongoose',
  'newt', 'ostrich', 'panther', 'pelican', 'penguin', 'pigeon', 'python', 'raccoon', 'rhino', 'salmon', 'sparrow',
  'starfish', 'stork', 'swallow', 'termite', 'toucan', 'vulture', 'weasel', 'woodpecker',
];

const COLORS = [
  'amber', 'azure', 'beige', 'black', 'blue', 'bronze', 'brown', 'coral', 'crimson', 'cyan', 'gold', 'gray',
  'green', 'indigo', 'ivory', 'jade', 'khaki', 'lavender', 'lime', 'magenta', 'maroon', 'navy', 'olive', 'orange',
  'pink', 'plum', 'purple', 'red', 'rose', 'rust', 'salmon', 'scarlet', 'silver', 'tan', 'teal', 'turquoise',
  'violet', 'white', 'yellow',
];

const FOOD = [
  'apple', 'apricot', 'bacon', 'bagel', 'banana', 'basil', 'bean', 'beef', 'berry', 'biscuit', 'bread', 'broth',
  'butter', 'cabbage', 'cake', 'candy', 'carrot', 'cheese', 'cherry', 'chili', 'chip', 'chive', 'cider', 'clove',
  'cocoa', 'coconut', 'coffee', 'cookie', 'corn', 'cream', 'crumb', 'cucumber', 'curry', 'date', 'dill', 'egg',
  'fig', 'flour', 'garlic', 'ginger', 'grape', 'gravy', 'honey', 'jam', 'kale', 'kiwi', 'lemon', 'lentil',
  'lettuce', 'lime', 'mango', 'maple', 'melon', 'milk', 'mint', 'mustard', 'noodle', 'nutmeg', 'oat', 'olive',
  'onion', 'orange', 'oyster', 'pasta', 'peach', 'peanut', 'pear', 'pecan', 'pepper', 'pickle', 'pie', 'plum',
  'potato', 'pretzel', 'pumpkin', 'radish', 'raisin', 'rice', 'salad', 'salt', 'sauce', 'sausage', 'soup',
  'spice', 'spinach', 'sugar', 'syrup', 'taco', 'thyme', 'toast', 'tofu', 'tomato', 'truffle', 'turnip',
  'vanilla', 'waffle', 'walnut', 'wheat', 'yogurt', 'zucchini',
];

const NATURE = [
  'breeze', 'brook', 'canyon', 'cave', 'cliff', 'cloud', 'coast', 'comet', 'creek', 'delta', 'desert', 'dew',
  'dune', 'dust', 'earth', 'ember', 'fjord', 'fog', 'forest', 'frost', 'glacier', 'glow', 'grove', 'hail',
  'harbor', 'hill', 'ice', 'island', 'lagoon', 'lake', 'leaf', 'lightning', 'marsh', 'meadow', 'mist', 'moon',
  'mountain', 'mud', 'ocean', 'orbit', 'peak', 'plain', 'plateau', 'pond', 'prairie', 'rain', 'rainbow', 'reef',
  'ridge', 'river', 'rock', 'sand', 'shore', 'sky', 'sleet', 'snow', 'spark', 'star', 'stone', 'storm', 'stream',
  'sun', 'swamp', 'thunder', 'tide', 'tundra', 'valley', 'volcano', 'wave', 'wind',
];

const OBJECTS = [
  'anchor', 'anvil', 'axe', 'badge', 'barrel', 'basket', 'bell', 'belt', 'bench', 'blade', 'blanket', 'bolt',
  'book', 'boot', 'bottle', 'bowl', 'box', 'brick', 'broom', 'brush', 'bucket', 'button', 'cable', 'candle',
  'cane', 'cart', 'chain', 'chair', 'chalk', 'chart', 'chest', 'clip', 'clock', 'cloth', 'coin', 'comb', 'cord',
  'crate', 'cup', 'curtain', 'cushion', 'desk', 'dial', 'dish', 'doll', 'door', 'drawer', 'drum', 'fan', 'faucet',
  'fence', 'flag', 'fork', 'frame', 'funnel', 'glass', 'glove', 'hammer', 'handle', 'hanger', 'hat', 'hinge',
  'hook', 'jar', 'jug', 'kettle', 'key', 'knife', 'ladder', 'lamp', 'latch', 'lever', 'lid', 'lock', 'mat',
  'mirror', 'mop', 'nail', 'needle', 'net', 'oven', 'pail', 'pan', 'paper', 'pen', 'pencil', 'pillow', 'pin',
  'pipe', 'plate', 'pocket', 'pole', 'pot', 'quilt', 'rack', 'rail', 'rake', 'ribbon', 'ring', 'rod', 'rope',
  'rug', 'saddle', 'sack', 'scale', 'scarf', 'scissors', 'screw', 'shelf', 'shield', 'shovel', 'sink', 'sock',
  'spoon', 'spring', 'stamp', 'stool', 'strap', 'string', 'switch', 'table', 'tape', 'thread', 'tile', 'tool',
  'towel', 'tray', 'tub', 'tube', 'umbrella', 'vase', 'vest', 'wagon', 'wallet', 'watch', 'wheel', 'whisk',
  'wire', 'wrench',
];

const ACTIONS = [
  'absorb', 'accept', 'achieve', 'act', 'adapt', 'add', 'adjust', 'admire', 'admit', 'advance', 'advise',
  'agree', 'aim', 'allow', 'amuse', 'announce', 'answer', 'appear', 'applaud', 'apply', 'approve', 'argue',
  'arrange', 'arrive', 'ask', 'assemble', 'assign', 'assist', 'attach', 'attack', 'attempt', 'attend', 'avoid',
  'awaken', 'balance', 'bathe', 'battle', 'beam', 'beg', 'begin', 'behave', 'bend', 'bind', 'bite', 'blend',
  'bless', 'blink', 'block', 'bloom', 'blow', 'boast', 'boil', 'bond', 'boost', 'borrow', 'bounce', 'bow',
  'brake', 'branch', 'break', 'breathe', 'brew', 'bring', 'broadcast', 'browse', 'build', 'bump', 'burn',
  'burst', 'bury', 'buzz', 'calculate', 'call', 'camp', 'carry', 'carve', 'catch', 'cause', 'celebrate',
  'challenge', 'change', 'charge', 'chase', 'cheat', 'check', 'cheer', 'chew', 'choose', 'chop', 'claim', 'clap',
  'clarify', 'clean', 'climb', 'cling', 'close', 'coach', 'collect', 'combine', 'comfort', 'command', 'compare',
  'compete', 'compile', 'complain', 'complete', 'compose', 'confirm', 'connect', 'consider', 'consult',
  'continue', 'convert', 'cook', 'copy', 'correct', 'count', 'cover', 'crash', 'create', 'creep', 'cross',
  'crush', 'cry', 'cut', 'dance', 'dare', 'decide', 'decorate', 'delay', 'deliver', 'depend', 'describe',
  'design', 'destroy', 'develop', 'differ', 'dig', 'direct', 'disagree', 'discover', 'discuss', 'dive', 'divide',
  'drag', 'draw', 'dream', 'dress', 'drift', 'drink', 'drive', 'drop',
];

const MISC = [
  'chimney', 'apron', 'archer', 'arena', 'armor', 'artist', 'atlas', 'baker', 'banner', 'beacon', 'bishop',
  'blossom', 'bridge', 'bubble', 'bundle', 'canvas', 'captain', 'castle', 'cavern', 'cedar', 'chapel', 'charm',
  'cherub', 'circus', 'citadel', 'cobble', 'compass', 'copper', 'corner', 'cottage', 'cradle', 'crown', 'crystal',
  'dagger', 'dawn', 'diamond', 'dragon', 'dusk', 'eclipse', 'empire', 'engine', 'phoenix', 'feather',
  'festival', 'flame', 'flute', 'fortress', 'fountain', 'garden', 'gate', 'avalanche', 'globe', 'goblet',
  'granite', 'harmony', 'harvest', 'haven', 'horizon', 'hymn', 'jewel', 'journey', 'jungle', 'kingdom',
  'cascade', 'lantern', 'legend', 'library', 'lighthouse', 'lyric', 'manor', 'mansion', 'marble', 'market',
  'maze', 'melody', 'mirage', 'mosaic', 'museum', 'mystic', 'nectar', 'nomad', 'oasis', 'oracle', 'orchard',
  'pagoda', 'palace', 'paradise', 'pearl', 'phantom', 'pillar', 'pioneer', 'portrait', 'puzzle', 'quarry',
  'quartz', 'quest', 'rampart', 'realm', 'relic', 'tassel', 'riddle', 'ripple', 'sapphire', 'satchel',
  'scroll', 'sculpture', 'shadow', 'shrine', 'siren', 'sonnet', 'spiral', 'statue', 'summit', 'symphony',
  'temple', 'terrace', 'theater', 'throne', 'timber', 'topaz', 'tower', 'trail', 'treasure', 'trinket', 'trophy',
  'trumpet', 'tunnel', 'turret', 'twilight', 'vault', 'velvet', 'verse', 'village', 'vista', 'voyage', 'whistle',
  'willow', 'wisdom', 'wonder', 'wreath', 'zenith',
];

const RAW_WORDS = [...ANIMALS, ...COLORS, ...FOOD, ...NATURE, ...OBJECTS, ...ACTIONS, ...MISC];

export const EFF_WORDLIST: readonly string[] = Array.from(new Set(RAW_WORDS));
