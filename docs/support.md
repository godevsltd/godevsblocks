# Support & License

---

## Getting Support

### WordPress.org Support Forum (Primary)

The official support channel for GoBlocks is the WordPress.org support forum:

**[wordpress.org/support/plugin/goblocks](https://wordpress.org/support/plugin/goblocks)**

This is a public forum monitored by the GoBlocks team. Before posting:

1. Search existing threads — your question may already be answered.
2. Check the [FAQ](../faq.md) and [Troubleshooting](../troubleshooting.md) pages.
3. If posting a new thread, include:
   - Your WordPress version (found in **Dashboard → About WordPress**)
   - Your PHP version (found in **Tools → Site Health → Info → Server**)
   - GoBlocks version (found in **Plugins → Installed Plugins**)
   - A clear description of the issue and steps to reproduce
   - Any error messages from the browser console or PHP debug log

### Plugin Homepage

[godevs.net/goblocks](https://godevs.net/goblocks)

### Author Website

[godevs.net](https://godevs.net/)

---

## Reporting Bugs

Found a bug? Report it on the WordPress.org support forum (link above) with:

- A clear title summarizing the issue
- Steps to reproduce
- Expected behavior vs. actual behavior
- Screenshots if relevant
- Your environment details (WP version, PHP version, active theme, active plugins)

**Security vulnerabilities** should not be reported publicly. See [Security → Reporting a Vulnerability](security.md#reporting-a-security-vulnerability).

---

## Feature Requests

Have an idea for a new block, a new pattern, or a new option? Post it on the support forum with the prefix `[Feature Request]` in the title. The GoBlocks team reviews all feature requests, though we cannot guarantee implementation of every suggestion.

---

## Contributing

GoBlocks is open source under the GPL-2.0-or-later license. Contributions are welcome.

- **Bug fixes**: Submit a patch or description on the support forum.
- **Translations**: Contribute on [translate.wordpress.org/projects/wp-plugins/goblocks](https://translate.wordpress.org/projects/wp-plugins/goblocks). See [Translation](translation.md).
- **Code contributions**: See the [Developer Guide](developer/guide.md) for build instructions and coding standards.

---

## Reviews

If GoBlocks has been useful to you, leaving a review on WordPress.org helps other users discover it and supports continued development:

[Leave a review on WordPress.org](https://wordpress.org/support/plugin/goblocks/reviews/#new-post)

---

## License

GoBlocks is licensed under the **GNU General Public License v2.0 or later**.

```
GoBlocks — Blocks Anywhere
Copyright (C) 2026 godevs

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 2 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.
```

**Full license text:** [gnu.org/licenses/gpl-2.0.html](https://www.gnu.org/licenses/gpl-2.0.html)

### What the GPL-2.0+ License Means for You

- **You can use GoBlocks** on any WordPress site, including commercial sites, without restriction.
- **You can modify GoBlocks** for your own use or for your clients.
- **You can distribute modified versions**, but you must distribute them under the same GPL-2.0+ license and make the source code available.
- **You cannot make GoBlocks proprietary** — derivative works must remain open source.

### Third-Party Libraries

GoBlocks bundles the following third-party libraries. Each is compatible with GPL-2.0+:

| Library | License | Use |
|---|---|---|
| [lottie-web](https://github.com/airbnb/lottie-web) | MIT | Lottie Animation block player |
| [@wordpress/scripts](https://github.com/WordPress/gutenberg/tree/trunk/packages/scripts) | GPL-2.0-or-later | Build tooling (dev dependency only) |
| [@wordpress/i18n](https://github.com/WordPress/gutenberg/tree/trunk/packages/i18n) | GPL-2.0-or-later | Internationalization in block editor |
| [@wordpress/blocks](https://github.com/WordPress/gutenberg/tree/trunk/packages/blocks) | GPL-2.0-or-later | Block registration API |

Dev dependencies (not included in the distributed plugin ZIP) include additional MIT-licensed tools (TypeScript, ESLint, webpack, etc.).