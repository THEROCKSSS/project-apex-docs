# Project Apex public research guide

Updated 18 October 2026. This repository contains the sanitized website only:
research explanations, measured progress and actual reconstructed C samples.
Game binaries/assets, credentials, private hosts and raw logs stay excluded.

The fresh compiled checkpoint contains **174 functions / 6,504 executable bytes**
of 55,306,761: **0.011759864%**, with zero complete binaries rebuilt. The enlarged
treemap represents the matching subset; the full-scope bar keeps its real scale.

The latest addition is the complete 155-byte TeamManager.GetXP caller. Its typed
SSE2 source reproduces the observed float conversions and passes 30,438 finite
calls through explicitly owned test helpers. Four CALLs, eight data references
and the complete native unwind extent are pinned. The native math helper and
constants receive zero dependency credit; the actual XP curve remains external.
The fifth expandable panel contains the actual source used by this proof.

Independent compilation and runtime review passed. The source suite passed
1,054 Python and 68 JavaScript tests, with one existing Python warning. Public
publication retains the six-file allowlist and checks credentials/private hosts,
exact canonical assets and measured graph. This commit's HTTPS/browser readback
occurs after publication; prior 173-row evidence belongs to the previous build.

The server-authorized profile HTTP lookup remains source-only and undeployed;
it is not wired into native admission. The full goal stays active: complete
reconstruction, live profile continuity, unassisted flight/landing, universal
game setup, independent accounts/networks and custom content still need work.
