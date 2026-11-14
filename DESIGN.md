# Pretty Sure: design brief and system

Read this before changing how anything looks. New screens should feel like they
came out of the same deck.

## The brief

**What it is.** A prediction journal you play like a card table. You make a call,
say how sure you are, stake chips on it, and settle it later. Over time it shows
whether your "80% sure" really comes true 80% of the time.

**Who it's for.** People who want to be honest with themselves about how sure
they are, and friends who want to bet on each other's goals (runs, deadlines,
matches).

**How it should feel.** A real card table, not a dashboard. Green felt, cream
cards, red and black ink. Playful, a bit dry, never loud. Every screen is a card
dealt onto the table.

**What it must never look like.**
- A generic AI app: no purple gradients, no Inter, no emoji as icons, no glassy blur.
- A casino: no neon, no flashing jackpots. Chips are play money for honesty.
- A spreadsheet: numbers sit on cards, not in grids of tiny cells.

**References** (what to look at, and what to take from each):
- A real deck of playing cards: corner ranks, suits, cream stock, two inks.
- Paper betting slips: printed red labels, handwritten-looking entries in boxes.
- The felt of a card table: the page itself, with gold lines like table markings.

## The system

All of these live as CSS variables at the top of `src/index.css`. Use the
variable, never the raw value. `/style` (`StyleGuide.jsx`) shows the pieces.

### Colour

| Token | Value | Use |
|---|---|---|
| `--felt` / `--felt-dark` | `#0f4a33` / `#0a3725` | The page; shadows under cards |
| `--card` / `--card-edge` | `#f6f0e1` / `#d9cfb8` | Card stock; card borders and dividers |
| `--black` | `#1b1b1b` | Ink: what you write, black suits |
| `--red` | `#b3261e` | **The one accent.** Printed labels, red suits, the main button, losses |
| `--gold` | `#d8b25a` | Only on the felt: the bank, page headings, focus. It's the table's trim, not a second accent on cards |
| `--on-felt` / `--on-felt-dim` | cream / 65% cream | Text printed on the felt |

Wins are shown in black ink, losses in red. No greens, blues or purples.
The only other colours allowed are Google's, inside the Google sign-in button.

### Type

| Role | Font | Where |
|---|---|---|
| Deck | Bodoni Moda (serif) | Titles, card text, numbers, odds |
| Interface | Libre Franklin (sans) | Labels, buttons, form fields |

Two fonts, no others. Labels are small caps-style: uppercase, 11px, wide tracking, red on cards.

### Spacing

One scale, `--s1` to `--s6`: **4, 8, 12, 16, 24, 32px**. Every gap, margin and
padding uses one of these. Hairlines (1–2px) are the only exception.

### Corners

One radius, `--radius: 2px`, for every square thing: cards, buttons, fields,
tags, placeholders. Circles only for round objects: the chip and status dots.

### Pieces

- **Card (`.slip`)**: cream, 1px edge, hard 3px felt shadow, no blur.
- **Fields (`.box`)**: no boxes, just a label and a line, like writing on a slip.
- **Buttons (`.btn`)**: uppercase sans, 1.5px border. `.solid` is red, used once per screen for the main action.
- **Empty states**: one centred card, a big suit, one line, one action.
- **Loading**: card-shaped shimmer placeholders (`LoadingCards`), never a spinner.
- **Stamps** (like LATE): sit above a card's text, never across it.
- **Icons**: suits as text glyphs (with `font-variant-emoji: text`), anything else as small inline SVG. Never emoji.

### Motion

Movement means something happened to a card: it's dealt in, squeezed and
flipped to settle, stamped with a result, or pulled out of the hand. Nothing
moves just to decorate. Everything respects `prefers-reduced-motion`.

### Copy

Short, plain, second person, a little dry. Card-table words where they fit
(deal, table, stake, settle, back it) but never at the cost of being clear.
Errors say what happened and what to do next, never a database message.
