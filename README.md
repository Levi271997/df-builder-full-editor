# DF Builder Full Editor

An Oxygen-style **full-screen page builder** for WordPress, for Digitalfeet client sites. It runs on the block editor engine, so pages are still saved as normal block content. That means you can open any page in either this builder or the regular WordPress editor.

> This is a separate plugin from [df-builder](https://github.com/Levi271997/df-builder). They share block names, so only one of them can be active at a time. This plugin refuses to load while the original is active.

## Opening the full-screen builder

- **Pages / Posts / DF Builder → Templates:** hover a row and click **Edit with DF Builder**.
- **Regular block editor:** click **Edit with DF Builder** in the post sidebar. Unsaved changes are saved first.
- **Front end:** click **Edit with DF Builder** in the admin bar.

### The builder screen

```
┌──────┬───────────────────────────────────────────────────────────────┐
│  DF  │ Page title     [Desktop][Tablet][Landscape][Phone]  ↶ ↷ Save │
├──┬───┴──────────┬─────────────────────────────────┬──────────────────┤
│+ │ Add          │                                 │ Element settings │
│≡ │ / Structure  │      Canvas (breakpoint width)  │ (style panel,    │
│  │              │                                 │  dynamic data…)  │
└──┴──────────────┴─────────────────────────────────┴──────────────────┘
```

- **Add:** DF elements grouped as Layout, Basic, Dynamic and Advanced. Click one to add it inside the selected container, or after the selected element. **All blocks** opens the full block library, with search and drag and drop.
- **Structure:** the element tree. Click to select, drag to reorder, and use the arrows to move elements.
- **Breakpoint buttons:** resize the canvas to the Tablet, Landscape or Phone width and switch the style panel to that breakpoint, so the styles you set apply to that screen size.
- **Right panel:** the selected element's settings and the DF Builder style panel (the **Styles** tab).
- **DF** (top left) exits back to where you came from.
- **Classes tab (left rail):** every global class, with how many elements on this page use it. Create, rename or delete classes here. Click the usage count to select the first element that uses the class.
- **Copy / paste styles:** open an element's **⋮** menu and choose **Copy styles**. Then select one or more other elements and choose **Paste styles**; their styles and classes are replaced. **Clear styles** removes them. The copied styles stay available across pages in the same browser.
- **Breadcrumb bar** (under the canvas): shows where the selected element sits in the page (Page › Section › Div › Heading). Click any level to select it.
- **Keyboard shortcuts** (the **?** button, or Shift+?):

  | Shortcut | Action |
  |---|---|
  | Ctrl/⌘+S | Save |
  | Ctrl/⌘+Z, Ctrl/⌘+Shift+Z (or Ctrl+Y) | Undo, Redo |
  | Ctrl/⌘+Shift+D | Duplicate element |
  | Shift+Alt+Z | Delete element |
  | Ctrl/⌘+Alt+T / Y | Insert before / after |
  | Alt+Shift+1 … 4 | Desktop / Tablet / Landscape / Phone |

### Page and template settings

Click an empty area of the canvas, or press **Esc** until nothing is selected, and the right panel shows:

- **Pages and posts:** title, slug, status, a *View on site* link, and *Open in the WordPress editor*.
- **Templates:** title and status, plus **Template settings**: type (header, content or footer), display conditions (include/exclude rules) and priority. These are the same settings as in the block editor sidebar. Only **published** templates are used on the site.

Changes here are saved with the **Save** button, like any other edit.

### Switching, creating and previewing

- **▾ next to the title:** opens a menu of recent pages and all templates, so you can jump between them without leaving the builder. **New page** and **New template** create a draft and open it.
- **👁 Preview:** saves first, then opens the page in a new tab. Templates preview on the home page.
- **Unsaved changes:** if you try to leave, switch pages or close the tab with unsaved changes, the browser asks you to confirm.

### Known limitations

- There's no post locking yet. If two people edit the same page at the same time in the builder, the last save wins.
- Other plugins' sidebar panels for the regular block editor don't appear in the builder. Use *Open in the WordPress editor* for those.
- Like the rest of this plugin, the PHP side hasn't been tested on a live WordPress install yet. Try it on staging first.


**Requires:** WordPress 6.6+ (6.7+ recommended for live dynamic-data previews of core blocks), PHP 8.1+.

> **Status:** early version. Test on a local or staging site before using it on a live client site.

## Installation

The repo doesn't include built files, so build the plugin zip first:

```bash
git clone https://github.com/Levi271997/df-builder-full-editor.git
cd df-builder-full-editor
npm install
npm run build
npm run plugin-zip      # creates df-builder-full-editor.zip
```

In WordPress, go to **Plugins → Add New → Upload Plugin**, choose `df-builder-full-editor.zip`, then **Activate**. A **DF Builder** menu appears in wp-admin, with *Settings* and *Templates* under it.

## Usage guide

### 1. Site settings (DF Builder → Settings)

- **Page width:** the maximum content width inside Sections (default 1120px).
- **Gutter:** the side padding on small screens.
- **Breakpoints:** Tablet 992, Landscape 768 and Phone 480 by default.
- **Use DF Builder templates:** turns all templates on or off for the whole site.

### 2. Building a page

Open a page in the block editor. Under **DF Builder** in the inserter (**+**) you'll find:

- **Layout & basics:** Section, Div, Grid Columns, Heading, Text, Button, Image, Link Wrapper, Icon, Post Content
- **Dynamic & dev:** Posts Grid (Repeater), Code Block, Shortcode, Comments, Login Form, Breadcrumbs

A typical structure:

```
Section            ← full-width band (background, vertical padding)
  └ Div            ← flex container
      ├ Heading
      ├ Text
      └ Button
```

Select a block and open the **Styles** tab in the right sidebar to style it.

### 3. The style panel

- **Breakpoint tabs:** Desktop · Tablet · Landscape · Phone · Hover.
  - Desktop values apply at every screen size. Smaller tabs override them.
  - Grey placeholders show the value inherited from a larger screen.
  - A blue dot means that tab has values set.
  - Switching to Tablet or Phone also switches the editor preview, and the reverse works too.
- **Sections:** Layout (display, flex/grid, gap), Flex/grid child, Spacing (padding and margin boxes), Size, Position, Typography, Background, Border and Effects.
- **Values:** type a value and press Enter or click away to apply it.
  - A plain number becomes px (`20` → `20px`).
  - `rem`, `%`, `vw`, `calc()`, `clamp()` and `var(--x)` also work.
  - Invalid values turn red and are ignored.
- **Reset** clears every value on the current tab.

The panel also works on core blocks: Group, Columns, Paragraph, Heading, Image, Buttons, List and Cover.

### 4. Global classes

1. At the top of the style panel, type a name into **Global classes** (for example `btn-primary`) and press Enter. This creates the class and adds it to the block.
2. Change **Editing** from *This block only* to **Class .btn-primary**, then set the styles.
3. Add the class to other blocks, and they all share those styles.
4. Classes are saved when you save the post, or right away with **Save class**.

You can rename or delete classes under **DF Builder → Settings**. Styles set on a single block override the class's styles.

### 5. Templates (header, footer, layouts)

1. Go to **DF Builder → Templates → Add template**.
2. In the sidebar, open **Template settings** and pick a **Template type**:
   - **Header** / **Footer:** the condition starts as *Entire site*.
   - **Content:** add a **Post Content** block where the page's own content goes. For archives, use a core **Query Loop**.
3. Under **Display conditions**, add rules:
   - **Include:** where the template is used (for example *Single → Post*, *Front page*, or a taxonomy archive).
   - **Exclude:** where it isn't used (for example the IDs of landing pages).
4. Publish it.

When any template matches, DF Builder replaces the theme's output:

```
header template → content template (or the normal page content) → footer template
```

If several templates of the same type match, the highest **Priority** wins. On a tie, the more specific rule wins.

### 6. Dynamic data

1. Select a Heading, Text, Button, Image or Link Wrapper block (the core Paragraph, Heading, Image and Button blocks work too).
2. In the **Settings** tab, open **Dynamic data**.
3. Pick a source:
   - **Post field:** title, excerpt, date, permalink, featured image, and more.
   - **Custom field:** enter the meta key.
   - **ACF field:** shown only when ACF is active.
   - **Author:** name, bio, archive link, avatar.
   - **Site:** title, tagline, home URL, current year.
4. The editor shows a placeholder such as `{ Post field: Title }`. The real value appears on the front end.

### 7. Dynamic & dev blocks

- **Posts Grid (Repeater):** design one card inside it and it repeats for each post. The default card is already bound to the permalink, featured image, title and excerpt.
  - Choose the post type, count, order and taxonomy filter.
  - Turn on **Use the page’s main query** in archive or search content templates.
  - Pagination is optional.
- **Code Block:** HTML, CSS and JavaScript tabs. In CSS, `%%SELECTOR%%` targets this block only. JS runs in the footer, never inside the editor.
  - Only users with the `unfiltered_html` capability can save code. For anyone else the code is removed on save.
  - That includes edits to a post that already has code: if someone without the capability saves it, the existing code is removed too.
- **Shortcode:** paste a shortcode (for example a form plugin). When the block isn’t selected, it shows a live preview.
- **Comments:** comment list and/or comment form for the current post.
- **Login Form:** the WordPress login form, with an optional redirect. Logged-in visitors see a message and a logout link instead.
- **Breadcrumbs:** Home › parents/category › current page, with schema.org markup. The editor shows a sample trail.

### Example first setup

1. A **Header** template (*Entire site*): a Section with a logo, Links and a Button.
2. A **Footer** template (*Entire site*).
3. A **Content** template for *Single → Post*: a Heading bound to the post title, an Image bound to the featured image, and a Post Content block.
4. Classes such as `btn-primary` and `card`, reused across pages.

## What it adds

| Feature | Where |
|---|---|
| **Style panel** on DF Builder blocks and common core blocks (group, columns, paragraph, heading, image, buttons, list, cover). It covers layout (flex/grid), spacing, size, position, typography, background, border and effects, per **Desktop / Tablet / Landscape / Phone / Hover**. Empty fields show the inherited value. | Block sidebar → **Styles** tab |
| **Blocks:** Section, Div, Grid Columns, Heading, Text, Button, Image, Link Wrapper, Icon, Post Content, Posts Grid (Repeater), Code Block, Shortcode, Comments, Login Form, Breadcrumbs | Inserter → *DF Builder* |
| **Global classes:** type a name in *Global classes* to create one, then switch *Editing* to that class to style every block that uses it. Classes are saved when you save the post or click *Save class*. | Style panel; manage/rename/delete in **DF Builder → Settings** |
| **Templates:** header, content (body) and footer templates with include/exclude conditions and a priority. When one matches, the theme output is replaced by the DF Builder canvas. | **DF Builder → Templates** |
| **Dynamic data:** bind text, URLs and images to post fields, custom fields, ACF fields, the author or the site, using the core Block Bindings API. | Block sidebar → **Dynamic data** |
| **Settings:** breakpoints, page width, gutter, and a global on/off switch for templates | **DF Builder → Settings** |

The breakpoint tabs follow the editor's device preview: Desktop maps to Desktop, Tablet to Tablet, and Mobile to Phone.

## How styles reach the page

- Every styled block gets a stable `dfb-<uid>` class. Its CSS comes from `schema/style-properties.json`, through `src/shared/css-generator.js` in the editor and `includes/class-style-engine.php` on the front end. **These two must stay identical.** `tests/fixtures/css.json` is the parity contract, and both test suites run it.
- CSS for the current post and the active templates is printed in `<head>`. Blocks discovered later in the render (query loops, reusable blocks) get their CSS in the footer.
- Global classes compile to `wp-content/uploads/df-builder/classes.css`. If uploads isn't writable, the CSS is printed inline instead.
- Values are validated against the schema's types, units, keywords and an allow-list of functions. Anything that could break out of a declaration is dropped.

## Development

```bash
npm install
npm run build        # or: npm start (watch)
npm test             # Jest: CSS generator + parity fixtures
npm run lint:js
composer install && composer test   # PHPUnit: Style_Engine parity + Conditions
npx wp-env start     # local WP at http://localhost:8888 (needs Docker)
npm run plugin-zip   # installable zip (uses the "files" list in package.json)
```

## Template tips

- Header and footer templates default to *Entire site*. Use exclude rules for landing pages.
- In a **content** template, add the **Post Content** block where the page body should go. For archives, use a core **Query Loop**.
- If several templates of one type match, the highest priority wins. Ties go to the more specific rule (a specific post beats a term, which beats a post type, which beats the entire site).
- To fall back to the theme everywhere without deleting anything, turn off *Use DF Builder templates* in Settings.
