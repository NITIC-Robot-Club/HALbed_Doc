# Article Home: tag multi-select review

Date: 2026-10-27
Scope: Article Home, from opening filters through selecting tags, reviewing cards, clearing filters, and reloading the URL. Checked in the in-app browser at its narrow viewport; the previous Article Home screenshot and `.ui-review/learned.md` were the visual references. Existing project direction is retained: neutral documentation surfaces, strong article titles, compact metadata, and no ornamental controls.

## Interaction and state inventory

| # | State or action | Intent | Finding | Evidence and decision | Status |
|---:|---|---|---|---|---|
| 1 | Open Article Home with a category query | See the requested category’s articles | No issue | Category is restored and three cards appear; heading gives the result count. | Done |
| 2 | Open “タグ・並び順” | Find tag controls without obscuring the article list by default | No issue | The disclosure keeps the initial finder compact and clearly indicates when filters are active. | Done |
| 3 | Search within tag choices | Reach a known tag in a long list | No issue | Entering “GPIO” narrows the candidate list; clearing the field restores the full list. | Done |
| 4 | Read candidate counts | Estimate the effect of adding a tag | No issue | Counts update against category, keyword, and other selected tags; this avoids presenting global counts as current results. | Done |
| 5 | Scroll the tag candidates | Reach tags beyond the first visible rows | No issue | The bounded list has its own visible scrollbar; the search field and selected controls remain outside that scroll region. | Done |
| 6 | Select one tag | Apply a filter and confirm the result | No issue | The result count and selected-tag chip update immediately; the URL uses `tags=`. | Done |
| 7 | Select two or more tags | Narrow results to articles containing every selected tag | No issue | Tutorial + MCU reduced three results to two; adding GPIO reduced them to one. The helper states the AND condition. | Done |
| 8 | Remove one selected-tag chip | Widen results without reopening the chooser | No issue | Each chip has its own button and accessible remove name; the result list updates in place. | Done |
| 9 | Remove the final selected tag inside the chooser | Continue adjusting criteria without losing the control’s position | Body-operation friction, fixed | The chooser previously closed when the last tag was removed because its open state followed the selection count. Its disclosure state is now independent and remains open after deselection. | Done |
| 10 | Search for a term with no matches | Understand the empty state and recover | No issue | “条件に合う記事がありません。” is paired with clear-filter actions in the toolbar and beside the empty message. The nearby action remains useful when the toolbar is out of view. | Done |
| 11 | Clear all filters | Return to the discovery overview | No issue | The search field, category, and selected tags clear together; focus returns to the article search field. | Done |
| 12 | Reload a multi-tag URL | Keep the current search shareable and restorable | No issue | Reload restored the three checked tags and the one matching result. | Done |
| 13 | Open a legacy `?tag=STM32` URL | Preserve existing inbound links | No issue | The old parameter selected STM32 and was normalized to `?tags=STM32`. | Done |
| 14 | Compare article cards in a grid row | Scan titles and descriptions at a glance | No issue in layout rules | The grid stretches cards to the tallest item within each row. On narrow screens cards form one column, so each row naturally takes its own content height rather than adding large blank areas. | Done |

## Copy review

| # | Location | Current wording | Axis | Decision | Status |
|---:|---|---|---|---|---|
| 1 | Disclosure | タグ・並び順 | 主 | Names both controls in the collapsed label. | Done |
| 2 | Tag legend | タグ / 複数選択 | 指 | Makes the selection model visible before interaction. | Done |
| 3 | Candidate search | タグ名で候補を絞り込む | 具 | Names what the field searches and what it changes. | Done |
| 4 | Filter explanation | 選択したすべてのタグを含む記事に絞り込みます。 | 誤 | Explains AND behavior directly; prevents users expecting an either-tag match. | Done |
| 5 | No candidate match | 一致するタグがありません。 | 指 | Describes the empty candidate list; the search input remains available for correction. | Done |
| 6 | Selected chip action | `{tag} を解除` | 具 | Announces which tag will be removed for assistive technology. | Done |

## Visual direction and remaining verification

- The user-provided Article Home screenshot and the project’s existing discovery styles were the reference lock. The new panel follows the established 6–8px control/card geometry, with a soft neutral gray surface; selected rows and chips use the same gray rather than the previous blue-tinted surface.
- Card equalization is provided by the grid row stretching to the tallest card. Article descriptions and tags remain visible; mobile stays content-height to avoid oversized cards.
- The live browser screenshot confirmed the narrow layout, gray filter surface, scrollable options, selected state, and result count. A production build was attempted, but VitePress could not create its temporary Vue junction inside the managed worktree (`EPERM`/access denied). This is an environment limitation; build status is unverified.
